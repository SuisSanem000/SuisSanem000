/**
 * Gated Sequential Integration Pipeline (`src/merge.ts`)
 *
 * 1. Validation Gate: Runs `npx tsc --noEmit` inside each isolated worktree
 *    (in parallel across active workers) before allowing any branch into the merge queue.
 * 2. Sequential Rebase/Merge Queue: Uses an async FIFO mutex to rebase and merge
 *    passing `feature/agent-XX` branches onto `main` strictly one at a time,
 *    preventing `.git/index.lock` collisions and race conditions.
 * 3. Conflict Recovery: Automatically aborts failed rebases/merges so a single faulty
 *    agent never blocks the integration pipeline for the other 15 agents.
 */

import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { WorktreeDescriptor, WorktreeManager } from './worktree.js';

const execFileAsync = promisify(execFile);

export interface ValidationResult {
  passed: boolean;
  diagnostics: string;
}

export interface MergeResult {
  merged: boolean;
  commitHash?: string;
  error?: string;
}

export class GatedMergePipeline {
  private readonly worktreeManager: WorktreeManager;
  private mergeMutex: Promise<void> = Promise.resolve();

  constructor(worktreeManager: WorktreeManager) {
    this.worktreeManager = worktreeManager;
  }

  /**
   * Builds an environment with PATH augmented for local `node_modules/.bin` and `~/.bun/bin`
   * so `npx tsc --noEmit` works seamlessly across Node and Bun environments.
   */
  private buildExecEnv(): NodeJS.ProcessEnv {
    const home = process.env.HOME || '';
    const extraPaths = [
      path.join(this.worktreeManager.projectRoot, 'node_modules', '.bin'),
      path.join(home, '.bun', 'bin'),
      '/opt/homebrew/bin',
      '/usr/local/bin',
    ];
    return {
      ...process.env,
      PATH: `${extraPaths.join(path.delimiter)}${path.delimiter}${process.env.PATH || ''}`,
    };
  }

  /**
   * Runs `npx tsc --noEmit` inside the agent's isolated worktree to verify
   * strict TypeScript compilation before allowing a commit or merge.
   */
  public async validateWorktreeTypeScript(desc: WorktreeDescriptor): Promise<ValidationResult> {
    const env = this.buildExecEnv();
    const localTsc = path.join(
      this.worktreeManager.projectRoot,
      'node_modules',
      'typescript',
      'bin',
      'tsc'
    );

    try {
      // Execute `npx tsc --noEmit` inside the worktree project directory
      try {
        await execFileAsync('npx', ['tsc', '--noEmit'], {
          cwd: desc.projectDir,
          env,
          timeout: 30_000,
        });
      } catch (npxErr: unknown) {
        // Fallback if `npx` binary is not on host PATH (e.g. pure Bun environment)
        const msg = String(npxErr);
        if (msg.includes('ENOENT') && fs.existsSync(localTsc)) {
          const runtime = fs.existsSync(path.join(process.env.HOME || '', '.bun', 'bin', 'bun'))
            ? path.join(process.env.HOME || '', '.bun', 'bin', 'bun')
            : process.execPath;
          await execFileAsync(runtime, [localTsc, '--noEmit'], {
            cwd: desc.projectDir,
            env,
            timeout: 30_000,
          });
        } else {
          throw npxErr;
        }
      }

      return {
        passed: true,
        diagnostics: 'tsc --noEmit passed (0 errors)',
      };
    } catch (err: unknown) {
      const stdout =
        err && typeof err === 'object' && 'stdout' in err
          ? String((err as { stdout?: unknown }).stdout)
          : '';
      const stderr =
        err && typeof err === 'object' && 'stderr' in err
          ? String((err as { stderr?: unknown }).stderr)
          : String(err);
      const combined = `${stdout}\n${stderr}`.trim();
      return {
        passed: false,
        diagnostics: combined.split('\n').slice(0, 3).join(' | ') || 'TypeScript check failed',
      };
    }
  }

  /**
   * Commits the validated file inside the agent's isolated worktree branch (`feature/agent-XX`).
   */
  public commitInsideWorktree(desc: WorktreeDescriptor, relativeTargetFile: string, taskTitle: string): string {
    // Remove temporary symlinked node_modules before staging
    const symlinkedModules = path.join(desc.projectDir, 'node_modules');
    if (fs.existsSync(symlinkedModules)) {
      try {
        const stat = fs.lstatSync(symlinkedModules);
        if (stat.isSymbolicLink()) {
          fs.unlinkSync(symlinkedModules);
        }
      } catch {
        // Ignore
      }
    }

    const fileToStage = this.worktreeManager.relProjectPath
      ? path.join(this.worktreeManager.relProjectPath, relativeTargetFile)
      : relativeTargetFile;

    this.worktreeManager.git(['add', fileToStage], desc.worktreeRoot);
    this.worktreeManager.git(
      ['commit', '--allow-empty', '-m', `feat(${desc.id}): implement ${taskTitle}`],
      desc.worktreeRoot
    );
    return this.worktreeManager.git(['rev-parse', '--short', 'HEAD'], desc.worktreeRoot);
  }

  /**
   * Enqueues a validated agent branch into the sequential rebase + merge pipeline.
   * Only 1 branch can rebase/merge onto `main` at a time.
   */
  public enqueueSequentialMerge(
    desc: WorktreeDescriptor,
    relativeTargetFile: string,
    taskTitle: string
  ): Promise<MergeResult> {
    const runMerge = async (): Promise<MergeResult> => {
      try {
        // Step 1: Commit inside the isolated worktree branch
        this.commitInsideWorktree(desc, relativeTargetFile, taskTitle);

        // Step 2: Rebase the feature branch onto the latest `main` inside the worktree
        try {
          this.worktreeManager.git(['rebase', 'main'], desc.worktreeRoot);
        } catch (rebaseErr: unknown) {
          try {
            this.worktreeManager.git(['rebase', '--abort'], desc.worktreeRoot);
          } catch {
            // Ignore abort error
          }
          return {
            merged: false,
            error: `Rebase conflict on ${desc.branch}: ${String(rebaseErr)}`,
          };
        }

        // Step 3: Fast-forward / merge `feature/agent-XX` into `main` on the primary worktree
        try {
          this.worktreeManager.git(
            [
              'merge',
              '--no-ff',
              desc.branch,
              '-m',
              `merge(${desc.id}): integrate validated ${desc.branch} (${taskTitle})`,
            ],
            this.worktreeManager.projectRoot
          );
        } catch (mergeErr: unknown) {
          try {
            this.worktreeManager.git(['merge', '--abort'], this.worktreeManager.projectRoot);
          } catch {
            // Ignore abort error
          }
          return {
            merged: false,
            error: `Merge conflict on main for ${desc.branch}: ${String(mergeErr)}`,
          };
        }

        const commitHash = this.worktreeManager.git(
          ['rev-parse', '--short', 'HEAD'],
          this.worktreeManager.projectRoot
        );
        return {
          merged: true,
          commitHash,
        };
      } catch (err: unknown) {
        return {
          merged: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    };

    const next = this.mergeMutex.then(runMerge, runMerge);
    this.mergeMutex = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }
}
