# Ruit Technical Interview Showcase — Senior Systems Architecture & AI Harness Engineering

> **Position:** Senior Backend Engineer, Integrations  
> *(Dual Consideration: Senior Full Stack Engineer, Integrations / AI Engineer)*  
> **Candidate:** Simin Shoeibi (9+ Years Senior Backend Engineering)  
> **Interview Date:** Friday, November 6, 2026 (`12:45h` arrival @ Lanzadera, Valencia)  
> **Interviewers:** Luis Grau (CEO) and Alonso Veliz Garcia (Founding Engineer)  
> **Executive Summary:** *How I used my AI Harness Engineering workflow to prepare for this interview, orchestrate multi-agent prototypes, and model Ruit's core systems.*

---

## 1. "Look How I Used Harness Engineering to Prepare for Ruit"

When you open this laptop in front of Luis and Alonso, this entire repository is live proof of your engineering discipline. Instead of casually chatting with AI, every file, prototype, and architectural document in this workspace was generated and verified using **Harness Engineering**:

- **Step 1 — Living State & Memory Engine:**
  Maintained strict project context and constraints in [`CLAUDE.md`](./CLAUDE.md), [`AGENTS.md`](./AGENTS.md), and [`docs/ai-assitant-analysis/the-context-of-the-project/ai-state.md`](./docs/ai-assitant-analysis/the-context-of-the-project/ai-state.md) across **22+ atomic Git commits**. Every agent session starts with full memory of Ruit's stack, Luis's cheat sheet, and strict constraints.
- **Step 2 — Dual-Agent Tool Stack with OpenRouter Routing:**
  Used **Antigravity IDE** for multi-file architecture and research subagent delegation, paired with **Claude Code CLI** in the terminal and VS Code routed through an **OpenRouter API token** (`google/gemini-2.5-flash`, `deepseek/deepseek-chat`, and Claude 3.7 Sonnet) with unified billing and rate-limit control.
- **Step 3 — Custom Slash Commands & On-Demand Skills:**
  Configured [`.claude/commands/`](./.claude/commands/) (`/review`, `/validate`, `/plan`) and [`skills/`](./skills/) (`marketplace-connector`, `traffic-reverse-engineering`) to load domain playbooks progressively without polluting the model's active context window.
- **Step 4 — Production-Grade Multi-Agent Prototype (`multi-agent-worktree-orchestrator/`):**
  Built a complete, runnable TypeScript system provisioning **16 isolated Git worktrees** (`.worktrees/agent-01..16`), throttling LLM calls through a **4-slot Token-Bucket Rate Limiter**, validating each worktree in parallel with `tsc --noEmit`, and merging sequentially onto `main` via an async FIFO mutex queue without `.git/index.lock` collisions.
- **Step 5 — High-Signal Systems Architecture Knowledge Base (`interview-preparation/`):**
  Consolidated core backend principles into 5 consecutive, code-free modules covering PostgreSQL row locking (`SELECT ... FOR UPDATE`), Celery background queues, TLS fingerprint bypass (`curl_cffi`), Chrome Manifest V3 extensions, and the 5 real Ruit whiteboard challenges.
- **Step 6 — Chronological Interview Execution Playbook (`ai-workflow/`):**
  Designed a 4-part step-by-step guide for today's 13:00h session: 5 minutes to show this setup, 20 minutes to execute any live coding challenge, and word-for-word scripts explaining agents, skills, and parallel sessions.

---

## 2. Master Repository Map

| Workspace Directory | Purpose & Contents | High-Impact Links |
| :--- | :--- | :--- |
| **Root Rules & Constraints** | Living state, subagent hierarchy, and custom slash commands | [`CLAUDE.md`](./CLAUDE.md) <br> [`AGENTS.md`](./AGENTS.md) <br> [`.claude/commands/`](./.claude/commands/) |
| **On-Demand Skills** | Progressive playbooks for reverse-engineering & connectors | [`skills/`](./skills/) |
| **`ai-workflow/`** | Step-by-step playbook for today's 13:00h interview (zero code) | [01. Show Laptop Setup](./ai-workflow/01-show-laptop-setup.md) <br> [02. Live Task Playbook](./ai-workflow/02-live-task-playbook.md) <br> [03. Agents & Parallelism](./ai-workflow/03-agents-skills-parallel-sessions.md) <br> [04. Resume Story](./ai-workflow/04-my-real-ai-resume-story.md) |
| **`multi-agent-worktree-orchestrator/`** | Production prototype: 16 concurrent agents using Git worktrees & OpenRouter | [`README.md` (Architecture & 5 Q&As)](./multi-agent-worktree-orchestrator/README.md) <br> [`src/worktree.ts`](./multi-agent-worktree-orchestrator/src/worktree.ts) <br> [`src/orchestrator.ts`](./multi-agent-worktree-orchestrator/src/orchestrator.ts) <br> [`src/merge.ts`](./multi-agent-worktree-orchestrator/src/merge.ts) |
| **`interview-preparation/`** | Consecutive systems design, networking, and Ruit challenge blueprints | [Company Guide](./interview-preparation/COMPANY-AND-PRODUCT-GUIDE.md) <br> [Positioning Script](./interview-preparation/00-roadmap-and-quick-sheets/01-my-senior-backend-positioning-and-polyglot-mindset.md) <br> [The 5 Challenges](./interview-preparation/03-system-design-whiteboard/02-the-5-ruit-system-design-challenges.md) |
| **`docs/`** | Living project state across all sessions & raw resources | [`ai-state.md`](./docs/ai-assitant-analysis/the-context-of-the-project/ai-state.md) |

---

## 3. Candidate Profile & Transparent Positioning

- **9+ Years Senior Backend Architecture:**  
  Built high-scale platforms in Node.js/TypeScript, PostgreSQL, Redis, and Delphi. Shipped the Dadroit VS Code extension in 3 days (630K+ installs), crawled 150+ news sites at Parsaiane, and engineered QueryLaw's legal AI pipeline to 95%+ precision using strict JSON Schema validation gates.
- **100% Upfront on Python:**  
  Simin does not know Python syntax and has never worked with Python or Django in production. She solves problems by architecting backend invariants—row locks, background queues, rate limiters, and data contracts—and directing AI agents with automated testing harnesses to generate and verify clean implementations.

---

## 4. Quick Verification Commands

```bash
# 1. Run the 16-agent worktree orchestrator demo (takes ~3 seconds in mock mode)
cd multi-agent-worktree-orchestrator && bun run dev:mock

# 2. Inspect active worktrees & git branches
git worktree list && git log --oneline --graph -n 15

# 3. Clean up all worktrees and temporary branches
bun run clean
```
