# Master Guide: How This Repository is Structured & Exactly What to Show and Read

> **Read this file first!**  
> This is your quick roadmap for today's interview at **Lanzadera, Valencia** with **Luis Grau** (CEO) and **Alonso Veliz Garcia** (Founding Engineer).

---

## 1. The 30-Second Mental Map (Why It Is Structured This Way)

Your repository is cleanly split into **3 main zones**:

```text
ruit-ai-engineer/
│
├── [ZONE 1: The AI Harness & Live Prototype]  <-- What you show on your screen at 13:00h
│   ├── README.md                              (The executive showcase)
│   ├── CLAUDE.md                              (Root harness rules & constraints)
│   ├── AGENTS.md                              (Subagent routing & concurrency rules)
│   ├── .claude/commands/                      (Custom slash commands: /plan, /validate, /review)
│   ├── skills/                                (On-demand playbooks: connector, traffic)
│   └── multi-agent-worktree-orchestrator/     (Runnable 16-agent Git worktree prototype)
│
├── [ZONE 2: Your Live Interview Playbook]     <-- Your cheat sheet for the 13:00h session
│   └── ai-workflow/                           (Zero code: 4 short step-by-step guides)
│
└── [ZONE 3: Deep Technical Knowledge Base]    <-- For the whiteboard & lunch (14:00 – 16:00h)
    └── interview-preparation/                 (5 consecutive modules: 00 to 04)
```

---

## 2. What to Read Right Now (In Order of Priority)

If you only have **20 minutes**, read these files in this exact order:

### Priority 1: For the First Hour (13:00 – 14:00h: Laptop Setup & AI Task)
1. **[`ai-workflow/01-show-laptop-setup.md`](./ai-workflow/01-show-laptop-setup.md)** (3 mins):  
   The 4 exact things to show on your screen and the words to say when Luis says *"Fire up your laptop and show us your setup."*
2. **[`ai-workflow/02-live-task-playbook.md`](./ai-workflow/02-live-task-playbook.md)** (4 mins):  
   The 6 steps to follow out loud during the 20-minute live coding task (clarify failure modes, plan mode, strict schemas, autonomous terminal tests, senior invariant checks, atomic commit).
3. **[`ai-workflow/03-agents-skills-parallel-sessions.md`](./ai-workflow/03-agents-skills-parallel-sessions.md)** (4 mins):  
   Clear, spoken explanations for Rules vs. Skills vs. Plugins, Research Subagents, and your 16-agent worktree prototype.

### Priority 2: For the Whiteboard Challenge (15:00 – 16:00h)
4. **[`interview-preparation/03-system-design-whiteboard/02-the-5-ruit-system-design-challenges.md`](./interview-preparation/03-system-design-whiteboard/02-the-5-ruit-system-design-challenges.md)** (5 mins):  
   Skim the architectures for Ruit's 5 challenges (especially Challenge 1: schema breakages and Challenge 2: double-sell prevention with `SELECT ... FOR UPDATE`).

### Priority 3: For the Team Lunch (14:00 – 15:00h)
5. **[`interview-preparation/04-culture-lunch-and-storytelling/01-stories-lunch-and-questions.md`](./interview-preparation/04-culture-lunch-and-storytelling/01-stories-lunch-and-questions.md)** (4 mins):  
   Your 3 STAR stories and the smart questions to ask Luis and the team over lunch.

---

## 3. What to Show on Your Laptop (Exact 4-Minute Walkthrough)

When Luis says: *"Show us your setup and how you work with AI"*, follow this sequence on screen:

### Minute 1: The Root Showcase
- Open the root [`README.md`](./README.md) in your editor.
- **Say:** *"I don't just chat with AI. I practice Harness Engineering. I organized this entire preparation workspace using that exact workflow: living memory files, on-demand skills, test verification gates, and independent diff reviews."*
- Click on [`CLAUDE.md`](./CLAUDE.md) and [`AGENTS.md`](./AGENTS.md).
- **Say:** *"I keep root rules under 50 lines. They define non-negotiable invariants—like row-level database locking and subagent permissions—so every fresh agent session starts with full context."*

### Minute 2: Custom Commands & On-Demand Skills
- Expand [`.claude/commands/`](./.claude/commands/) on the left sidebar: show `plan.md`, `validate.md`, and `review.md`.
- **Say:** *"I create custom slash commands: `/plan` for read-only exploration before editing, `/validate` to run terminal tests autonomously, and `/review` for diff audits."*
- Expand [`skills/`](./skills/): show `marketplace-connector` and `traffic-reverse-engineering`.
- **Say:** *"Instead of stuffing 20 playbooks into my global prompt, I use on-demand Skills. The agent only loads the skill into memory when that specific task is triggered, saving 90% of tokens."*

### Minute 3: The 16-Agent Worktree Prototype (The Wow Factor)
- Open your terminal and run:
  ```bash
  cd multi-agent-worktree-orchestrator && bun run dev:mock
  ```
- Let the live terminal dashboard render for 3 seconds.
- **Say:** *"When running agents in parallel, two agents must never touch the same file, and multiple agents will crash Git if they fight over `.git/index.lock`. Here is a prototype I built that provisions 16 isolated Git worktrees, gates LLM calls through a 4-slot token bucket rate limiter, runs `tsc --noEmit` in parallel, and merges branches sequentially onto main."*

### Minute 4: The Systems Design Knowledge Base
- Click on [`interview-preparation/`](./interview-preparation/).
- **Say:** *"Here I consolidated Ruit's core systems problems—PostgreSQL row locking with `SELECT ... FOR UPDATE`, Celery background queues, TLS bot fingerprinting bypass with `curl_cffi`, and architectures for Ruit's 5 whiteboard challenges."*

---

## 4. Complete Folder-by-Folder Breakdown

| Folder / File | What It Is | When to Use It |
| :--- | :--- | :--- |
| **[`HOW-TO-USE-THIS-REPOSITORY.md`](./HOW-TO-USE-THIS-REPOSITORY.md)** | This master guide | Keep open on your laptop as your navigation guide. |
| **[`README.md`](./README.md)** | Root Executive Showcase | Show this on screen first to introduce your Harness Engineering setup. |
| **[`CLAUDE.md`](./CLAUDE.md)** | Global project rules & memory | Show this to demonstrate how you instruct agents with strict invariants. |
| **[`AGENTS.md`](./AGENTS.md)** | Subagent roles & write-lock rules | Show this to explain multi-agent boundaries. |
| **[`.claude/commands/`](./.claude/commands/)** | Custom slash commands (`/plan`, `/validate`, `/review`) | Show this to demonstrate repeatable, scriptable agent workflows. |
| **[`skills/`](./skills/)** | On-demand domain playbooks | Show this to explain how you keep context windows clean. |
| **[`ai-workflow/`](./ai-workflow/)** | 4 step-by-step interview guides (zero code) | Read this right now! Your playbook for the 13:00h session. |
| **[`multi-agent-worktree-orchestrator/`](./multi-agent-worktree-orchestrator/)** | Production 16-agent Git worktree prototype | Run `bun run dev:mock` for a live 3-second terminal demo. |
| **[`interview-preparation/`](./interview-preparation/)** | 5 consecutive systems design modules (`00` to `04`) | Your technical foundation for the 15:00h whiteboard & lunch. |
| **[`docs/ai-assitant-analysis/`](./docs/ai-assitant-analysis/)** | Living project state across all sessions (`ai-state.md`) | Demonstrates living memory maintained across 23 sessions. |
| **`docs/resources/`** | Local private resources (CV, emails, job ads) | Kept locally on disk; excluded from Git via `.gitignore` for privacy. |

