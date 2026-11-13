# CLAUDE.md — Senior Systems Engineering & AI Harness Guidelines

> **Project:** Ruit Senior Backend & AI Integration Engineering Showcase  
> **Candidate:** Simin Shoeibi (9+ Years Senior Backend Engineering)  
> **Core Principle:** Practice disciplined Harness Engineering — isolate context, enforce strict schemas and test fixtures, and verify all diffs independently.

---

## 1. Architectural Invariants
- **Database Concurrency:** Always prevent double-selling across marketplaces using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) inside database transactions.
- **Queue Reliability:** Offload external marketplace I/O to background workers (Celery/Redis) with dedicated queues (`delist_urgent` vs `catalog_sync`), `acks_late=True`, and exponential backoff with random jitter.
- **Network Resilience:** Enforce connection pooling across all HTTP client sessions, set explicit connect/read timeouts, and bypass TLS fingerprinting (JA3/JA4) via browser TLS impersonation (`curl_cffi`).
- **Data Integrity:** Validate all external marketplace payloads against strict data schemas; detect and log schema drift before jobs fail.

---

## 2. AI Harness Rules & Context Management
- **Living Memory:** Keep project context updated in `docs/ai-assitant-analysis/the-context-of-the-project/ai-state.md`.
- **On-Demand Skills:** Keep root guidelines under 50 lines. Load specialized playbooks via on-demand skills (`SKILL.md`) to prevent context window bloat.
- **Subagent Delegation:** Offload large payload inspection (.har captures, 10,000-line logs) to read-only research subagents.
- **Multi-Agent Isolation:** Never allow two agents to write to the same file. Use isolated Git worktrees (`.worktrees/agent-XX`) and sequential merge queues for parallel workers.
- **Verification Gate:** Run automated test suites and static type checks in the terminal autonomously before staging any commit.
- **Independent Audit:** Run GitHub Copilot Code Review on the Git diff as a second model check before merging.
