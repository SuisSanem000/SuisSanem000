/**
 * Worktree Lifecycle Manager (`src/worktree.ts`)
 *
 * Programmatically provisions and tears down 16 isolated Git worktrees:
 *   .worktrees/agent-01 (branch: feature/agent-01)
 *   ...
 *   .worktrees/agent-16 (branch: feature/agent-16)
 *
 * Includes:
 * - Stale Git lock cleanup (.git/index.lock, .git/config.lock)
 * - `git worktree prune` before provisioning and after teardown
 * - Symlinked `node_modules` inside each worktree for zero-install `tsc --noEmit` validation
 * - Graceful teardown of worktrees and temporary feature branches
 */

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface WorktreeDescriptor {
  id: string;               // e.g. "agent-01"
  index: number;            // 1..16
  branch: string;           // e.g. "feature/agent-01"
  relativeWorktreeDir: string; // e.g. ".worktrees/agent-01"
  worktreeRoot: string;     // Absolute path to worktree checkout
  projectDir: string;       // Absolute path to the TypeScript project inside the worktree
}

export class WorktreeManager {
  public readonly projectRoot: string;
  public readonly repoRoot: string;
  public readonly relProjectPath: string;
  public readonly worktreesBaseDir: string;
  public readonly totalAgents: number;

  constructor(projectRoot: string = process.cwd(), totalAgents: number = 16) {
    this.projectRoot = path.resolve(projectRoot);
    this.totalAgents = totalAgents;
    this.worktreesBaseDir = path.join(this.projectRoot, '.worktrees');
    this.repoRoot = this.resolveRepoRoot();
    this.relProjectPath = path.relative(this.repoRoot, this.projectRoot);
  }

  private resolveRepoRoot(): string {
    try {
      const out = execFileSync('git', ['rev-parse', '--show-toplevel'], {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
      return out;
    } catch {
      // Initialize a local repository on branch `main` if none exists
      execFileSync('git', ['init', '-b', 'main'], {
        cwd: this.projectRoot,
        stdio: 'ignore',
      });
      execFileSync('git', ['add', '-A'], { cwd: this.projectRoot, stdio: 'ignore' });
      execFileSync(
        'git',
        ['commit', '--allow-empty', '-m', 'chore: initialize orchestrator repository on main'],
        { cwd: this.projectRoot, stdio: 'ignore' }
      );
      return this.projectRoot;
    }
  }

  /**
   * Executes a git command with automatic retry if a transient `.lock` collision occurs.
   */
  public git(args: string[], cwd: string = this.projectRoot, retries: number = 3): string {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return execFileSync('git', args, {
          cwd,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
        }).trim();
      } catch (err: unknown) {
        const stderr =
          err && typeof err === 'object' && 'stderr' in err
            ? String((err as { stderr?: unknown }).stderr)
            : String(err);
        if (attempt < retries && (stderr.includes('.lock') || stderr.includes('Unable to create'))) {
          this.removeStaleLocks();
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 80 * attempt);
          continue;
        }
        throw new Error(`git ${args.join(' ')} failed: ${stderr.trim()}`);
      }
    }
    return '';
  }

  /**
   * Removes stale `.lock` files inside `.git` and runs `git worktree prune`.
   */
  public removeStaleLocks(): void {
    const gitDir = path.join(this.repoRoot, '.git');
    const lockCandidates = [
      path.join(gitDir, 'index.lock'),
      path.join(gitDir, 'config.lock'),
      path.join(gitDir, 'HEAD.lock'),
    ];
    for (const lockFile of lockCandidates) {
      if (fs.existsSync(lockFile)) {
        try {
          fs.unlinkSync(lockFile);
        } catch {
          // Ignore if already removed
        }
      }
    }

    try {
      execFileSync('git', ['worktree', 'prune'], {
        cwd: this.projectRoot,
        stdio: 'ignore',
      });
    } catch {
      // Ignore prune errors on fresh repo
    }
  }

  /**
   * Ensures the current project files are committed on `main` before branching worktrees
   * so every worktree receives `tsconfig.json` and `package.json`.
   */
  public ensureBaselineSyncedOnMain(): void {
    this.removeStaleLocks();
    const currentBranch = this.git(['rev-parse', '--abbrev-ref', 'HEAD'], this.projectRoot);
    if (currentBranch !== 'main') {
      try {
        this.git(['checkout', 'main'], this.projectRoot);
      } catch {
        this.git(['checkout', '-b', 'main'], this.projectRoot);
      }
    }

    const status = this.git(['status', '--porcelain', '--', '.'], this.projectRoot);
    if (status.length > 0) {
      this.git(['add', '.'], this.projectRoot);
      try {
        this.git(
          ['commit', '-m', 'chore(orchestrator): sync baseline project files before worktree fan-out'],
          this.projectRoot
        );
      } catch {
        // Ignore if nothing to commit
      }
    }
  }

  /**
   * Builds descriptors for `agent-01` .. `agent-16`.
   */
  public getDescriptors(): WorktreeDescriptor[] {
    const list: WorktreeDescriptor[] = [];
    for (let i = 1; i <= this.totalAgents; i++) {
      const padded = String(i).padStart(2, '0');
      const id = `agent-${padded}`;
      const branch = `feature/${id}`;
      const relativeWorktreeDir = `.worktrees/${id}`;
      const worktreeRoot = path.join(this.projectRoot, '.worktrees', id);
      const projectDir = this.relProjectPath
        ? path.join(worktreeRoot, this.relProjectPath)
        : worktreeRoot;

      list.push({
        id,
        index: i,
        branch,
        relativeWorktreeDir,
        worktreeRoot,
        projectDir,
      });
    }
    return list;
  }

  /**
   * Provisions all 16 isolated Git worktrees branched off `main`.
   */
  public provisionAll(): WorktreeDescriptor[] {
    // 1. Clean any leftover worktrees, stale branches, or previous src/utils artifacts
    this.teardownAll({ quiet: true, cleanUtils: true });
    this.ensureBaselineSyncedOnMain();

    fs.mkdirSync(this.worktreesBaseDir, { recursive: true });
    const descriptors = this.getDescriptors();

    for (const desc of descriptors) {
      // Create worktree at .worktrees/agent-XX on new branch feature/agent-XX off main
      this.git(['worktree', 'add', '-B', desc.branch, desc.worktreeRoot, 'main'], this.projectRoot);

      // Ensure projectDir exists inside the worktree
      fs.mkdirSync(path.join(desc.projectDir, 'src', 'utils'), { recursive: true });

      // Symlink root node_modules into worktree projectDir so `tsc --noEmit` works with zero install
      const rootNodeModules = path.join(this.projectRoot, 'node_modules');
      const worktreeNodeModules = path.join(desc.projectDir, 'node_modules');
      if (fs.existsSync(rootNodeModules) && !fs.existsSync(worktreeNodeModules)) {
        try {
          fs.symlinkSync(rootNodeModules, worktreeNodeModules, 'dir');
        } catch {
          // Ignore if symlink already exists
        }
      }
    }

    return descriptors;
  }

  /**
   * Tears down all 16 worktrees, prunes metadata, and deletes `feature/agent-*` branches.
   */
  public teardownAll(options: { quiet?: boolean; cleanUtils?: boolean } = {}): void {
    this.removeStaleLocks();
    const descriptors = this.getDescriptors();

    for (const desc of descriptors) {
      if (fs.existsSync(desc.worktreeRoot)) {
        try {
          this.git(['worktree', 'remove', '--force', desc.worktreeRoot], this.projectRoot);
        } catch {
          fs.rmSync(desc.worktreeRoot, { recursive: true, force: true });
        }
      }
    }

    if (fs.existsSync(this.worktreesBaseDir)) {
      fs.rmSync(this.worktreesBaseDir, { recursive: true, force: true });
    }

    this.removeStaleLocks();

    for (const desc of descriptors) {
      try {
        this.git(['branch', '-D', desc.branch], this.projectRoot);
      } catch {
        // Branch did not exist
      }
    }

    if (options.cleanUtils) {
      const utilsDir = path.join(this.projectRoot, 'src', 'utils');
      if (fs.existsSync(utilsDir)) {
        fs.rmSync(utilsDir, { recursive: true, force: true });
      }
      const status = this.git(['status', '--porcelain', '--', '.'], this.projectRoot);
      if (status.length > 0) {
        this.git(['add', '-A', '.'], this.projectRoot);
        try {
          this.git(
            ['commit', '-m', 'chore(orchestrator): clean generated agent artifacts'],
            this.projectRoot
          );
        } catch {
          // Ignore if nothing to commit
        }
      }
    }

    if (!options.quiet) {
      console.log(
        `[WorktreeManager] Cleaned up ${descriptors.length} worktrees (.worktrees/agent-01..16) and deleted feature/agent-* branches.`
      );
    }
  }
}
