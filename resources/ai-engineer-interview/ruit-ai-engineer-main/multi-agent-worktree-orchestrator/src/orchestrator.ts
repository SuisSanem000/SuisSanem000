/**
 * Concurrency Orchestrator & Token-Bucket API Limiter (`src/orchestrator.ts`)
 *
 * Orchestrates 16 concurrent AI agents in isolated Git worktrees (.worktrees/agent-01..16):
 * - Defines 16 disjoint micro-tasks under `src/utils/` (utilities + unit test assertions).
 * - Throttles execution to max 4 concurrent active agents with a Token-Bucket rate limiter.
 * - Supports 3 execution modes:
 *     1. Direct OpenRouter API via `fetch` (`google/gemini-2.5-flash` or `deepseek/deepseek-chat`)
 *     2. Headless Claude Code CLI (`claude -p` spawned inside each worktree with OpenRouter env)
 *     3. `--mock` mode for instant, zero-token deterministic execution during live interviews
 * - Validates every worktree with `npx tsc --noEmit` and merges sequentially onto `main`.
 */

import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AgentWorkerState, TerminalDashboard } from './logger.js';
import { GatedMergePipeline } from './merge.js';
import { WorktreeDescriptor, WorktreeManager } from './worktree.js';

export interface AgentMicroTask {
  id: string;
  title: string;
  targetFile: string;
  prompt: string;
  mockCode: string;
}

export const AGENT_MICRO_TASKS: AgentMicroTask[] = [
  {
    id: 'agent-01',
    title: 'String slugify & URL sanitizer + tests',
    targetFile: 'src/utils/agent01_slugify.ts',
    prompt: 'Write a strict TypeScript utility `slugify(input: string): string` and self-contained unit tests.',
    mockCode: `export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function runTestsAgent01(): boolean {
  if (slugify('Hello, World! 2026') !== 'hello-world-2026') throw new Error('slugify failed basic test');
  if (slugify('  Café & Résumé  ') !== 'cafe-resume') throw new Error('slugify failed accent test');
  return true;
}
runTestsAgent01();
`,
  },
  {
    id: 'agent-02',
    title: 'CamelCase & snake_case converter + tests',
    targetFile: 'src/utils/agent02_case_convert.ts',
    prompt: 'Write strict TypeScript utilities `toCamelCase` and `toSnakeCase` with unit tests.',
    mockCode: `export function toSnakeCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\\s]+/g, '_')
    .toLowerCase();
}

export function toCamelCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/[_-\\s]+([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

export function runTestsAgent02(): boolean {
  if (toSnakeCase('marketplaceListingId') !== 'marketplace_listing_id') throw new Error('toSnakeCase failed');
  if (toCamelCase('marketplace_listing_id') !== 'marketplaceListingId') throw new Error('toCamelCase failed');
  return true;
}
runTestsAgent02();
`,
  },
  {
    id: 'agent-03',
    title: 'Price parser & currency normalizer + tests',
    targetFile: 'src/utils/agent03_price_parser.ts',
    prompt: 'Write a strict TypeScript utility `parseEuropeanPrice(raw: string): number` with unit tests.',
    mockCode: `export function parseEuropeanPrice(raw: string): number {
  const cleaned = raw.replace(/[^0-9,.-]/g, '').trim();
  const normalized = cleaned.includes(',') && cleaned.includes('.')
    ? cleaned.replace(/\\./g, '').replace(',', '.')
    : cleaned.replace(',', '.');
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value) || value < 0) {
    throw new Error(\`Invalid price format: \${raw}\`);
  }
  return Math.round(value * 100) / 100;
}

export function runTestsAgent03(): boolean {
  if (parseEuropeanPrice('19,50 €') !== 19.5) throw new Error('parseEuropeanPrice failed 19,50');
  if (parseEuropeanPrice('1.250,99 EUR') !== 1250.99) throw new Error('parseEuropeanPrice failed thousands');
  return true;
}
runTestsAgent03();
`,
  },
  {
    id: 'agent-04',
    title: 'Moving average & percentile math + tests',
    targetFile: 'src/utils/agent04_math_stats.ts',
    prompt: 'Write strict TypeScript utilities `mean` and `percentile95` with unit tests.',
    mockCode: `export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

export function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export function runTestsAgent04(): boolean {
  if (mean([10, 20, 30]) !== 20) throw new Error('mean failed');
  if (percentile([10, 20, 30, 40, 100], 95) !== 100) throw new Error('percentile failed');
  return true;
}
runTestsAgent04();
`,
  },
  {
    id: 'agent-05',
    title: 'Clamp, lerp & numeric range guard + tests',
    targetFile: 'src/utils/agent05_math_clamp.ts',
    prompt: 'Write strict TypeScript utilities `clamp` and `lerp` with unit tests.',
    mockCode: `export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new Error('min cannot exceed max');
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, alpha: number): number {
  return start + (end - start) * clamp(alpha, 0, 1);
}

export function runTestsAgent05(): boolean {
  if (clamp(150, 0, 100) !== 100) throw new Error('clamp upper bound failed');
  if (lerp(0, 200, 0.25) !== 50) throw new Error('lerp failed');
  return true;
}
runTestsAgent05();
`,
  },
  {
    id: 'agent-06',
    title: 'Array batch chunker + tests',
    targetFile: 'src/utils/agent06_array_chunk.ts',
    prompt: 'Write a generic TypeScript `chunkArray<T>(items: readonly T[], size: number): T[][]` + tests.',
    mockCode: `export function chunkArray<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) throw new Error('chunk size must be positive');
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function runTestsAgent06(): boolean {
  const res = chunkArray([1, 2, 3, 4, 5], 2);
  if (res.length !== 3 || res[2][0] !== 5) throw new Error('chunkArray failed');
  return true;
}
runTestsAgent06();
`,
  },
  {
    id: 'agent-07',
    title: 'Deduplicate by key selector + tests',
    targetFile: 'src/utils/agent07_dedupe_by.ts',
    prompt: 'Write a generic TypeScript `dedupeBy<T, K>(items: readonly T[], keyFn: (item: T) => K): T[]` + tests.',
    mockCode: `export function dedupeBy<T, K>(items: readonly T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of items) {
    const k = keyFn(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
}

export function runTestsAgent07(): boolean {
  const out = dedupeBy([{ id: 'a' }, { id: 'b' }, { id: 'a' }], (x) => x.id);
  if (out.length !== 2) throw new Error('dedupeBy failed');
  return true;
}
runTestsAgent07();
`,
  },
  {
    id: 'agent-08',
    title: 'Exponential backoff with jitter calculator + tests',
    targetFile: 'src/utils/agent08_backoff_jitter.ts',
    prompt: 'Write a TypeScript `computeBackoffMs(attempt: number, baseMs?: number, maxMs?: number): number` + tests.',
    mockCode: `export function computeBackoffMs(attempt: number, baseMs: number = 200, maxMs: number = 10_000): number {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, Math.max(0, attempt)));
  const deterministicJitter = (attempt * 37) % 100;
  return Math.min(maxMs, exp + deterministicJitter);
}

export function runTestsAgent08(): boolean {
  const first = computeBackoffMs(0, 200, 5000);
  const third = computeBackoffMs(2, 200, 5000);
  if (first < 200 || third <= first) throw new Error('computeBackoffMs failed');
  return true;
}
runTestsAgent08();
`,
  },
  {
    id: 'agent-09',
    title: 'FNV-1a deterministic idempotency hash + tests',
    targetFile: 'src/utils/agent09_fnv1a_hash.ts',
    prompt: 'Write a TypeScript 32-bit FNV-1a hash utility `fnv1aHash(payload: string): string` + tests.',
    mockCode: `export function fnv1aHash(payload: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function runTestsAgent09(): boolean {
  const h1 = fnv1aHash('seller-42:item-99:delist');
  const h2 = fnv1aHash('seller-42:item-99:delist');
  if (h1 !== h2 || h1.length !== 8) throw new Error('fnv1aHash failed');
  return true;
}
runTestsAgent09();
`,
  },
  {
    id: 'agent-10',
    title: 'Sensitive PII & token log scrubber + tests',
    targetFile: 'src/utils/agent10_pii_scrubber.ts',
    prompt: 'Write a TypeScript utility `scrubSensitiveFields` to redact bearer tokens and emails + tests.',
    mockCode: `export function scrubSensitiveText(input: string): string {
  return input
    .replace(/Bearer\\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
}

export function runTestsAgent10(): boolean {
  const sample = 'Auth Bearer eyJhbGciOiJIUzI1NiJ9 for seller@example.com';
  const scrubbed = scrubSensitiveText(sample);
  if (scrubbed.includes('eyJhbG') || scrubbed.includes('seller@example.com')) {
    throw new Error('scrubSensitiveText failed');
  }
  return true;
}
runTestsAgent10();
`,
  },
  {
    id: 'agent-11',
    title: 'URL query string builder & parser + tests',
    targetFile: 'src/utils/agent11_query_params.ts',
    prompt: 'Write a TypeScript utility `buildQueryString(params: Record<string, string | number | boolean>): string` + tests.',
    mockCode: `export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => \`\${encodeURIComponent(k)}=\${encodeURIComponent(String(v))}\`);
  return entries.length > 0 ? \`?\${entries.join('&')}\` : '';
}

export function runTestsAgent11(): boolean {
  const q = buildQueryString({ page: 2, sort: 'price asc', empty: undefined });
  if (q !== '?page=2&sort=price%20asc') throw new Error('buildQueryString failed');
  return true;
}
runTestsAgent11();
`,
  },
  {
    id: 'agent-12',
    title: 'Circuit breaker state evaluator + tests',
    targetFile: 'src/utils/agent12_circuit_breaker.ts',
    prompt: 'Write a TypeScript circuit breaker threshold evaluator with unit tests.',
    mockCode: `export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export function evaluateCircuitState(
  failures: number,
  totalRequests: number,
  thresholdRatio: number = 0.15,
  minSampleSize: number = 10
): CircuitState {
  if (totalRequests < minSampleSize) return 'CLOSED';
  return failures / totalRequests >= thresholdRatio ? 'OPEN' : 'CLOSED';
}

export function runTestsAgent12(): boolean {
  if (evaluateCircuitState(5, 20, 0.15, 10) !== 'OPEN') throw new Error('circuit should open');
  if (evaluateCircuitState(1, 20, 0.15, 10) !== 'CLOSED') throw new Error('circuit should stay closed');
  return true;
}
runTestsAgent12();
`,
  },
  {
    id: 'agent-13',
    title: 'JSON schema required-field drift detector + tests',
    targetFile: 'src/utils/agent13_schema_drift.ts',
    prompt: 'Write a TypeScript utility `detectMissingFields(payload: Record<string, unknown>, required: readonly string[]): string[]` + tests.',
    mockCode: `export function detectMissingFields(
  payload: Record<string, unknown>,
  requiredFields: readonly string[]
): string[] {
  return requiredFields.filter(
    (field) => !(field in payload) || payload[field] === undefined || payload[field] === null
  );
}

export function runTestsAgent13(): boolean {
  const missing = detectMissingFields({ id: '123', title: 'Jacket' }, ['id', 'title', 'price']);
  if (missing.length !== 1 || missing[0] !== 'price') throw new Error('detectMissingFields failed');
  return true;
}
runTestsAgent13();
`,
  },
  {
    id: 'agent-14',
    title: 'Levenshtein string similarity scorer + tests',
    targetFile: 'src/utils/agent14_string_similarity.ts',
    prompt: 'Write a TypeScript Levenshtein edit distance utility `editDistance(a: string, b: string): number` + tests.',
    mockCode: `export function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

export function runTestsAgent14(): boolean {
  if (editDistance('vinted', 'vinted') !== 0) throw new Error('editDistance identical failed');
  if (editDistance('kitten', 'sitting') !== 3) throw new Error('editDistance kitten/sitting failed');
  return true;
}
runTestsAgent14();
`,
  },
  {
    id: 'agent-15',
    title: 'HTTP Retry-After header parser + tests',
    targetFile: 'src/utils/agent15_retry_after.ts',
    prompt: 'Write a TypeScript `parseRetryAfterMs(headerVal: string | null | undefined, fallbackMs?: number): number` + tests.',
    mockCode: `export function parseRetryAfterMs(
  headerVal: string | null | undefined,
  fallbackMs: number = 1000
): number {
  if (!headerVal) return fallbackMs;
  const seconds = Number(headerVal.trim());
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }
  return fallbackMs;
}

export function runTestsAgent15(): boolean {
  if (parseRetryAfterMs('5') !== 5000) throw new Error('parseRetryAfterMs numeric failed');
  if (parseRetryAfterMs(undefined, 1500) !== 1500) throw new Error('parseRetryAfterMs fallback failed');
  return true;
}
runTestsAgent15();
`,
  },
  {
    id: 'agent-16',
    title: 'SKU & inventory quantity guard + tests',
    targetFile: 'src/utils/agent16_inventory_guard.ts',
    prompt: 'Write a TypeScript optimistic lock version & stock check utility `canFulfillOrder` + tests.',
    mockCode: `export interface InventorySnapshot {
  sku: string;
  availableQty: number;
  version: number;
}

export function canFulfillOrder(
  snapshot: InventorySnapshot,
  requestedQty: number,
  expectedVersion: number
): { allowed: boolean; nextVersion: number; reason?: string } {
  if (snapshot.version !== expectedVersion) {
    return { allowed: false, nextVersion: snapshot.version, reason: 'VERSION_CONFLICT' };
  }
  if (requestedQty <= 0 || snapshot.availableQty < requestedQty) {
    return { allowed: false, nextVersion: snapshot.version, reason: 'INSUFFICIENT_STOCK' };
  }
  return { allowed: true, nextVersion: snapshot.version + 1 };
}

export function runTestsAgent16(): boolean {
  const ok = canFulfillOrder({ sku: 'JKT-01', availableQty: 1, version: 3 }, 1, 3);
  const conflict = canFulfillOrder({ sku: 'JKT-01', availableQty: 1, version: 4 }, 1, 3);
  if (!ok.allowed || ok.nextVersion !== 4 || conflict.allowed) {
    throw new Error('canFulfillOrder failed');
  }
  return true;
}
runTestsAgent16();
`,
  },
];

/**
 * Semaphore + Token-Bucket Concurrency Limiter.
 * Caps active inflight requests to `maxConcurrent` (4) and refills rate-limit tokens smoothly.
 */
export class TokenBucketRateLimiter {
  private readonly maxConcurrent: number;
  private readonly maxTokens: number;
  private readonly refillIntervalMs: number;
  private activeCount: number = 0;
  private tokens: number;
  private lastRefillTime: number = Date.now();
  private totalDispatched: number = 0;
  private waitQueue: Array<() => void> = [];
  private dashboard: TerminalDashboard;

  constructor(
    dashboard: TerminalDashboard,
    maxConcurrent: number = 4,
    maxTokens: number = 4,
    refillIntervalMs: number = 150
  ) {
    this.dashboard = dashboard;
    this.maxConcurrent = maxConcurrent;
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillIntervalMs = refillIntervalMs;
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillTime;
    if (elapsed >= this.refillIntervalMs) {
      const gained = Math.floor(elapsed / this.refillIntervalMs);
      this.tokens = Math.min(this.maxTokens, this.tokens + gained);
      this.lastRefillTime = now;
    }
  }

  public async acquireSlot(): Promise<void> {
    while (true) {
      this.refillTokens();
      if (this.activeCount < this.maxConcurrent && this.tokens >= 1) {
        this.activeCount += 1;
        this.tokens -= 1;
        this.totalDispatched += 1;
        this.syncTelemetry();
        return;
      }

      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 40);
        this.waitQueue.push(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }

  public releaseSlot(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);
    this.refillTokens();
    this.syncTelemetry();
    const nextWaiter = this.waitQueue.shift();
    if (nextWaiter) {
      nextWaiter();
    }
  }

  private syncTelemetry(): void {
    this.dashboard.updateRateLimiter({
      activeSlots: this.activeCount,
      maxSlots: this.maxConcurrent,
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      totalRequestsDispatched: this.totalDispatched,
    });
  }
}

function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:typescript|ts)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Mode 1: Direct OpenRouter Chat Completions API via `fetch` with exponential backoff on 429.
 */
async function generateViaOpenRouter(task: AgentMicroTask): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  if (!apiKey) {
    throw new Error(
      'Missing OPENROUTER_API_KEY (or ANTHROPIC_AUTH_TOKEN). Pass `--mock` for zero-token execution.'
    );
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/siminshoeibi/multi-agent-worktree-orchestrator',
        'X-Title': '16-Agent Worktree Orchestrator',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content:
              'Return ONLY valid, strict TypeScript code with no markdown fences and no external dependencies.',
          },
          {
            role: 'user',
            content: `${task.prompt}\n\nReference implementation pattern:\n${task.mockCode}`,
          },
        ],
      }),
    });

    if (response.status === 429) {
      const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 150);
      await new Promise((r) => setTimeout(r, backoffMs));
      continue;
    }

    if (!response.ok) {
      throw new Error(`OpenRouter HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty completion from OpenRouter');
    }
    return stripMarkdownFences(content) + '\n';
  }

  throw new Error('Exceeded max retries on OpenRouter 429 rate limit');
}

/**
 * Mode 2: Headless Claude Code CLI (`claude -p "<prompt>"`) executed inside the worktree.
 */
async function generateViaHeadlessClaudeCli(
  desc: WorktreeDescriptor,
  task: AgentMicroTask,
  useMockFallback: boolean
): Promise<string> {
  if (useMockFallback) {
    // Simulate headless CLI invocation latency inside the worktree
    await new Promise((r) => setTimeout(r, 90 + (desc.index % 4) * 35));
    return task.mockCode;
  }

  return new Promise<string>((resolve, reject) => {
    const child = spawn(
      'claude',
      ['-p', `${task.prompt} Output ONLY raw TypeScript code.`, '--output-format', 'text'],
      {
        cwd: desc.projectDir,
        env: {
          ...process.env,
          ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || 'https://openrouter.ai/api',
          ANTHROPIC_AUTH_TOKEN:
            process.env.ANTHROPIC_AUTH_TOKEN || process.env.OPENROUTER_API_KEY || '',
          ANTHROPIC_API_KEY: '',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf-8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code !== 0 || !stdout.trim()) {
        reject(new Error(`claude -p exited with ${code}: ${stderr.trim()}`));
      } else {
        resolve(stripMarkdownFences(stdout) + '\n');
      }
    });
  });
}

/**
 * Mode 3: Deterministic `--mock` mode (0 tokens consumed, real worktrees, real tsc check, real git merges).
 */
async function generateViaMock(desc: WorktreeDescriptor, task: AgentMicroTask): Promise<string> {
  const simulatedLatencyMs = 80 + ((desc.index * 29) % 120);
  await new Promise((r) => setTimeout(r, simulatedLatencyMs));
  return task.mockCode;
}

async function createBarrelIndexFile(projectRoot: string, mergedTasks: AgentMicroTask[]): Promise<void> {
  const utilsDir = path.join(projectRoot, 'src', 'utils');
  fs.mkdirSync(utilsDir, { recursive: true });
  const exportsLines = mergedTasks.map((t) => {
    const baseName = path.basename(t.targetFile, '.ts');
    return `export * from './${baseName}.js';`;
  });
  fs.writeFileSync(path.join(utilsDir, 'index.ts'), exportsLines.join('\n') + '\n', 'utf-8');
}

export async function runOrchestrator(): Promise<void> {
  const args = process.argv.slice(2);
  const isCleanOnly = args.includes('--clean');
  const isMock = args.includes('--mock') || (!process.env.OPENROUTER_API_KEY && !args.includes('--live'));
  const modeArg = args.find((a) => a.startsWith('--mode='))?.split('=')[1];
  const executionMode: 'openrouter' | 'cli' | 'mock' =
    modeArg === 'cli' ? 'cli' : isMock ? 'mock' : 'openrouter';

  const worktreeManager = new WorktreeManager(process.cwd(), 16);

  if (isCleanOnly) {
    worktreeManager.teardownAll({ quiet: false, cleanUtils: true });
    return;
  }

  const dashboard = new TerminalDashboard(Boolean(process.stdout.isTTY) && !args.includes('--no-tty'));
  const rateLimiter = new TokenBucketRateLimiter(dashboard, 4, 4, 120);
  const mergePipeline = new GatedMergePipeline(worktreeManager);

  // 1. Provision 16 isolated Git worktrees (.worktrees/agent-01 .. .worktrees/agent-16)
  const descriptors = worktreeManager.provisionAll();

  const initialWorkerStates: AgentWorkerState[] = descriptors.map((desc, idx) => {
    const task = AGENT_MICRO_TASKS[idx];
    return {
      id: desc.id,
      branch: desc.branch,
      worktreePath: desc.relativeWorktreeDir,
      taskTitle: task.title,
      targetFile: task.targetFile,
      status: 'QUEUED',
      mode: executionMode,
      detail: `Queued: ${task.title}`,
    };
  });

  dashboard.registerWorkers(initialWorkerStates);

  const successfulTasks: AgentMicroTask[] = [];

  // 2. Dispatch all 16 agents concurrently through the 4-slot Token-Bucket Rate Limiter
  await Promise.all(
    descriptors.map(async (desc, idx) => {
      const task = AGENT_MICRO_TASKS[idx];

      // Acquire 1 of 4 active concurrency slots + rate-limit token
      await rateLimiter.acquireSlot();
      dashboard.updateWorker(
        desc.id,
        {
          status: 'DISPATCHED',
          detail: `[${executionMode.toUpperCase()}] Generating ${task.targetFile}`,
        },
        `Dispatched (${executionMode}) -> ${task.targetFile}`
      );

      let generatedCode = '';
      try {
        if (executionMode === 'cli') {
          generatedCode = await generateViaHeadlessClaudeCli(desc, task, isMock);
        } else if (executionMode === 'openrouter') {
          generatedCode = await generateViaOpenRouter(task);
        } else {
          generatedCode = await generateViaMock(desc, task);
        }

        // Write generated TypeScript file into the agent's isolated worktree
        const fullTargetFile = path.join(desc.projectDir, task.targetFile);
        fs.mkdirSync(path.dirname(fullTargetFile), { recursive: true });
        fs.writeFileSync(fullTargetFile, generatedCode, 'utf-8');
      } catch (genErr: unknown) {
        rateLimiter.releaseSlot();
        dashboard.updateWorker(
          desc.id,
          {
            status: 'FAILED',
            detail: `Generation error: ${genErr instanceof Error ? genErr.message : String(genErr)}`,
          },
          `Failed generation: ${String(genErr)}`
        );
        return;
      }

      // Release the OpenRouter API rate-limit slot as soon as LLM generation finishes
      rateLimiter.releaseSlot();

      // 3. Validation Gate: Run `npx tsc --noEmit` inside the isolated worktree
      dashboard.updateWorker(
        desc.id,
        {
          status: 'TESTING',
          detail: 'Running validation gate: npx tsc --noEmit',
        },
        'Validating worktree with npx tsc --noEmit'
      );

      const validation = await mergePipeline.validateWorktreeTypeScript(desc);
      if (!validation.passed) {
        dashboard.updateWorker(
          desc.id,
          {
            status: 'FAILED',
            detail: `TypeScript check failed: ${validation.diagnostics}`,
          },
          `Validation gate rejected ${desc.branch}`
        );
        return;
      }

      // 4. Enqueue into the Gated Sequential Rebase + Merge Pipeline onto `main`
      dashboard.updateWorker(
        desc.id,
        {
          status: 'TESTING',
          detail: 'tsc passed -> awaiting sequential merge lock on main',
        }
      );

      const mergeResult = await mergePipeline.enqueueSequentialMerge(
        desc,
        task.targetFile,
        task.title
      );

      if (mergeResult.merged) {
        successfulTasks.push(task);
        dashboard.updateWorker(
          desc.id,
          {
            status: 'MERGED',
            detail: `Merged onto main @ ${mergeResult.commitHash} (${task.targetFile})`,
          },
          `Merged ${desc.branch} -> main (${mergeResult.commitHash})`
        );
      } else {
        dashboard.updateWorker(
          desc.id,
          {
            status: 'FAILED',
            detail: mergeResult.error || 'Merge failed',
          },
          `Merge failed on ${desc.branch}`
        );
      }
    })
  );

  // Create barrel export file `src/utils/index.ts` once all 16 branches are merged
  if (successfulTasks.length > 0) {
    successfulTasks.sort((a, b) => a.id.localeCompare(b.id));
    await createBarrelIndexFile(worktreeManager.projectRoot, successfulTasks);
    worktreeManager.git(['add', 'src/utils/index.ts'], worktreeManager.projectRoot);
    try {
      worktreeManager.git(
        ['commit', '-m', 'chore(orchestrator): generate barrel export src/utils/index.ts'],
        worktreeManager.projectRoot
      );
    } catch {
      // Ignore if unchanged
    }
  }

  dashboard.printFinalTable();
}

runOrchestrator().catch((err) => {
  console.error('[Orchestrator Fatal Error]:', err);
  process.exit(1);
});
