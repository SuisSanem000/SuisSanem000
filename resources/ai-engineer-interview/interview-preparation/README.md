# Systems Architecture & AI Engineering Interview Preparation

> **Focus Areas:** Distributed Systems, Concurrency & Database Locking, Background Job Queues, Networking Protocols, Reverse Engineering, System Design Whiteboarding, and AI Orchestration.
>
> - **Candidate:** Simin Shoeibi (9+ Years Senior Backend & Systems Engineering)
> - **Core Architecture Principles:** Strict data contracts, connection pooling, idempotency, row-level database locking (`SELECT ... FOR UPDATE`), and disciplined AI Harness Engineering.

---

## Module Index

### 0. Positioning & Quick Sheets (`00-roadmap-and-quick-sheets/`)
- [01-my-senior-backend-positioning-and-polyglot-mindset.md](./00-roadmap-and-quick-sheets/01-my-senior-backend-positioning-and-polyglot-mindset.md) — Senior systems positioning, polyglot mindset, and honest interview scripts.
- [02-rapid-interview-cheatsheet.md](./00-roadmap-and-quick-sheets/02-rapid-interview-cheatsheet.md) — 10-minute rapid review of high-frequency systems concepts and AI harness rules.

### 1. Backend Fundamentals: Queues, Locks & Errors (`01-backend-fundamentals/`)
- [01-celery-redis-and-sql-locking.md](./01-backend-fundamentals/01-celery-redis-and-sql-locking.md) — Background queues (Celery/Redis/RabbitMQ), Redis cache stampede prevention, and SQL `SELECT ... FOR UPDATE` race-condition prevention.
- [02-error-handling-python-vs-go-vs-rust.md](./01-backend-fundamentals/02-error-handling-python-vs-go-vs-rust.md) — Comparing error handling philosophies (exceptions vs explicit errors vs algebraic types) and robust error classification.

### 2. Networking, Reverse Engineering, Browsers & DevOps (`02-networking-and-reverse-eng/`)
- [01-networking-protocols-and-tls.md](./02-networking-and-reverse-eng/01-networking-protocols-and-tls.md) — TCP 3-way handshake, UDP, DNS, HTTP/1.1 vs HTTP/2 vs HTTP/3, WebSockets vs SSE vs Webhooks, and TLS fingerprinting (JA3/JA4).
- [02-reverse-engineering-browsers-and-devops.md](./02-networking-and-reverse-eng/02-reverse-engineering-browsers-and-devops.md) — `.har` traffic analysis, Chrome Extensions (MV3), Playwright, zero-downtime DB migrations, and container observability.

### 3. System Design Whiteboard (`03-system-design-whiteboard/`)
- [01-collaborative-framework-and-architecture.md](./03-system-design-whiteboard/01-collaborative-framework-and-architecture.md) — 4-step collaborative whiteboard framework and key spoken phrases.
- [02-system-design-challenges.md](./03-system-design-whiteboard/02-system-design-challenges.md) — Complete architectures for 5 real-world systems challenges: Proactive breakage detection, inventory sync & double-sell prevention, rapid connector adapter, multimodal AI normalization, and hybrid extension/cloud execution.

### 4. Behavioral Stories & Technical Questions (`04-culture-lunch-and-storytelling/`)
- [01-stories-lunch-and-questions.md](./04-culture-lunch-and-storytelling/01-stories-lunch-and-questions.md) — 3 STAR stories (Visual Meta B2B SaaS, Dotin banking deadlock fix, Visual Meta PHP rewrite), culture-fit collaboration tips, and high-signal technical questions for interviewers.
