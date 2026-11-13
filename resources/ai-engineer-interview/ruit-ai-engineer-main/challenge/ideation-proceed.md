# Whiteboard Challenge: Multi-Marketplace Integration & Inventory Sync

> **Whiteboard Scenario:** Real-time multi-marketplace integration (Vinted, Wallapop, eBay, Depop, Vestiaire).
> **Core Focus Areas:**
> 1. Real-time inventory zero-state & instant cross-marketplace delisting.
> 2. O(1) latency & authentication management across hundreds of marketplaces.
> 3. Schema divergence & missing mandatory field handling.

---

## 1. The 2-Minute Opening: Clarifying Questions (Yes/No Format)

Before touching the whiteboard marker, ask Luis and Alonso these 4 clarifying questions. These establish scope, prove senior architectural discipline, and invite simple **Yes / No** answers:

1. **Question 1 (Consistency vs Availability):**
   *"For inventory depletion, is zero double-selling our absolute top priority—meaning we prioritize strict consistency over eventual sync speed?"*
   *(Expected: **Yes** — for 1-of-1 second-hand items, double-selling ruins seller ratings).*

2. **Question 2 (Execution Environment):**
   *"Do we have official server-to-server APIs or webhooks for all marketplaces, or are some reverse-engineered and driven via headless sessions or browser extensions?"*
   *(Expected: **Yes/No** — Ruit uses a hybrid of reverse-engineered APIs and extensions).*

3. **Question 3 (Latency SLA for O(1)):**
   *"When we say O(1) for hundreds of marketplaces, do we mean O(1) from the seller's perspective—where the API acknowledges within 50ms and fan-out happens in the background?"*
   *(Expected: **Yes** — synchronous waiting on 100 external HTTP calls is impossible).*

4. **Question 4 (Partial Publishing for Missing Schemas):**
   *"If 1 out of 5 marketplaces rejects a listing due to a missing mandatory attribute, should the other 4 still publish successfully?"*
   *(Expected: **Yes** — partial success is always better than blocking the seller entirely).*

---

## 2. Whiteboard Walkthrough Architecture (4 Core Blocks)

Draw these 4 clean blocks on the whiteboard:

```text
[ Seller UI / Webhook Ingestion ]
               │
               ▼
   [ 1. API Gateway (Fast ACK: O(1)) ]
               │
               ▼
   [ 2. PostgreSQL (Row-Lock: SELECT FOR UPDATE) ]
               │ (Atomic deduction)
               ▼
   [ 3. Redis Streams / High-Priority Queue ]
               │ (Fan-out broadcast)
               ▼
   [ 4. Parallel Workers (Connector Pool + Auth Sessions) ]
         ├── Worker 1 ──> Vinted (DELETE /listings/123)
         ├── Worker 2 ──> Wallapop (DELETE /listings/456)
         └── Worker 3 ──> eBay (PUT /inventory/sku quantity=0)
```

---

## 3. Dedicated Solutions for the 3 Specific Challenges

### Challenge A: Updating Listing State & Instant Delisting (Preventing Double-Selling)

- **The Problem:** An item sells on Vinted (or inventory drops to 0). It was a 1-of-1 unique product. If someone buys it on Wallapop 3 seconds later, the seller suffers penalties.
- **Dedicated Solution Steps:**
  1. **Atomic Database Row Lock:** When a sale webhook or sale confirmation arrives, wrap the inventory update in a PostgreSQL transaction: `SELECT * FROM items WHERE id = :id FOR UPDATE;`. If `quantity < 1` or `status == 'SOLD'`, immediately rollback and abort. Set `quantity = 0` and `status = 'DEPLETED'` atomically.
  2. **Dedicated Urgent Delist Queue:** Inside the same database transaction, push delist events into a high-priority queue (`queue:delist_urgent`) that completely bypasses regular bulk sync jobs.
  3. **Parallel Worker Fan-Out:** Spin up concurrent workers for all remaining active channels (Wallapop, eBay, etc.) simultaneously rather than iterating one by one in a loop.
  4. **Idempotency & Graceful 404:** If a marketplace returns `404 Not Found` or `already_closed`, treat the job as **Success** (`already_delisted`), log the timestamp, and mark the listing as `INACTIVE` in PostgreSQL.

---

### Challenge B: Auth Across Hundreds of Marketplaces & Achieving O(1) Complexity

- **The Problem:** Integrating with 100+ marketplaces. A linear loop checking or publishing to $N$ marketplaces has $O(N)$ time complexity and network latency.
- **Dedicated Solution Steps:**
  1. **Decoupled Asynchronous Ingestion (O(1) User Latency):**
     The seller clicks "Publish" or updates price. The API Gateway writes the payload to PostgreSQL, pushes an event to Redis Streams, and returns `202 Accepted` with a job ID in **O(1) constant time** (< 50ms). The caller never waits on external network I/O.
  2. **In-Memory Token & Session Pool (O(1) Authentication Lookup):**
     Never authenticate on the fly during a publish request (which triggers captcha/TLS bot blocks). Maintain a warm session cache in Redis: `auth_sessions:{user_id}:{marketplace_id}`. A background scheduler proactively refreshes tokens before expiry. When any worker runs, fetching the valid Bearer token or cookie session is a single **O(1) Redis hash lookup**.
  3. **Parallel Fan-Out Execution (Constant Wall-Clock Time):**
     Instead of sequential $O(N \times \text{latency})$ calls, the queue fans out $N$ concurrent worker jobs. Total wall-clock time is bounded by the slowest single marketplace response ($\max(T_k)$), transforming linear latency into constant wall-clock performance.
  4. **Inverted Index for Product-to-Marketplace Lookups (O(1) Data Retrieval):**
     Store product-channel relationships in an inverted index in Redis/PostgreSQL: `channel_listings:{item_id} -> [vinted_id, wallapop_id, ebay_id]`, enabling instant retrieval without table scans.

---

### Challenge C: The Schema Problem (Marketplace Requires Attributes We Do Not Have)

- **The Problem:** A marketplace requires attributes (e.g. European shoe size, vintage era, fabric composition) that our canonical product catalog or the seller's intake photo does not contain.
- **Dedicated Solution Steps:**
  1. **Pre-flight Schema Validation (Fail Fast Locally):**
     Each marketplace connector has a strict declarative JSON schema contract. We validate locally before making any network call. We never send bad payloads that trigger opaque 400 Bad Request errors.
  2. **Tier 1 — Intelligent Fallback Defaults Matrix:**
     For non-blocking attributes, maintain a deterministic default mapping table (e.g., Brand $\rightarrow$ `"Generic / Unbranded"`, Condition $\rightarrow$ `"Used - Good"`, Material $\rightarrow$ `"Other"`).
  3. **Tier 2 — AI Multimodal Attribute Inference:**
     Run the product title, description, and photo through a fast multimodal model (Gemini Flash or Claude Haiku) specifically prompted to extract or impute the missing required field.
  4. **Tier 3 — Quarantine & Human-in-the-Loop (`NEEDS_INPUT`):**
     If a field is mandatory, cannot be inferred with >90% confidence, and has no safe default (e.g., exact dress size):
     - Transition the listing on that specific marketplace to `QUARANTINED` / `ACTION_REQUIRED`.
     - Notify the seller with a 1-click prompt: *"Vinted requires shoe size to publish. Select size: [EU 38, EU 39, EU 40]"*.
  5. **Channel Isolation (Partial Success):**
     Never block the other 4 marketplaces if 1 marketplace is missing a field. Publish to the 4 compliant marketplaces immediately, and queue the 5th once the seller supplies the attribute.

---

## 4. Spoken Walkthrough Script for the Whiteboard (Upper-B2)

Use this exact phrasing during the discussion:

- **Opening:**
  *"Let's break this down into three core dimensions: data consistency for inventory, latency decoupling for scale, and schema resilience for external marketplaces."*
- **On Inventory Delisting:**
  *"To guarantee zero double-sells, I treat inventory as a financial ledger. We lock the item row in PostgreSQL using `SELECT FOR UPDATE` so competing purchases queue up deterministically. The moment stock hits zero, we push to a dedicated high-priority Redis queue that fans out delist workers in parallel."*
- **On O(1) Scale & Auth:**
  *"From the user's perspective, this must always be O(1). The API accepts the command in under 50 milliseconds and delegates to background workers. For authentication across hundreds of channels, we keep warm session tokens in a Redis pool with proactive background refresh, so workers never waste time authenticating on the fly."*
- **On Missing Schemas:**
  *"We use a 3-tier fallback strategy: first, safe defaults; second, fast AI inference from images and text; and third, quarantining only the affected marketplace while publishing everywhere else. We never let one channel's schema quirk block a seller's entire revenue pipeline."*
