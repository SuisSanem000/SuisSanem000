# 02 — Reverse Engineering, Browsers, Extensions & DevOps

> **Core Integration Challenges:** Rebuilding unofficial APIs from traffic, running automations via Chrome Extensions / Playwright, and keeping services running with zero downtime.

---

## 1. Rebuilding APIs from Network Traffic & Proactive Breakage Detection

- **Capturing Marketplace Traffic:**
  - **Web:** Inspect Chrome DevTools Network tab, export `.har` captures, copy as cURL.
  - **Mobile Apps (Better Long-Term):** Intercept iOS/Android traffic with **`mitmproxy`**. Mobile APIs break much less often than web frontends because older app versions must remain supported.
- **Session Tokens & Centralized Refresh:**
  - Token refresh endpoints must be locked in **Redis** with a distributed lock so multiple workers don't refresh the same token simultaneously and invalidate each other.
- **Catching Breakages Before Sellers Notice:**
  - Validate every response against strict **data schemas and contract models**.
  - Track validation failure rates in Redis. If errors spike, open a circuit breaker and alert engineers with a scrubbed diff showing the exact missing or renamed JSON field.
  - Run **synthetic canaries** (test account checks) every 15 minutes during low-traffic periods.

---

## 2. Browsers, Playwright & Chrome Extensions (Manifest V3)

- **Chrome Extension (The Secret Weapon):**
  - Runs in the seller's real browser using their **residential home IP, cookies, and genuine browser fingerprint**. Bypasses anti-bot walls naturally for free.
  - **Content Script:** Interacts with the marketplace DOM directly.
  - **Background Service Worker:** Coordinates with Ruit's backend server via WebSocket / HTTPS.
- **Headless Browsers (Playwright):**
  - Use when private APIs cannot be called directly.
  - **Optimizations:** Block heavy media (`images`, `fonts`, `stylesheets`) to reduce bandwidth, and reuse browser contexts.

---

## 3. DevOps: Docker, Zero-Downtime Deployments & Observability

- **Linux & Container Signals:**
  - During deployments, Docker sends **`SIGTERM`**. Background workers must catch `SIGTERM` and finish active tasks before shutting down (graceful shutdown).
- **Zero-Downtime Database Migrations (Expand and Contract):**
  - **Step 1 (Expand):** Add the new column as nullable in Postgres. Deploy new code that writes to both old and new columns.
  - **Step 2 (Backfill):** Run a background script to populate the new column for historical rows in batches.
  - **Step 3 (Contract):** Deploy code that reads only from the new column, then safely drop the old column in a later migration.
- **The Three Pillars of Observability:**
  - **Metrics (Prometheus / Grafana):** Request count, error rates (`401`, `429`, `5xx`), latency p95/p99, and queue length per marketplace.
  - **Structured JSON Logs:** Contextual logs containing `seller_id`, `item_id`, and `marketplace`.
  - **Traces (OpenTelemetry / Sentry):** Follow an event from the webhook entry point down to the background worker and external marketplace HTTP call.
