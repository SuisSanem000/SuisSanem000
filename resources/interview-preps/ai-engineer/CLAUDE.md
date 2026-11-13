# CLAUDE.md — Senior Systems Engineering & AI Harness Guidelines

> **Project:** Senior AI & Systems Integration Engineering Showcase  
> **Candidate:** Simin Shoeibi (9+ Years Senior Backend & Systems Engineering)  
> **Core Principle:** Practice disciplined Harness Engineering — isolate context, enforce strict schemas and test fixtures, and verify all diffs independently.

---

## 1. Architectural Invariants
- **Database Concurrency:** Prevent race conditions and inconsistent states across distributed systems using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) inside database transactions.
- **Queue Reliability:** Offload external API I/O to background workers (Celery/Redis/BullMQ) with dedicated queues by priority, `acks_late=True`, and exponential backoff with random jitter.
- **Network Resilience:** Enforce connection pooling across all HTTP client sessions, set explicit connect/read timeouts, and bypass TLS fingerprinting (JA3/JA4) via browser TLS impersonation (`curl_cffi`).
- **Data Integrity:** Validate all external API payloads against strict data schemas; detect and log schema drift before jobs fail.

---

## 2. AI Harness Rules & Context Management
- **Living Memory:** Persist project context, architectural guidelines, and invariants in repository memory files so every session starts aligned.
- **On-Demand Skills:** Keep root guidelines under 50 lines. Load specialized playbooks via on-demand skills (`SKILL.md`) to prevent context window bloat.
- **Subagent Delegation:** Offload large payload inspection (.har captures, 10,000-line logs) to read-only research subagents.
- **Multi-Agent Isolation:** Never allow two agents to write to the same file. Use isolated Git worktrees (`.worktrees/agent-XX`) and sequential merge queues for parallel workers.
- **Verification Gate:** Run automated test suites and static type checks in the terminal autonomously before staging any commit.
- **Independent Audit:** Run GitHub Copilot Code Review on the Git diff as a second model check before merging.
