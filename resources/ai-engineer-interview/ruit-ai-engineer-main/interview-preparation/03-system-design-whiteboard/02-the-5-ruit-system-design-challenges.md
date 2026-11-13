# 02 — The 5 Ruit System Design Challenges & Solutions

> **Pick 1 of ~5 Challenges with Luis:** Be ready to choose any of these 5 real Ruit challenges and walk through the exact design.

---

## Challenge 1: Proactive Breakage Detection & Self-Healing Integrations

- **The Problem:** Marketplaces (Vinted, Wallapop, eBay) change unofficial API response fields without notice, breaking sync.
- **Solution Architecture:**
  - Every API response passes through strict **data contracts / schemas** with extra fields safely ignored and required checks for essential fields (`id`, `price`, `status`).
  - Track validation errors in a **Redis sliding-window counter**. If error rate > 15% in 5 minutes, flip circuit breaker to `OPEN` for that specific marketplace action (`(vinted, publish)`).
  - Store incoming payloads that fail validation, scrub sensitive PII, compare against expected schema, and push an alert showing the exact changed field name.
  - Run **synthetic canaries** (test account checks) every 15 minutes during quiet hours to detect upstream breakages before real seller jobs fail.

---

## Challenge 2: Multi-Marketplace Inventory Sync & Double-Sell Prevention

- **The Problem:** A seller lists a unique vintage jacket on Vinted and Wallapop. Both sell within the same 5 seconds.
- **Solution Architecture:**
  - Webhook or polling worker detects sale on Vinted $\rightarrow$ calls order intake endpoint.
  - Inside a database transaction (`BEGIN ... COMMIT`), execute `SELECT * FROM items WHERE id = :item_id FOR UPDATE;`. The database row is locked.
  - Set `status = 'sold'`, `quantity = 0`.
  - In the same transaction, enqueue delist jobs for Wallapop, eBay, and Vestiaire into a high-priority queue (`delist_urgent`).
  - If a second sale arrives from Wallapop 100ms later, it waits on the lock, reads `status = 'sold'`, aborts the sale, and alerts the seller immediately to cancel the duplicate order.
  - Delist workers send `DELETE /listings/<id>`. If the marketplace returns `404 Not Found`, treat as **success** (`already_delisted`).

---

## Challenge 3: Rapid New Marketplace Connector Architecture (Adapter Pattern)

- **The Problem:** Ruit needs to add 10+ new marketplaces (Depop, Vestiaire, Facebook, Etsy) rapidly without rewriting core services.
- **Solution Architecture:**
  - Define a canonical internal domain model (`CanonicalListing`, `CanonicalOrder`). Core backend services only talk to canonical models.
  - Create a base interface `BaseMarketplaceConnector` with standard async methods: `authenticate()`, `publish()`, `update()`, `delist()`, `check_health()`.
  - Each marketplace lives in an isolated module with 3 clean boundaries: HTTP transport (with connection pooling and bot-impersonation headers), payload mapper (translates canonical data to marketplace payload), and response schemas.

---

## Challenge 4: AI Catalog Normalization & Cross-Marketplace Category Mapping

- **The Problem:** Seller uploads 1 photo. AI must generate title, description, price, and map to completely different category/brand IDs across Vinted, Wallapop, and eBay.
- **Solution Architecture:**
  - **Stage 1 (Vision Extraction):** Multimodal LLM extracts standard product attributes validated by strict data contracts: `brand`, `category_path`, `color`, `size`, `condition`.
  - **Stage 2 (Deterministic Mapping):** **Never let an LLM guess numeric marketplace IDs directly** (they hallucinate numbers). Match extracted text against a pre-indexed PostgreSQL lookup table (`pgvector` / fuzzy text search) to retrieve the top 3 valid candidate IDs per marketplace, then select the exact match.
  - Cache mapped brand/category tuples in Redis so future items skip AI mapping entirely.

---

## Challenge 5: Hybrid Chrome Extension & Cloud Worker Execution

- **The Problem:** Cloud workers with datacenter IPs get blocked by strict anti-bot protections; Chrome extensions only run when the seller's browser is open.
- **Solution Architecture:**
  - **Smart Job Router:** Classify tasks by urgency and bot risk:
    - *Low urgency + high bot risk (bulk listing imports):* Route to **Chrome Extension** (uses real residential home IP and genuine browser session for free).
    - *High urgency (immediate delist of sold item at 3:00 AM):* If the extension is offline for >15s, fall back to **Cloud Worker + Residential Proxy**.
  - **Redis Lease Lock:** Before either the extension or cloud worker executes a delist job, it claims a 60-second Redis lock (`job_lock:{job_id}`) so both never execute the same action concurrently.
