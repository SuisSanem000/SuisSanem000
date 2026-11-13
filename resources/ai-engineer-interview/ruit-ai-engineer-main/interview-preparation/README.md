# Ruit Final Interview Preparation (Systems Architecture Knowledge Base)

> **Position Applying For:** **Senior Backend Engineer, Integrations**  
> *(Dual Consideration: Luis confirmed you are also considered for **Senior Full Stack Engineer, Integrations / AI Engineer**).*
>
> - **Candidate:** Simin Shoeibi (9+ Years Senior Backend Engineering)
> - **Interview Date:** Friday, November 6, 2026 (`12:45h` arrival @ Lanzadera, Valencia)
> - **Company Guide:** [COMPANY-AND-PRODUCT-GUIDE.md](./COMPANY-AND-PRODUCT-GUIDE.md) (~€1M funding, €1M ARR target, 1-photo AI listing, anti-double-sell sync)
> - **Primary Foundation:** Luis's email briefing notes (stored locally, excluded from public Git for privacy)
> - **Honest Positioning:** You do **not** know Python and have never worked with Python in production. You orchestrate AI agents (Antigravity IDE, Claude Code via OpenRouter, GitHub Copilot) with senior architectural rigor, strict data schemas, and automated testing harnesses.

---

## Study Progress Tracker

| Section | Core Files | Status |
| :--- | :--- | :--- |
| **Root Interview Showcase** | [Root README.md](../README.md) & [`CLAUDE.md`](../CLAUDE.md) | `[x] READY TO SHOW` |
| **AI Workflow Playbook** | [ai-workflow/](../ai-workflow/README.md) (Files 01, 02, 03, 04) | `[x] PRIMARY FOR TODAY` |
| **16-Agent Worktree Prototype** | [multi-agent-worktree-orchestrator/](../multi-agent-worktree-orchestrator/README.md) | `[x] RUNNABLE DEMO` |
| **Company & Role Guide** | [COMPANY-AND-PRODUCT-GUIDE.md](./COMPANY-AND-PRODUCT-GUIDE.md) | `[x] COMPLETED` |
| **0. Roadmap & Quick Sheets** | [00-roadmap-and-quick-sheets/](./00-roadmap-and-quick-sheets/00-master-10-hour-schedule.md) | `[x] COMPLETED` |
| **1. Backend Fundamentals** | [01-backend-fundamentals/](./01-backend-fundamentals/01-celery-redis-and-sql-locking.md) | `[x] COMPLETED` |
| **2. Networking & Reverse Eng** | [02-networking-and-reverse-eng/](./02-networking-and-reverse-eng/01-networking-protocols-and-tls.md) | `[x] COMPLETED` |
| **3. System Design Whiteboard** | [03-system-design-whiteboard/](./03-system-design-whiteboard/01-collaborative-framework-and-architecture.md) | `[x] COMPLETED` |
| **4. Stories & Team Lunch** | [04-culture-lunch-and-storytelling/](./04-culture-lunch-and-storytelling/01-stories-lunch-and-questions.md) | `[x] COMPLETED` |

---

## Consecutive Module Index (Zero Fluff, 100% Systems Architecture)

- **0. Roadmap & Quick Sheets (`00-roadmap-and-quick-sheets/`)**
  - [00-master-10-hour-schedule.md](./00-roadmap-and-quick-sheets/00-master-10-hour-schedule.md) — 5-step master study schedule.
  - [01-my-senior-backend-positioning-and-polyglot-mindset.md](./00-roadmap-and-quick-sheets/01-my-senior-backend-positioning-and-polyglot-mindset.md) — Senior backend positioning and honest spoken script.
  - [02-euromed-train-rapid-cheatsheet.md](./00-roadmap-and-quick-sheets/02-euromed-train-rapid-cheatsheet.md) — 10-minute cheat sheet for the train ride.

- **1. Backend Fundamentals: Queues, Locks & Errors (`01-backend-fundamentals/`)**
  - [01-celery-redis-and-sql-locking.md](./01-backend-fundamentals/01-celery-redis-and-sql-locking.md) — Background queues (Celery/Redis), Redis cache stampede prevention, and SQL `SELECT ... FOR UPDATE` double-sell prevention.
  - [02-error-handling-python-vs-go-vs-rust.md](./01-backend-fundamentals/02-error-handling-python-vs-go-vs-rust.md) — Comparing error handling philosophies (exceptions vs explicit errors vs algebraic types) and marketplace integration error classification.

- **2. Networking, Reverse Engineering, Browsers & DevOps (`02-networking-and-reverse-eng/`)**
  - [01-networking-protocols-and-tls.md](./02-networking-and-reverse-eng/01-networking-protocols-and-tls.md) — TCP 3-way handshake, UDP, DNS, HTTP/1.1 vs HTTP/2 vs HTTP/3, WebSockets vs SSE vs Webhooks, and TLS fingerprinting bypass (`curl-impersonate` / `curl_cffi`).
  - [02-reverse-engineering-browsers-and-devops.md](./02-networking-and-reverse-eng/02-reverse-engineering-browsers-and-devops.md) — `.har` traffic analysis, Chrome Extensions (MV3), Playwright, zero-downtime DB migrations, and observability.

- **3. System Design Whiteboard (`03-system-design-whiteboard/`)**
  - [01-collaborative-framework-and-architecture.md](./03-system-design-whiteboard/01-collaborative-framework-and-architecture.md) — 4-step collaborative whiteboard framework and spoken phrases.
  - [02-the-5-ruit-system-design-challenges.md](./03-system-design-whiteboard/02-the-5-ruit-system-design-challenges.md) — Complete architectures for the 5 real Ruit challenges (Breakage detection, double-sell prevention, rapid connector adapter, 1-photo AI mapping, hybrid Chrome extension).

- **4. Stories, Team Lunch & Questions (`04-culture-lunch-and-storytelling/`)**
  - [01-stories-lunch-and-questions.md](./04-culture-lunch-and-storytelling/01-stories-lunch-and-questions.md) — 3 STAR stories (Visual Meta B2B SaaS, Dotin banking deadlock fix, Visual Meta PHP rewrite), lunch etiquette, and high-impact questions for Luis and the team.
