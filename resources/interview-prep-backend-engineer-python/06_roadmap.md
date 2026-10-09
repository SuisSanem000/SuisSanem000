# Future Rounds Roadmap: Technical Call & Lanzadera Whiteboard Day

> **Process Overview from Luis Grau:**  
> 1. **Round 1 (Today):** 45-min CEO Video Call with Luis Grau (Fit, motivation, built projects, AI agents).  
> 2. **Round 2 (Next Week):** 1-Hour Technical Video Call (No live coding; deep systems design, engineering depth, architectural thinking).  
> 3. **Round 3 (Final):** Full Day at Lanzadera (Marina de Empresas, Valencia): Whiteboard session on a real production problem + team lunch.  
> *Timeline: Total process takes ~3 weeks, with updates guaranteed within 7 days.*

---

## Part 1: Round 2 Preparation — 1-Hour Technical Systems Call

### Format & Expectations
- **No live LeetCode/coding:** Luis explicitly stated: *"No coding: I want to see how you think, your experience and how deep your software engineering goes."*
- **Format:** Architectural deep dive, systems design, trade-offs, and edge-case dissection.

### Core Technical Topics to Master

#### 1. Reverse-Engineering Undocumented Marketplace APIs
- **Intercepting Mobile Apps (iOS / Android):**
  - Using tools like **mitmproxy**, **Charles Proxy**, and **HTTP Toolkit** to inspect HTTPS traffic.
  - SSL Pinning bypass via **Frida** or **Objection** runtime instrumentation on rooted Android / jailbroken iOS devices or Emulators.
  - Extracting mobile API tokens, secret keys, HMAC request signing algorithms, and device fingerprint payloads.
- **Handling Web Frontends & Private APIs:**
  - Finding internal GraphQL or REST endpoints used by web clients.
  - Analyzing WebSocket feeds used for instant notifications (e.g., new bids, sales, chat messages).

#### 2. Bot Evasion, WAF Bypass & Proxy Architecture
- **Detection Mechanisms:**
  - Cloudflare Turnstile, Datadome, Akamai Bot Manager, Kasada, PerimeterX.
  - TLS Fingerprinting (JA3 / JA4 hashes, HTTP/2 frame signatures).
  - Browser Fingerprinting (Canvas, WebGL, AudioContext, navigator.webdriver flags).
  - IP Reputation & Velocity checking.
- **Countermeasures:**
  - Rotating Residential Proxy pools (BrightData, Oxylabs, Smartproxy) vs Datacenter proxies.
  - Sticky sessions per marketplace account (keeping the same IP subnet for an account session).
  - Headless browser stealth (Playwright / Puppeteer with `stealth` plugins or custom CDP patches, or Python `curl_cffi` / `tls_client` for native TLS fingerprint spoofing).
  - Humanized request throttling and random jitter.

#### 3. Distributed Inventory Synchronization Architecture
- **Problem:** Synchronizing 1-of-1 items across 4+ marketplaces with near-zero latency.
- **Architecture:**
  - Event-driven microservices / modular workers.
  - Message broker: RabbitMQ / Apache Kafka / Redis Streams.
  - Task processing: Celery / ARQ / Celery with Python asyncio.
  - Master Inventory Store: PostgreSQL with ACID transactions.
  - Optimistic locking / Idempotency keys to avoid double-processing sales events.
  - Dead Letter Queues (DLQ) for failed sync attempts with automated alerts.

#### 4. Replay-Traffic Testing & Self-Healing Pipelines
- **Traffic Capture:** Continuously recording sanitized production marketplace interactions into test fixtures (VCR.py / wiremock / recorded HAR traces).
- **Automated Canary Sweeps:** Scheduled canary jobs running synthetic listing operations against test accounts to verify API contracts haven't changed.
- **Schema Drift Detection:** Using Pydantic models with strict validation (`extra="forbid"` or drift warning hooks) to detect undocumented additions or missing attributes immediately.

---

## Part 2: Round 3 Preparation — Lanzadera On-Site Whiteboard Day

### Location & Context
- **Venue:** Lanzadera (Marina de Empresas), Port of Valencia, Spain.
- **Format:**
  - Morning/Afternoon: Whiteboard session on a real live ruit problem with engineering leadership.
  - Lunch with the entire team (on ruit).
  - Meeting team members, understanding startup rhythm.

### Likely Whiteboard Problems & How to Tackle Them

#### Scenario A: Designing the Marketplace Ingestion & Sync Engine from Scratch
- **Requirements:** Support 10,000 active sellers, 500,000 inventory items, syncing to Wallapop, Vinted, eBay, Depop.
- **Whiteboard Flow:**
  1. *Scope Clarification:* Ingestion volume, acceptable sync lag (e.g. < 5 seconds), failure rates, rate limits per platform.
  2. *High-Level Architecture:* API Gateway -> Ingestion Service -> Message Queue -> Platform-specific Worker Pools -> Data Store.
  3. *Data Modeling:* Unified Product Schema vs Platform-specific Listing Schemas (mapping tables).
  4. *Reliability & Fault Tolerance:* Handling 429 Too Many Requests, backoff strategies, proxy failure failover.
  5. *Sync Consistency:* Solving the 2-buyer race condition across distinct platforms.

#### Scenario B: Designing a Self-Healing Marketplace Adapter
- **Requirements:** When Wallapop updates its mobile API schema or web HTML without notice, how does ruit detect, quarantine, notify, and recover without seller data corruption?
- **Whiteboard Flow:**
  1. Circuit breakers on platform adapters to prevent cascading queue backups.
  2. Canary verification workers running synthetic listing queries.
  3. Real-time alerting to Slack / PagerDuty with precise payload diffs.
  4. Fallback paths (e.g., falling back from broken private API to headless browser automation temporarily while the API is patched).

---

## Part 3: Checklist Before Round 2 & Round 3

- [ ] Re-run the `/mock-tech` command in this harness with an AI assistant to practice explaining reverse-engineering, Frida, and proxy rotation.
- [ ] Review Python integration tools: `httpx`, `asyncio`, `celery`, `pydantic v2`, `playwright-python`, `curl_cffi`.
- [ ] Practice drawing systems diagrams on paper or Excalidraw (Inventory Master, Queue Workers, Marketplace Adapters).
- [ ] Prepare travel logistics for Valencia and review Spanish conversational basics.
