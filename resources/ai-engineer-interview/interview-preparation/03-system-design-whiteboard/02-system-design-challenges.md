# 02 — High-Signal System Design Challenges & Architectures

> **Whiteboard Preparation:** 5 real-world distributed systems and AI integration challenges with concrete architecture solutions.

---

## Challenge 1: Proactive Breakage Detection & Self-Healing Integrations

- **The Problem:** Third-party platforms and external APIs change response fields without notice, silently breaking upstream integrations.
- **Solution Architecture:**
  - Every API response passes through strict **data contracts / schemas** with extra fields safely ignored and required checks for essential fields (`id`, `price`, `status`).
  - Track validation errors in a **Redis sliding-window counter**. If error rate > 15% in 5 minutes, flip circuit breaker to `OPEN` for that specific integration action.
  - Store incoming payloads that fail validation, scrub sensitive PII, compare against expected schema, and push an alert showing the exact changed or missing field name.
  - Run **synthetic canaries** (test account checks) every 15 minutes during quiet hours to detect upstream breakages before user transactions fail.

---

## Challenge 2: Multi-Platform Inventory Sync & Double-Sell Prevention

- **The Problem:** A seller lists a unique 1-of-1 item across multiple platforms. Buyers purchase it on two platforms within the same 5 seconds.
- **Solution Architecture:**
  - Webhook or polling worker detects sale on Platform A $\rightarrow$ calls order intake endpoint.
  - Inside a database transaction (`BEGIN ... COMMIT`), execute `SELECT * FROM items WHERE id = :item_id FOR UPDATE;`. The database row is locked.
  - Set `status = 'sold'`, `quantity = 0`.
  - In the same transaction, enqueue delist jobs for all other platforms into a high-priority queue (`delist_urgent`).
  - If a second sale arrives 100ms later from Platform B, it waits on the lock, reads `status = 'sold'`, aborts the sale, and alerts the user immediately to cancel the duplicate order.
  - Delist workers send cancellation / deletion requests. If an external service returns `404 Not Found`, treat as **success** (`already_delisted`).

---

## Challenge 3: Rapid New Platform Connector Architecture (Adapter Pattern)

- **The Problem:** The platform needs to add 10+ new third-party connectors rapidly without rewriting core services.
- **Solution Architecture:**
  - Define a canonical internal domain model (`CanonicalListing`, `CanonicalOrder`). Core backend services only talk to canonical models.
  - Create a base interface `BaseConnector` with standard async methods: `authenticate()`, `publish()`, `update()`, `delist()`, `check_health()`.
  - Each platform lives in an isolated module with 3 clean boundaries: HTTP transport (with connection pooling and bot-impersonation headers), payload mapper (translates canonical data to platform payload), and response schemas.

---

## Challenge 4: AI Catalog Normalization & Cross-Platform Category Mapping

- **The Problem:** User uploads 1 photo. Multimodal AI must generate title, description, price, and map to completely different category/brand IDs across diverse target platforms.
- **Solution Architecture:**
  - **Stage 1 (Vision Extraction):** Multimodal LLM extracts standard product attributes validated by strict data contracts: `brand`, `category_path`, `color`, `size`, `condition`.
  - **Stage 2 (Deterministic Mapping):** **Never let an LLM guess numeric platform IDs directly** (LLMs hallucinate numbers). Match extracted text against a pre-indexed PostgreSQL lookup table (`pgvector` / embeddings / fuzzy text search) to retrieve the top 3 valid candidate IDs per platform, then select the exact match.
  - Cache mapped brand/category tuples in Redis so future items skip AI mapping entirely.

---

## Challenge 5: Hybrid Client/Extension & Cloud Worker Execution

- **The Problem:** Cloud workers with datacenter IPs get blocked by strict anti-bot protections; browser extensions only run when the user's browser is open.
- **Solution Architecture:**
  - **Smart Job Router:** Classify tasks by urgency and bot risk:
    - *Low urgency + high bot risk (bulk listing imports):* Route to **Browser Extension** (uses real residential home IP and genuine browser session for free).
    - *High urgency (immediate delist of sold item at 3:00 AM):* If the extension is offline for >15s, fall back to **Cloud Worker + Residential Proxy**.
  - **Redis Lease Lock:** Before either the extension or cloud worker executes a job, it claims a 60-second Redis lock (`job_lock:{job_id}`) so both never execute the same action concurrently.
