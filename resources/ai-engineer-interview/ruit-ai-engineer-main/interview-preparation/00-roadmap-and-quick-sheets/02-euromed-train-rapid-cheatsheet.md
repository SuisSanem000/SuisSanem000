# 02 — Train Ride Rapid Cheat Sheet (Barcelona to Valencia)

> **Quick 10-Minute Read:** Key backend systems definitions and AI harness principles matching Luis's interview scope for Friday morning on the Euromed.

---

## 1. Positioning & AI Harness Engineering

- **Honest Positioning:** 9+ years backend engineering (Node.js/TypeScript, SQL, Redis). 100% upfront that you **do not know Python**; you orchestrate AI agents (Antigravity IDE, Claude Code via OpenRouter) with strict architectural boundaries, data contracts, and test fixtures.
- **Harness Engineering (5 Steps):** Context/Rules (`ai-state.md`, `CLAUDE.md`) $\rightarrow$ Plan Mode (`Shift + Tab`) $\rightarrow$ Data Contracts First (Schemas & Error classes) $\rightarrow$ Terminal Verification Loop (autonomous tests/linters) $\rightarrow$ GitHub Copilot Code Review on Git diff.
- **Multi-Agent Architecture (16 Worktrees):** Programmatically provision 16 isolated Git worktrees (`.worktrees/agent-01..16`) sharing the `.git` store. Throttle with 4-slot Token Bucket limiter. Validate via `tsc --noEmit` in parallel, then funnel through FIFO async mutex queue for serialized rebase and merge onto `main`.
- **Multi-Agent Rules:** On-demand Skills (`SKILL.md`) save 90% context. Use read-only subagents for heavy logs/traffic analysis. Golden Rule: Two agents never write to the same file concurrently.

---

## 2. Backend, Queues, Databases & Concurrency

- **Double-Sell Prevention:** Lock the inventory row in PostgreSQL using `SELECT ... FOR UPDATE` inside a database transaction (`BEGIN ... COMMIT`). Concurrent sales wait on the lock, see `quantity = 0`, and abort. Alternative: Optimistic locking with a `version` column.
- **Background Queues (Celery + Redis / RabbitMQ):** Offload slow marketplace HTTP calls. Separate queues by priority (`delist_urgent` vs `bulk_catalog`). Worker safety: `acks_late=True`, unique idempotency keys per task, and exponential backoff with jitter on retries.
- **Redis Caching:** Cache-aside pattern, random TTL jitter (e.g. 15 mins $\pm$ 60s) to prevent cache stampedes, and cache invalidation on inventory updates.
- **Error Handling Philosophy:**
  - **Exceptions (Python/JS):** Dynamic, unwinds stack, can be implicit.
  - **Explicit Errors (Go):** Explicit `val, err := fn()`.
  - **Algebraic Types (Rust):** Compiler-enforced `Result<T, E>`.
  - *Ruit Integration Rule:* Categorize errors into Retryable (`429`, `503`, timeouts), Auth Expired (`401` $\rightarrow$ trigger seller re-login), and Schema Drift (alert engineers).

---

## 3. Networking, Reverse Engineering, Browsers & DevOps

- **TCP 3-Way Handshake:** `SYN` $\rightarrow$ `SYN-ACK` $\rightarrow$ `ACK`. Connection pooling prevents socket exhaustion in `TIME_WAIT` (60s) and avoids repeated DNS lookups.
- **Protocols Comparison:**
  - **HTTP/1.1:** 1 request per TCP connection; head-of-line blocking.
  - **HTTP/2:** Multiplexes multiple requests over 1 TCP connection, binary framing.
  - **HTTP/3 (QUIC):** Runs over UDP; independent streams eliminate TCP head-of-line blocking.
  - **WebSockets:** Full-duplex bidirectional TCP stream after `101 Switching Protocols` handshake. Scaled horizontally via Redis Pub/Sub.
  - **Server-Sent Events (SSE):** Lightweight 1-way text stream (`text/event-stream`) over HTTP, auto-reconnects.
  - **Webhooks:** Server-to-server HTTP POST with HMAC signature verification.
- **TLS Fingerprinting (JA3 / JA4):** Anti-bot protection (Cloudflare, DataDome) inspects cipher suites in `TLS ClientHello`. Python/OpenSSL gets blocked; tools like `curl_cffi` mimic real browser TLS fingerprints.
- **Reverse Engineering:** Extract undocumented endpoints via `.har` network traffic or mobile APIs (via `mitmproxy`), which are cleaner and break less often.
- **Chrome Extension (MV3):** Operates directly inside the user's browser, using their residential IP, cookies, and fingerprint to bypass bot detection effortlessly.
- **DevOps & Observability:** Expand-contract zero-downtime DB migrations, graceful `SIGTERM` shutdown in Docker containers, and full observability (Prometheus metrics, structured logging, distributed tracing with Sentry).
