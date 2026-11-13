# 02 — Rapid Systems & AI Engineering Cheat Sheet

> **Quick 10-Minute Read:** Key backend systems definitions, networking concepts, and AI harness principles for technical interviews.

---

## 1. Positioning & AI Harness Engineering

- **Candidate Positioning:** 9+ years backend engineering (Node.js/TypeScript, SQL, Redis). Focus on systems architecture and orchestrating AI agents (Antigravity IDE, Claude Code via OpenRouter) with strict architectural boundaries, data contracts, and test fixtures.
- **Harness Engineering (5 Steps):** Context/Rules (`CLAUDE.md`) $\rightarrow$ Plan Mode (`Shift + Tab`) $\rightarrow$ Data Contracts First (Schemas & Error classes) $\rightarrow$ Terminal Verification Loop (autonomous tests/linters) $\rightarrow$ GitHub Copilot Code Review on Git diff.
- **Multi-Agent Architecture (16 Worktrees):** Programmatically provision 16 isolated Git worktrees (`.worktrees/agent-01..16`) sharing the `.git` store. Throttle with 4-slot Token Bucket limiter. Validate via `tsc --noEmit` in parallel, then funnel through FIFO async mutex queue for serialized rebase and merge onto `main`.
- **Multi-Agent Rules:** On-demand Skills (`SKILL.md`) save 90% context. Use read-only subagents for heavy logs/traffic analysis. Golden Rule: Two agents never write to the same file concurrently.

---

## 2. Backend, Queues, Databases & Concurrency

- **Double-Sell / Race Condition Prevention:** Lock the inventory or balance row in PostgreSQL using `SELECT ... FOR UPDATE` inside a database transaction (`BEGIN ... COMMIT`). Concurrent operations wait on the lock, observe `quantity = 0`, and abort safely. Alternative: Optimistic locking with a `version` column.
- **Background Queues (Celery / Redis / BullMQ / RabbitMQ):** Offload slow external HTTP calls. Separate queues by priority (`urgent_events` vs `bulk_catalog`). Worker safety: `acks_late=True`, unique idempotency keys per task, and exponential backoff with jitter on retries.
- **Redis Caching:** Cache-aside pattern, random TTL jitter (e.g. 15 mins $\pm$ 60s) to prevent cache stampedes, and cache invalidation on updates.
- **Error Handling Philosophy:**
  - **Exceptions (Python/JS):** Dynamic, unwinds stack, can be implicit.
  - **Explicit Errors (Go):** Explicit `val, err := fn()`.
  - **Algebraic Types (Rust):** Compiler-enforced `Result<T, E>`.
  - *Integration Rule:* Categorize errors into Retryable (`429`, `503`, timeouts), Auth Expired (`401` $\rightarrow$ trigger re-login), and Schema Drift (alert engineers).

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
- **TLS Fingerprinting (JA3 / JA4):** Anti-bot protection (Cloudflare, DataDome) inspects cipher suites in `TLS ClientHello`. Default scripts get blocked; tools like `curl_cffi` mimic real browser TLS fingerprints.
- **Reverse Engineering:** Extract undocumented endpoints via `.har` network traffic or mobile APIs (via `mitmproxy`), which are cleaner and break less often.
- **Browser Automation:** Use real browser sessions or extensions for high-bot-risk workflows (residential IP and authentic browser fingerprints).
- **DevOps & Observability:** Expand-contract zero-downtime DB migrations, graceful `SIGTERM` shutdown in Docker containers, and full observability (metrics, structured logging, distributed tracing).
