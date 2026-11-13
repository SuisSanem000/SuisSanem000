# AI Engineer & Senior Systems Technical Interview Preparation

> **Candidate:** Simin Shoeibi (9+ Years Senior Backend & Systems Engineering)  
> **Core Focus:** AI Agent Orchestration, Harness Engineering, Distributed Systems Architecture, Database Concurrency, and Low-Level Networking.  
> **Executive Summary:** A comprehensive, battle-tested preparation suite for AI Engineer, Senior Full-Stack, and Senior Systems Integration interviews.

---

## 1. Core Engineering Philosophy: Harness Engineering

Rather than treating AI as an open-ended autocomplete or unstructured chat, this repository demonstrates **Harness Engineering**—controlling and verifying AI through strict systems boundaries:

- **Living State & Invariants:** Persist architectural constraints, error hierarchies, and test commands in repository guidelines ([`CLAUDE.md`](./CLAUDE.md), [`AGENTS.md`](./AGENTS.md)) so every agent session starts fully aligned.
- **On-Demand Skills:** Keep root guidelines concise (<50 lines) and load domain-specific playbooks on demand ([`skills/`](./skills/)) to avoid context bloat and model distraction.
- **Subagent Delegation:** Offload large data dumps (.har traffic, 10,000-line logs) to read-only research subagents to maintain clean, focused coding contexts.
- **Isolated Parallel Worktrees:** Run multi-agent concurrent tasks safely using isolated Git worktrees ([`multi-agent-worktree-orchestrator/`](./multi-agent-worktree-orchestrator/README.md)) with semaphore rate-limiting and sequential merge queues.
- **Autonomous Terminal Verification:** Force agents to run test runners, linters, and type checkers directly in the terminal to self-correct from stack traces.
- **Independent Audit:** Inspect Git diffs with independent code-review checks before creating atomic commits.

---

## 2. Master Repository Map

| Section | Description | Key Links |
| :--- | :--- | :--- |
| **Agent Invariants & Rules** | Multi-agent boundaries, subagent routing, and write-lock rules | [`CLAUDE.md`](./CLAUDE.md) <br> [`AGENTS.md`](./AGENTS.md) |
| **Foundational AI Questions** | LLM, RAG, vector database, and retrieval interview questions | [`interview-questions.md`](./interview-questions.md) <br> [`How I work with AI agents.md`](./How%20I%20work%20with%20AI%20agents.md) |
| **Live AI Interview Playbook** | 4-part guide for laptop demos, live AI coding, and parallel agent explanations | [01. Show Laptop Setup](./ai-workflow/01-show-laptop-setup.md) <br> [02. Live Task Playbook](./ai-workflow/02-live-task-playbook.md) <br> [03. Agents & Parallelism](./ai-workflow/03-agents-skills-parallel-sessions.md) <br> [04. AI Resume Story](./ai-workflow/04-my-real-ai-resume-story.md) |
| **Multi-Agent Prototype** | Production TypeScript orchestrator: 16 concurrent agents with Git worktrees | [`README.md`](./multi-agent-worktree-orchestrator/README.md) <br> [`src/orchestrator.ts`](./multi-agent-worktree-orchestrator/src/orchestrator.ts) <br> [`src/worktree.ts`](./multi-agent-worktree-orchestrator/src/worktree.ts) |
| **Systems Architecture Modules** | 5 consecutive deep-dive modules on backend fundamentals, protocols, and design | [`interview-preparation/README.md`](./interview-preparation/README.md) <br> [01. Positioning](./interview-preparation/00-roadmap-and-quick-sheets/01-my-senior-backend-positioning-and-polyglot-mindset.md) <br> [02. Rapid Cheat Sheet](./interview-preparation/00-roadmap-and-quick-sheets/02-rapid-interview-cheatsheet.md) |
| **On-Demand Skills** | Progressive agent playbooks for reverse-engineering & connectors | [`skills/`](./skills/) |

---

## 3. Systems Knowledge Base Summary (`interview-preparation/`)

- **[00. Positioning & Rapid Sheet](./interview-preparation/00-roadmap-and-quick-sheets/)**: Polyglot systems architecture mindset, honest spoken scripts, and 10-minute rapid review.
- **[01. Backend Fundamentals](./interview-preparation/01-backend-fundamentals/)**: Background queues (Celery/Redis/RabbitMQ), cache stampede mitigation with TTL jitter, PostgreSQL indexing (B-Tree/GIN), and `SELECT ... FOR UPDATE` row locking.
- **[02. Networking, Protocols & Reverse Engineering](./interview-preparation/02-networking-and-reverse-eng/)**: TCP 3-way handshake, HTTP/1 vs HTTP/2 vs HTTP/3, WebSockets, SSE, Webhooks, JA3/JA4 TLS fingerprint impersonation (`curl_cffi`), and Chrome Manifest V3 extensions.
- **[03. System Design Whiteboard](./interview-preparation/03-system-design-whiteboard/)**: 4-step collaborative whiteboard framework and 5 real-world system design challenges (breakage detection, race-condition prevention, connector adapters, multimodal vision mapping, hybrid extension/cloud execution).
- **[04. Behavioral & Culture Stories](./interview-preparation/04-culture-lunch-and-storytelling/)**: 3 STAR production stories (Visual Meta B2B SaaS, Dotin banking deadlock fix, Strangler Fig monolith rewrite) and high-signal technical questions for interviewers.

---

## 4. Multi-Agent Worktree Prototype Verification

```bash
# 1. Run the 16-agent worktree orchestrator demo (takes ~3 seconds in mock mode)
cd multi-agent-worktree-orchestrator && bun run dev:mock

# 2. Inspect active worktrees & git branches
git worktree list && git log --oneline --graph -n 15

# 3. Clean up all worktrees and temporary branches
bun run clean
```
