---
name: marketplace-connector
description: Scaffolds a new resilient marketplace adapter with strict schema validation, connection pooling, and error classification.
---

# Marketplace Connector Scaffolding Playbook

## Invariant Rules
1. **Connection Pooling:** Reuse a single HTTP client session with keep-alive across requests.
2. **Explicit Timeouts:** Set 10s connect and 30s read timeouts on all external calls.
3. **Data Contracts First:** Define request/response validation schemas before writing network logic.
4. **Error Classification:** Classify errors into `RetryableError` (429/503), `AuthExpiredError` (401), and `SchemaDriftError`.
5. **Idempotency:** Include unique idempotency keys on non-idempotent operations.

