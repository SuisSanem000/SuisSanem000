# 01 — Celery, Redis, SQL Locking & Double-Sell Prevention

> **Core Ruit Challenge:** When a second-hand item sells on Vinted, delist it across Wallapop, eBay, and Vestiaire within seconds without race conditions or dropped jobs.

---

## 1. Celery, Redis & Background Job Queues

- **Why Offload to Background Queues?**
  - Marketplace API requests are slow (1–5 seconds) and unreliable. Web server request handlers must remain fast (<100ms) and offload work asynchronously to Celery/background workers.
- **Broker (Redis / RabbitMQ):**
  - Redis is in-memory and fast (great for simple task queues and caching). RabbitMQ offers advanced AMQP routing and high persistence.
- **Queue Separation by Priority:**
  - Create dedicated queues: `delist_urgent` (instant stock removal) vs. `catalog_sync` (bulk background imports). Never let bulk imports block urgent delisting.
- **Worker Reliability Patterns:**
  - **`acks_late=True`:** The worker acknowledges task completion *after* execution. If a worker crashes mid-task, the broker re-delivers it to another worker.
  - **Task Idempotency:** Because tasks can retry, every task must be safe to execute multiple times using unique idempotency keys.
  - **Exponential Backoff + Random Jitter:** When retrying failed API calls, use exponential backoff with jitter to prevent a "thundering herd" on the marketplace.
  - **Dead-Letter Queue (DLQ):** After max retries (e.g. 3 attempts), send failed jobs to a DLQ and alert the engineering team.

---

## 2. Databases: SQL Indexing & Redis Caching

- **PostgreSQL Indexing Strategy:**
  - Add **B-Tree indexes** on columns filtered with `=`, `<`, `>`, and `ORDER BY` (e.g., `(seller_id, created_at)`).
  - Use **GIN (Generalized Inverted Index)** on `JSONB` columns for fast querying of dynamic marketplace attributes.
  - **Connection Pooling with PgBouncer:** Background workers spawn many processes; PgBouncer pools database connections so Postgres does not run out of connection slots.
- **Redis Caching Patterns:**
  - **Cache-Aside Pattern:** Check Redis first; on cache miss, query PostgreSQL, populate Redis with a TTL, and return data.
  - **Cache Stampede Prevention:** Add random **TTL jitter** (e.g. 15 minutes $\pm$ 60 seconds) so thousands of product cache keys don't expire simultaneously.
  - **Cache Invalidation:** Invalidate or update the Redis key on every write/update, or rely on short TTLs for non-critical data.

---

## 3. SQL Locking & Double-Sell Prevention (`SELECT ... FOR UPDATE`)

- **The Problem:** A seller has **quantity = 1**. Buyers click "Buy" on Vinted and Wallapop within the same 10 milliseconds.
- **Pessimistic Locking (`SELECT ... FOR UPDATE`):**
  - Inside a database transaction (`BEGIN ... COMMIT`):
  - Lock the row explicitly with `SELECT * FROM items WHERE id = :item_id FOR UPDATE;`.
  - The database places an exclusive row-level lock. The concurrent Wallapop worker is forced to wait until the Vinted transaction commits.
  - When the second worker acquires the lock, it reads `status = 'sold'` and `quantity = 0`, immediately aborting the duplicate sale.
- **Optimistic Locking (Version Check):**
  - Alternative without database locks: Each row has an integer `version`.
  - Execute `UPDATE items SET status = 'sold', version = version + 1 WHERE id = item_id AND version = current_version;`.
  - If 0 rows are updated, another worker won the race—abort and notify the user.
