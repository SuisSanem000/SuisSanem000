# Project Deep Dive: News Feed App & 150+ Source Crawler

> **Direct CEO Hook:** Luis Grau specifically highlighted:  
> *"The crawler behind your news app for over 150 sites [is] close to the integration work we do."*

---

## 1. Project Overview & Context

- **Repository:** `tool-news-feed-app` (monorepo featuring `EyeServer`, `EyeAI`, `EyeCustomCrawlers`, `EyeTest`).
- **Core Mission:** A full-stack developer news platform that continuously crawls, extracts, sanitizes, enriches with LLMs, and serves personalized technical feeds from **over 150 engineering blogs, tech publications, and developer aggregators**.
- **Stack:**
  - **Runtime & Language:** TypeScript / Node.js
  - **Storage:** PostgreSQL (production database), SQLite (early prototype crawler)
  - **Crawling & Ingestion:** Axios, `feedparser`, Cheerio, `@mozilla/readability`, `jsdom`, `sharp`, `sharp-ico`, `sanitize-html`, `he`
  - **AI Integration:** OpenAI Chat Completions (`gpt-4`), Google Cloud Vertex AI, `@dqbd/tiktoken`
  - **Client & Tooling:** Vite, React, IndexedDB (client read state persistence)

---

## 2. Architecture & Ingestion Engine

```
[150+ Online Sources]
       │
       ├───► RSS / Atom Feeds ──► Stream Ingestion (feedparser)
       │                                  │
       └───► Non-RSS Sites / Blogs ───────┼─► Custom Crawlers (MongoDB, Splunk,
             (Hacker News, Lobsters, etc.)│   Cassandra, SQLite, CockroachDB)
                                          ▼
                             [Network Ingestion Layer]
                             • Browser-mimicking headers (Sec-Fetch-*, UA)
                             • Axios timeout & error boundary
                                          │
                                          ▼
                            [DOM Extraction & Cleaning]
                            • Mozilla Readability (clean article text)
                            • Sanitize-HTML & entity decoding (he)
                            • Sharp / Sharp-ICO icon & Retina image extraction
                                          │
                                          ▼
                           [PostgreSQL Ingestion & Deduplication]
                           • ON CONFLICT (url) DO NOTHING
                           • Status: Pending / Done
                           • Exponential retry queue (next_retry_at)
                                          │
                                          ▼
                            [OpenAI / LLM Enrichment Worker]
                            • Informing Call (Prime categories once)
                            • Per-article prompt (Index-based)
                            • Regex JSON cleaner (strips unescaped newlines)
                            • Relativity score (-100 to +100)
                            • Metadata pricing & tiktoken dollar tracking
                                          │
                                          ▼
                           [Static Materialization & Cache]
                           • Pre-rendered YYYY-MM-DD.json
                           • Locally cached & resized images (1x / 2x)
                           • Ultra-low latency client delivery
```

---

## 3. Core Technical Subsystems & Implementation Details

### A. Dual Ingestion Pipelines (RSS Stream vs. Custom Scrapers)
1. **Generic RSS/Atom Stream Pipeline:**
   - In `crawler.ts` (`parseRssAndInsertArticles`), responses are piped as streams directly to `feedparser`.
   - Each stream event checks publication dates (`pubDate >= startDate`) to prevent backfilling stale items.
   - Extracts canonical article URLs and dispatches background metadata extraction.
2. **Dedicated Scraping Engines for Non-RSS Directories:**
   - Sources like **Hacker News**, **Lobsters**, **MongoDB Developer Hub**, **Splunk Engineering**, **Apache Cassandra**, **SQLite News**, and **Cockroach Labs** lack reliable RSS feeds.
   - Dedicated modules (`customCrawlers/`) implement custom pagination loops (`baseURL + page`), targeted DOM selectors (e.g., `div.css-oebmgh` and card links for MongoDB), and publication date range parsing.

### B. Concurrency Control & Worker Orchestration
- Rather than flooding network sockets with 150+ simultaneous requests (risking IP bans and memory leaks), `crawler.ts` implements a custom promise synchronizer:
  ```typescript
  // Concurrency pool with shared synchronizer queue
  let maxConcurrentCrawls = config.maxConcurrentCrawls;
  let index = 0;
  let synchronizer = Promise.resolve();
  const threads = [];
  const job = (resolve: () => void) => {
      synchronizer = synchronizer.then(() => index++).then(index => {
          if (index < sources.length) {
              crawlSource(sharedClient, sources[index]).then(() => job(resolve));
          } else {
              resolve();
          }
      });
  };
  for (let i = 0; i < maxConcurrentCrawls; i++) {
      threads.push(new Promise<void>(resolve => job(resolve)));
  }
  await Promise.all(threads);
  ```
- This ensures fixed concurrency, steady memory usage, and predictable database connection pooling (`PoolClient`).

### C. Network Resilience & Anti-Bot Protection
- `crawlHelpers.fetchWithAxios` sets realistic browser identity headers:
  - Modern Chrome `User-Agent` strings
  - Full `Accept` headers with modern MIME types (`image/webp,image/apng,*/*;q=0.8`)
  - Modern browser fetch metadata: `Sec-Fetch-Site: none`, `Sec-Fetch-Mode: navigate`, `Sec-Fetch-User: ?1`, `Sec-Fetch-Dest: document`
  - `Upgrade-Insecure-Requests: 1`
  - Realistic referrers (`Referer: https://www.google.com/`)
  - Strict 30-second timeouts.

### D. Content Normalization & Readability Pipeline
- Many articles contain mega-menus, sidebars, cookie banners, and comment sections.
- Simin used **Mozilla Readability** (`@mozilla/readability`) inside a virtual **JSDOM** instance preceded by `sanitizeHtml`. This cleanly extracts just the core article content without editorial clutter.
- Extracted summaries are passed through `htmlToPlainText` to strip tags and decode HTML entities using `he.decode()`.

### E. Multi-Tier Media & Icon Handling
- To build a polished feed UI, every source and article needs crisp icons and cover images:
  - Favicon fallback cascade: looks for `<link rel="icon">`, `<link rel="shortcut icon">`, `<link rel="apple-touch-icon">`, then steps up URL domain hierarchies, and falls back to `og:image`.
  - Binary `.ico` parsing: Uses `sharp-ico` to dissect multi-resolution Windows icon containers into individual PNG frames (16x16, 32x32, largest).
  - Cover images: Downloads original images, computes cryptographic UUID hashes, strips data URIs into temporary buffers, and uses `sharp` to generate 1x (374px) and 2x Retina (748px) web-optimized versions.

### F. Database Architecture & Failure Recovery
- **PostgreSQL Schema:**
  - Table: `article` (and staging table `raw_article`).
  - Idempotent insertion: `INSERT INTO article (...) ON CONFLICT (url) DO NOTHING RETURNING key`.
- **Status Lifecycle & Exponential Retries:**
  - Status starts as `Pending`. Once HTML, full content, and 1x/2x images are captured, status transitions to `Done`.
  - Failed or partially fetched articles are updated with `next_retry_at = NOW() + INTERVAL '1 hour'`.
  - The function `retryPendingArticles` queries `WHERE status = 'Pending' AND next_retry_at < NOW() ORDER BY next_retry_at LIMIT 50`, preventing repeated thundering herds on failing endpoints.
- **Structured Error Taxonomy:**
  - Logs are categorized by domain: `Network`, `Crawl`, `Parse`, `IO`, `Database`, `AI`. Every log is keyed by a unique `crawlKey` UUID so an entire run can be analyzed end-to-end.

### G. OpenAI Enrichment Engine & Token Cost Benchmarking
1. **The "Informing Call" Pattern:**
   - Instead of repeating lengthy category definitions (dozens of industry descriptions and content type definitions) inside every single article prompt, Simin primed the model session once with an "Informing Call".
   - Subsequent prompts reference categories strictly by numerical index or key, reducing token consumption by up to **60% per article**.
2. **JSON Parsing Resiliency:**
   - Real-world LLM responses frequently break `JSON.parse` due to unescaped markdown code fences or unescaped newlines inside strings.
   - Built `extractAndParseJSON`:
     - Strips markdown triple backticks.
     - Uses targeted regex to replace embedded newlines *only* within quoted string values:
       ```typescript
       cleanedString = cleanedString.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
           return match.replace(/(?:\r\n|\r|\n)/g, ' ');
       });
       ```
3. **Vertex AI vs. OpenAI Benchmarking (`EyeAI`):**
   - Built a dedicated experimentation harness comparing Google Cloud Vertex AI against OpenAI Chat Completions on real crawled articles.
   - Integrated `@dqbd/tiktoken` to calculate input and output token consumption and exact dollar cost per call based on model pricing tables.

---

## 4. How This Maps 1:1 to ruit's Integration Challenges

| News Feed Crawler Challenge | ruit Marketplace Integration Parallel | How to Frame it to Luis |
|---|---|---|
| **150+ Heterogeneous Sources** | Multi-marketplace synchronization (Wallapop, Vinted, eBay, Depop, Subito, Leboncoin) | *"In both systems, you cannot rely on a single uniform API. You need modular scrapers with unified internal domain models."* |
| **DOM & Schema Drift** | Marketplace private APIs changing unannounced or tweaking web layouts | *"When MongoDB or Splunk altered their blog DOM, my error classifier immediately flagged parse failures. At ruit, we can replay traffic and detect schema drift before users notice."* |
| **Rate Limits & Anti-Bot** | Marketplaces using Cloudflare, Akamai, Datadome, rate limits | *"I used randomized browser headers, concurrency pools, and retry queues. For ruit, we expand this with residential proxy rotation, cookie/session caching, and request pacing."* |
| **Deduplication & Idempotency** | Preventing duplicate product listings across platforms | *"I used URL normalization, UUID crawl keys, and `ON CONFLICT DO NOTHING`. In ruit's inventory sync, idempotency keys ensure an item sold on Wallapop is never double-sold."* |
| **Retry Backoff & Resilience** | Handling temporary marketplace outages or network blips | *"Articles that fail image extraction or network requests get tagged with `next_retry_at` and processed in controlled batches. We never drop data or lock threads."* |
| **LLM Classification & Parsing** | Extracting structured product attributes (brand, condition, size, category) | *"Sellers enter messy descriptions. My informing-call pattern and resilient JSON extraction pipeline can structure unstructured seller listings into standardized marketplace categories."* |

---

## 5. Anticipated Questions from Luis & High-Impact Answers

### Q1: *"How did you handle websites blocking your crawler or changing their layout?"*
> **Answer:**  
> "I approached that on two fronts: network stealth and architectural isolation. On the network side, I configured Axios with complete browser-like headers (`Sec-Fetch-*`, realistic User-Agents, Google referrers) and enforced strict concurrency limits rather than hammering servers.  
> On the layout side, I decoupled source logic into independent custom crawler modules (like `mongodbCrawlHelper`, `splunkCrawlHelper`) alongside a general Mozilla Readability pipeline. When a layout broke, it didn't crash the orchestrator; the error was isolated, tagged with a `Parse` error type against that source's UUID crawl key, and queued for retry. That architecture makes it easy to maintain and patch dozens of distinct platform adapters without regressions."

### Q2: *"Why did you build both RSS ingestion and custom scrapers?"*
> **Answer:**  
> "Because the real web is heterogeneous. RSS is clean when available, but major hubs like Hacker News or modern engineering blogs either don't provide feeds or provide truncated snippets without full content, author metadata, or high-res images. To build a premium experience for developers, I built custom DOM walkers that handle pagination, image extraction, and metadata normalization. It’s very similar to ruit: some platforms like eBay have official APIs, while platforms like Wallapop or Vinted require custom extraction engines."

### Q3: *"Tell me about the AI enrichment pipeline and why you benchmarked Vertex AI vs OpenAI."*
> **Answer:**  
> "When scaling to thousands of articles, LLM API costs and latency compound quickly. I wanted to see whether Google Vertex AI or OpenAI delivered better structured classification and summarization per dollar. I built a benchmarking app (`EyeAI`) with Tiktoken to track exact token costs per call.  
> To make it economically viable, I invented an 'informing call' pattern: priming the session once with industry and type schemas, so individual article prompts only had to output indices rather than verbose schemas, cutting token usage by over half. I also built custom regex sanitizers to handle unescaped newlines in JSON responses, ensuring 100% parsing reliability."
