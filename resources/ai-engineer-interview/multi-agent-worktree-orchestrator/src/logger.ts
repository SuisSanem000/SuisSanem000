/**
 * Live Terminal Dashboard & Structured Status Logger (`src/logger.ts`)
 *
 * Tracks all 16 concurrent agent workers, their isolated Git worktree paths,
 * lifecycle states (`QUEUED` -> `DISPATCHED` -> `TESTING` -> `MERGED` / `FAILED`),
 * and active OpenRouter API rate-limit semaphore / token-bucket slots.
 */

export type AgentStatus = 'QUEUED' | 'DISPATCHED' | 'TESTING' | 'MERGED' | 'FAILED';

export interface AgentWorkerState {
  id: string;              // e.g. "agent-01"
  branch: string;          // e.g. "feature/agent-01"
  worktreePath: string;    // e.g. ".worktrees/agent-01"
  taskTitle: string;       // e.g. "slugify & camelCase string utils"
  targetFile: string;      // e.g. "src/utils/agent01_string_slug.ts"
  status: AgentStatus;
  mode: 'openrouter' | 'cli' | 'mock';
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  detail: string;
}

export interface RateLimiterTelemetry {
  activeSlots: number;
  maxSlots: number;
  availableTokens: number;
  maxTokens: number;
  totalRequestsDispatched: number;
}

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function formatStatusBadge(status: AgentStatus): string {
  const padded = status.padEnd(10, ' ');
  switch (status) {
    case 'QUEUED':
      return `${ANSI.gray}${padded}${ANSI.reset}`;
    case 'DISPATCHED':
      return `${ANSI.yellow}${ANSI.bold}${padded}${ANSI.reset}`;
    case 'TESTING':
      return `${ANSI.cyan}${ANSI.bold}${padded}${ANSI.reset}`;
    case 'MERGED':
      return `${ANSI.green}${ANSI.bold}${padded}${ANSI.reset}`;
    case 'FAILED':
      return `${ANSI.red}${ANSI.bold}${padded}${ANSI.reset}`;
  }
}

function renderSlotBar(used: number, max: number): string {
  const clamped = Math.max(0, Math.min(max, Math.round(used)));
  const filled = '█'.repeat(clamped);
  const empty = '░'.repeat(Math.max(0, max - clamped));
  return `[${ANSI.cyan}${filled}${ANSI.gray}${empty}${ANSI.reset}] ${clamped}/${max}`;
}

export class TerminalDashboard {
  private workers: Map<string, AgentWorkerState> = new Map();
  private rateTelemetry: RateLimiterTelemetry = {
    activeSlots: 0,
    maxSlots: 4,
    availableTokens: 4,
    maxTokens: 4,
    totalRequestsDispatched: 0,
  };
  private events: string[] = [];
  private suiteStartedAt: number = Date.now();
  private interactive: boolean;

  constructor(interactive: boolean = Boolean(process.stdout.isTTY)) {
    this.interactive = interactive;
  }

  public registerWorkers(initialStates: AgentWorkerState[]): void {
    this.suiteStartedAt = Date.now();
    for (const w of initialStates) {
      this.workers.set(w.id, { ...w });
    }
    this.render('Initialized 16 isolated Git worktrees');
  }

  public updateWorker(
    id: string,
    patch: Partial<Omit<AgentWorkerState, 'id'>>,
    eventMessage?: string
  ): void {
    const current = this.workers.get(id);
    if (!current) return;

    const now = Date.now();
    if (patch.status === 'DISPATCHED' && !current.startedAt) {
      current.startedAt = now;
    }
    if ((patch.status === 'MERGED' || patch.status === 'FAILED') && current.startedAt) {
      current.finishedAt = now;
      current.durationMs = now - current.startedAt;
    }

    Object.assign(current, patch);
    if (eventMessage) {
      this.pushEvent(`[${id}] ${eventMessage}`);
    }
    this.render(eventMessage);
  }

  public updateRateLimiter(patch: Partial<RateLimiterTelemetry>): void {
    Object.assign(this.rateTelemetry, patch);
  }

  public pushEvent(message: string): void {
    const elapsedSec = ((Date.now() - this.suiteStartedAt) / 1000).toFixed(2).padStart(6, ' ');
    this.events.push(`${ANSI.gray}+${elapsedSec}s${ANSI.reset} ${message}`);
    if (this.events.length > 6) {
      this.events.shift();
    }
  }

  public render(latestNote?: string): void {
    const list = Array.from(this.workers.values());
    const counts = {
      QUEUED: list.filter((w) => w.status === 'QUEUED').length,
      DISPATCHED: list.filter((w) => w.status === 'DISPATCHED').length,
      TESTING: list.filter((w) => w.status === 'TESTING').length,
      MERGED: list.filter((w) => w.status === 'MERGED').length,
      FAILED: list.filter((w) => w.status === 'FAILED').length,
    };

    if (!this.interactive) {
      if (latestNote) {
        const elapsed = ((Date.now() - this.suiteStartedAt) / 1000).toFixed(2);
        console.log(
          `[+${elapsed}s] [Slots ${this.rateTelemetry.activeSlots}/${this.rateTelemetry.maxSlots} | ` +
            `Q:${counts.QUEUED} D:${counts.DISPATCHED} T:${counts.TESTING} M:${counts.MERGED} F:${counts.FAILED}] ${latestNote}`
        );
      }
      return;
    }

    const lines: string[] = [];
    lines.push('\x1b[2J\x1b[H'); // Clear screen and home cursor in interactive TTY
    lines.push(
      `${ANSI.bold}${ANSI.cyan}╔══════════════════════════════════════════════════════════════════════════════════════════════╗${ANSI.reset}`
    );
    lines.push(
      `${ANSI.bold}${ANSI.cyan}║     16-AGENT GIT WORKTREE & OPENROUTER CONCURRENCY ORCHESTRATOR — LIVE DASHBOARD            ║${ANSI.reset}`
    );
    lines.push(
      `${ANSI.bold}${ANSI.cyan}╚══════════════════════════════════════════════════════════════════════════════════════════════╝${ANSI.reset}`
    );

    const slotBar = renderSlotBar(this.rateTelemetry.activeSlots, this.rateTelemetry.maxSlots);
    const tokenBar = renderSlotBar(
      Math.floor(this.rateTelemetry.availableTokens),
      this.rateTelemetry.maxTokens
    );
    lines.push(
      `  ${ANSI.bold}API Concurrency Gate:${ANSI.reset} ${slotBar}   ` +
        `${ANSI.bold}Token Bucket:${ANSI.reset} ${tokenBar}   ` +
        `${ANSI.bold}Dispatched:${ANSI.reset} ${this.rateTelemetry.totalRequestsDispatched}/16`
    );
    lines.push(
      `  ${ANSI.bold}Pipeline Summary:${ANSI.reset}     ` +
        `QUEUED: ${counts.QUEUED} | ` +
        `${ANSI.yellow}DISPATCHED: ${counts.DISPATCHED}${ANSI.reset} | ` +
        `${ANSI.cyan}TESTING: ${counts.TESTING}${ANSI.reset} | ` +
        `${ANSI.green}MERGED: ${counts.MERGED}${ANSI.reset} | ` +
        `${ANSI.red}FAILED: ${counts.FAILED}${ANSI.reset}`
    );
    lines.push(
      `${ANSI.gray}────────────────────────────────────────────────────────────────────────────────────────────────${ANSI.reset}`
    );
    lines.push(
      `  ${ANSI.bold}${'AGENT'.padEnd(9)} ${'WORKTREE PATH'.padEnd(22)} ${'STATUS'.padEnd(10)} ${'TIME'.padEnd(8)} ${'TASK / VALIDATION DETAIL'}${ANSI.reset}`
    );
    lines.push(
      `${ANSI.gray}────────────────────────────────────────────────────────────────────────────────────────────────${ANSI.reset}`
    );

    for (const w of list) {
      const timeStr =
        w.durationMs !== undefined
          ? `${(w.durationMs / 1000).toFixed(2)}s`.padEnd(8)
          : w.startedAt !== undefined
            ? `${((Date.now() - w.startedAt) / 1000).toFixed(1)}s*`.padEnd(8)
            : '-'.padEnd(8);

      lines.push(
        `  ${ANSI.bold}${w.id.padEnd(9)}${ANSI.reset} ` +
          `${ANSI.gray}${w.worktreePath.padEnd(22)}${ANSI.reset} ` +
          `${formatStatusBadge(w.status)} ` +
          `${timeStr} ` +
          `${w.detail.slice(0, 44)}`
      );
    }

    lines.push(
      `${ANSI.gray}────────────────────────────────────────────────────────────────────────────────────────────────${ANSI.reset}`
    );
    lines.push(`  ${ANSI.bold}Recent Orchestrator Events:${ANSI.reset}`);
    for (const ev of this.events) {
      lines.push(`   ${ev}`);
    }
    process.stdout.write(lines.join('\n') + '\n');
  }

  public printFinalTable(): void {
    const list = Array.from(this.workers.values());
    const totalMs = Date.now() - this.suiteStartedAt;
    console.log('\n' + '═'.repeat(98));
    console.log(
      `${ANSI.bold}${ANSI.cyan}  FINAL 16-AGENT WORKTREE ORCHESTRATION REPORT (Total Elapsed: ${(totalMs / 1000).toFixed(2)}s)${ANSI.reset}`
    );
    console.log('═'.repeat(98));
    console.log(
      `  ${'AGENT'.padEnd(10)} ${'WORKTREE PATH'.padEnd(23)} ${'BRANCH'.padEnd(18)} ${'STATUS'.padEnd(10)} ${'TIME'.padEnd(8)} ${'ARTIFACT'}`
    );
    console.log('─'.repeat(98));
    for (const w of list) {
      const dur = w.durationMs !== undefined ? `${(w.durationMs / 1000).toFixed(2)}s` : '-';
      console.log(
        `  ${w.id.padEnd(10)} ${w.worktreePath.padEnd(23)} ${w.branch.padEnd(18)} ${formatStatusBadge(w.status)} ${dur.padEnd(8)} ${w.targetFile}`
      );
    }
    console.log('═'.repeat(98) + '\n');
  }
}

