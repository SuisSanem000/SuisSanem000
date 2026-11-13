# 16-Agent Git Worktree & OpenRouter Concurrency Orchestrator

> **Executive Interview Prototype & Study Guide**  
> A production-grade, lightweight multi-agent orchestrator written in strict TypeScript that provisions **16 isolated Git worktrees** (`.worktrees/agent-01` .. `.worktrees/agent-16`), dispatches parallel LLM code-generation tasks through a **4-slot Token-Bucket Rate Limiter** (OpenRouter API / Headless Claude Code CLI / zero-token `--mock` mode), validates every worktree in isolation via **`npx tsc --noEmit`**, and merges passing branches sequentially onto `main` without Git lock collisions.

---

## 1. Architecture Overview

```text
+--------------------------------------------------------------------------------------------------+
|                         CENTRAL SUPERVISOR (src/orchestrator.ts)                                 |
|  Defines 16 disjoint micro-tasks (src/utils/agent01_*.ts .. agent16_*.ts) with file ownership    |
+-------------------------------------------------+------------------------------------------------+
                                                  |
                                                  v
+--------------------------------------------------------------------------------------------------+
|                     1. WORKTREE LIFECYCLE MANAGER (src/worktree.ts)                              |
|  • Purges stale .git/*.lock files & runs `git worktree prune`                                    |
|  • Provisions 16 isolated checkouts sharing the single root .git object database:                |
|                                                                                                  |
|    .worktrees/agent-01 (feature/agent-01)   ...   .worktrees/agent-16 (feature/agent-16)         |
|    Symlinks root node_modules -> each worktree for zero-install TypeScript compilation           |
+-------------------------------------------------+------------------------------------------------+
                                                  |
                           16 Parallel Agent Tasks Queued (`QUEUED`)
                                                  |
                                                  v
+--------------------------------------------------------------------------------------------------+
|               2. TOKEN-BUCKET + SEMAPHORE API RATE LIMITER (Max 4 Active Slots)                  |
|                                                                                                  |
|   [Slot 1: ACTIVE]     [Slot 2: ACTIVE]     [Slot 3: ACTIVE]     [Slot 4: ACTIVE]                |
|          |                    |                    |                    |                        |
|          +--------------------+--------------------+--------------------+                        |
|                                       |                                                          |
|        +------------------------------+------------------------------+                           |
|        |                              |                              |                           |
|        v                              v                              v                           |
|  [Mode A: OpenRouter Fetch]   [Mode B: Headless Claude CLI]   [Mode C: --mock Deterministic]     |
|  POST /api/v1/chat/completions  spawn(`claude -p "..."`,       0 tokens, realistic staggered     |
|  google/gemini-2.5-flash or     cwd: .worktrees/agent-XX,      latency, writes strict TS +       |
|  deepseek/deepseek-chat         ANTHROPIC_BASE_URL=openrouter) embedded unit test assertions     |
+-------------------------------------------------+------------------------------------------------+
                                                  |
                  Slot Released Immediately -> Next Queued Agent Dispatched
                                                  |
                                                  v
+--------------------------------------------------------------------------------------------------+
|                   3. PARALLEL VALIDATION GATE (`TESTING` in src/merge.ts)                        |
|  • Runs `npx tsc --noEmit` inside `.worktrees/agent-XX` in parallel                              |
|  • Executes embedded unit test assertions                                                        |
|  • If compilation fails -> Agent marked `FAILED`, branch rejected before touching `main`         |
+-------------------------------------------------+------------------------------------------------+
                                                  |
                        Passing Branches Enter FIFO Async Mutex Queue
                                                  |
                                                  v
+--------------------------------------------------------------------------------------------------+
|                 4. SEQUENTIAL REBASE & MERGE QUEUE (`MERGED` in src/merge.ts)                    |
|  • Acquires exclusive async mutex (1 branch at a time to protect `.git/index.lock`)              |
|  • Commits inside worktree: `git commit -m "feat(agent-XX): ..."`                                |
|  • Rebases onto latest main: `git rebase main` (auto `rebase --abort` on conflict)               |
|  • Merges into primary main: `git merge --no-ff feature/agent-XX`                                |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Five Core Technical Interview Q&As

### Q1: Why are Git worktrees superior to Docker containers or full directory copying (`cp -r`) when running 16 local coding agents in parallel?

- **Zero Object Duplication (Shared `.git` Object Store):**
  - A full `cp -r` or `git clone` duplicates the entire `.git/objects` history and `node_modules` 16 times. On a 500 MB repo, 16 copies consume **8 GB of disk I/O** and take minutes to copy.
  - `git worktree add .worktrees/agent-01 -b feature/agent-01 main` creates a lightweight checkout with a tiny `.git` pointer file referencing the main repository's object database (`O(1)` metadata overhead, provisioned in **<50ms per worktree**).
- **Native Git Branch Isolation Without Context Switching:**
  - Normally, switching branches in a single working directory (`git checkout`) mutates files on disk under active agents' feet. With 16 worktrees, each agent has its own physical filesystem directory and its own independent Git index (`.git/worktrees/agent-XX/index`), while all branches live natively inside the same repository for instant local rebasing and merging.
- **Orders-of-Magnitude Lighter Than 16 Docker Containers:**
  - Running 16 Docker containers requires 16 separate Linux namespaces, volume mounts (which suffer severe macOS VirtioFS latency on `node_modules`), and gigabytes of RAM. Git worktrees + symlinked `node_modules` run natively on the host kernel with zero virtualization overhead.

> **Spoken Interview Soundbite:**  
> *"I use `git worktree` because it gives each agent a completely isolated working directory and Git index while sharing the single `.git` object store and root `node_modules`. Spawning 16 worktrees takes milliseconds and near-zero disk space compared to cloning or spinning up 16 Docker containers, and every agent's commit is immediately visible as a local branch on `main` without pushing or pulling over a network."*

---

### Q2: How do you manage API rate limits (TPM/RPM) and prevent context degradation across 16 parallel LLM streams?

- **Two-Layer Concurrency Control (Counting Semaphore + Token Bucket):**
  - Firing 16 simultaneous prompts at OpenRouter immediately triggers HTTP `429 Too Many Requests` or saturates Tokens-Per-Minute (TPM) quotas.
  - In [`src/orchestrator.ts`](./src/orchestrator.ts), `TokenBucketRateLimiter` enforces:
    1. **Concurrency Semaphore (`maxConcurrent = 4`):** At most 4 agents hold an active HTTP stream at any instant. As soon as an agent finishes receiving tokens (before it runs slow local `tsc` checks), it calls `releaseSlot()` so the 5th agent starts immediately.
    2. **Token-Bucket Refill & Exponential Backoff with Jitter:** Requests consume bucket tokens that refill at a steady rate. If upstream returns `429`, the worker backs off using `500ms * 2^attempt + randomJitter` to prevent a synchronized thundering herd.
- **Preventing Context Window Degradation:**
  - Instead of stuffing 16 tasks into one giant shared conversation history (which suffers from "lost-in-the-middle" attention decay and quadratic token cost), each worktree agent gets a **fresh, stateless context window** scoped strictly to its single file specification and schema contract.

> **Spoken Interview Soundbite:**  
> *"To avoid 429 rate limits and context rot, I decouple task count from inflight API concurrency. All 16 worktrees are provisioned upfront, but LLM calls pass through a 4-slot semaphore and token bucket. Crucially, the worker releases its API slot the millisecond generation finishes—before running `tsc` or Git merges—maximizing throughput. And because each agent runs in a stateless, single-purpose session scoped to one file, context windows stay tiny and accurate."*

---

### Q3: How do you coordinate state and avoid merge conflicts (and `.git/index.lock` crashes) when 16 agents finish simultaneously?

- **Architectural Prevention (Disjoint File Partitioning):**
  - Before dispatching agents, the supervisor partitions work into non-overlapping files (`src/utils/agent01_slugify.ts` .. `src/utils/agent16_inventory_guard.ts`). Two agents never edit the same file concurrently. Shared barrel exports (`src/utils/index.ts`) are generated deterministically by the supervisor *after* all worker branches merge.
- **Parallel Validation, Serialized Integration (`GatedMergePipeline` in [`src/merge.ts`](./src/merge.ts)):**
  - **Validation is parallel:** 4+ agents can run `npx tsc --noEmit` simultaneously inside their own `.worktrees/agent-XX` directories because each worktree has its own filesystem and Git index.
  - **Merging onto `main` is strictly serialized:** Git uses a single lock file (`.git/index.lock` and `.git/HEAD.lock`) when mutating `main`. If two agents run `git merge` on `main` at the same millisecond, Git crashes with `fatal: Unable to create '.git/index.lock': File exists`.
  - Our `GatedMergePipeline` uses an asynchronous **FIFO Promise Mutex** (`this.mergeMutex`). Each validated branch enters the queue, rebases onto the latest `main` (`git rebase main`), and merges (`git merge --no-ff`) one by one. If any branch has a conflict, `git rebase --abort` isolates the failure without blocking the remaining 15 agents.

> **Spoken Interview Soundbite:**  
> *"I follow a 'Parallel Validation, Serialized Merge' architecture. First, I prevent semantic conflicts by partitioning tasks so each agent owns a distinct module, and the supervisor generates shared index files at the end. Second, while `tsc --noEmit` runs in parallel inside each worktree, merging onto `main` goes through a FIFO async mutex queue. That guarantees two workers never fight over `.git/index.lock`."*

---

### Q4: How are Claude Code CLI sessions spawned headlessly in background workers with OpenRouter?

- **Non-Interactive Headless Invocation (`claude -p`):**
  - Rather than opening 16 interactive TUI terminals, the orchestrator uses Node's `child_process.spawn` with `cwd` set to `.worktrees/agent-XX` and invokes Claude Code in headless print mode:
    `claude -p "<strict task prompt>" --output-format text --max-turns 3`
- **Routing Claude Code Through OpenRouter:**
  - Each spawned child process receives environment variables pointing the Anthropic SDK layer inside Claude Code to OpenRouter's Anthropic-compatible endpoint:
    - `ANTHROPIC_BASE_URL="https://openrouter.ai/api"`
    - `ANTHROPIC_AUTH_TOKEN="<OPENROUTER_API_KEY>"`
    - `ANTHROPIC_API_KEY=""` (cleared so the token auth header takes precedence)
- **Process Sandboxing & Pipe Capture:**
  - `stdio: ['ignore', 'pipe', 'pipe']` closes `stdin` so the CLI never hangs waiting for interactive user input, captures `stdout` / `stderr` buffers asynchronously, and enforces a hard process timeout.

> **Spoken Interview Soundbite:**  
> *"To run Claude Code headlessly across 16 workers, I spawn `claude -p` with `stdin` closed and `cwd` locked to that agent's worktree directory. By passing `ANTHROPIC_BASE_URL=https://openrouter.ai/api` and `ANTHROPIC_AUTH_TOKEN` in the child process environment, every headless agent routes through OpenRouter with unified cost tracking and rate control."*

---

### Q5: What are the trade-offs between a Centralized Supervisor (Hub-and-Spoke) vs. a Peer-to-Peer Agent Mesh?

| Dimension | Centralized Supervisor (This Prototype) | Peer-to-Peer Agent Mesh |
| :--- | :--- | :--- |
| **Coordination & State** | Single source of truth (`orchestrator.ts`) owns task decomposition, rate limiting, and the merge mutex. | Agents negotiate tasks and pass messages directly to one another. |
| **Determinism & Debugging** | **High:** Every state transition (`QUEUED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `TESTING` $\rightarrow$ `MERGED`) is logged in one dashboard. | **Low:** Emergent loops, deadlocks, and cascading hallucinations when agents debate each other. |
| **Token & Cost Efficiency** | **Optimal ($O(N)$):** 16 tasks = 16 bounded prompts. Zero inter-agent chatter overhead. | **Expensive ($O(N^2)$):** Multi-turn agent-to-agent conversations multiply token consumption rapidly. |
| **Failure Isolation** | If `agent-07` fails `tsc --noEmit`, its branch is dropped cleanly; the other 15 still merge. | A confused agent can broadcast bad assumptions to neighboring peers. |
| **Best Use Case** | Production code generation, marketplace connector fan-out, batch migrations, test generation. | Open-ended creative brainstorming or multi-persona simulations. |

> **Spoken Interview Soundbite:**  
> *"For production software engineering, a Centralized Supervisor beats a peer-to-peer agent mesh every time. Peer-to-peer meshes suffer from $O(N^2)$ token chatter, non-deterministic loops, and cascading hallucinations. With a centralized supervisor, task boundaries, rate-limit budgets, `tsc` validation gates, and Git merges remain 100% deterministic—while the LLM workers stay stateless and replaceable."*

---

## 3. Two-Minute Execution & Live Demo Cheatsheet

Run these commands inside `multi-agent-worktree-orchestrator/`:

```bash
# 1. One-step setup (initializes Git on main, configures .gitignore, installs TS/tsx, verifies build)
chmod +x setup.sh && ./setup.sh

# 2. Run all 16 concurrent agents in instant zero-token Mock Mode (takes ~2 seconds)
npm run dev:mock
# (or with Bun: bun run dev:mock)

# 3. Inspect the 16 isolated Git worktrees & merged commit graph on main
git worktree list
git branch -a
git log --oneline --graph -n 20
ls -la src/utils/

# 4. Run in Headless Claude Code CLI simulation mode or Live OpenRouter API mode
npm run dev:cli
OPENROUTER_API_KEY="sk-or-v1-..." OPENROUTER_MODEL="google/gemini-2.5-flash" npm run dev

# 5. Clean teardown (removes all 16 .worktrees/agent-* folders, prunes metadata, deletes feature/agent-* branches)
npm run clean
```

