# ⚡ Summary Before Interview: 60-Second Cheat Sheet

> **KEEP THIS OPEN DURING THE CALL WITH LUIS GRAU (CEO of ruit)**  
> **Target Call Time:** 45 minutes | **Vibe:** Founder-to-builder, direct, authentic, zero corporate fluff.

---

## 1. The 60-Second "About Me" Script (Say This Word-for-Word)

> *"I’ve been engineering systems for over 9 years with one constant theme: **building tools and high-resilience architectures that people genuinely rely on**.*  
>  
> *I started deep in low-level systems—building cross-platform desktop tools and a high-performance JSON viewing engine for 60,000+ users worldwide.*  
>  
> *At Dadroit and Parsaiane, I scaled full-stack web platforms for 60,000+ concurrent users, built a resilient crawler pipeline aggregating 150+ sources with an AI enrichment pipeline, and created a top-10 VS Code extension that reached over 630,000 developers. I also built the Dadroit JSON Generator extension in 3 days.*  
>  
> *Most recently at QueryLaw, I owned an AI platform modeling complex European statutes into machine-readable decision graphs with 95%+ reasoning accuracy through structured validation pipelines.*  
>  
> *I love ruit's mission to make second-hand the primary way Europe shops. Reverse-engineering platforms like Wallapop and Vinted and building a bulletproof integration engine is the exact intersection of crawling, systems resilience, and high-agency product building where I do my best work."*

---

## 2. The 2 Projects Luis Specifically Noticed (What to Say)

### A. Dadroit JSON Generator (`tool-json-generator`)
*Luis: "built in three days... built a VS Code extension that hundreds of thousands of developers use."*

* **The 3-Day Speed Story:**  
  *"I shipped it in 3 days by focusing strictly on the core loop: a developer writes a template, runs the command, and gets clean mock JSON instantly."*
* **The Architecture:**  
  * Built a lean TypeScript wrapper around the native Dadroit CLI engine.
  * **Dynamic Streaming Downloader:** Detects OS (`win32`, `darwin`, `linux`), streams native binary from CDN over HTTPS, follows `301/302` redirects recursively, and reports percentage progress natively in VS Code.
  * **Permissions & IPC:** Sets POSIX permissions (`chmod 0o755`) programmatically on Mac/Linux, spawns child processes (`cp.spawn`), connects stderr/stdout, and manages temp file staging.
  * **Distributed Across 3 Channels:** VS Code Marketplace, npm package (`@dadroit/json-generator`) with `postinstall` zip extraction, and Homebrew tap.
* **Why it matters to ruit:** Proves **lightning-fast execution**, startup bias for action, and deep experience wrapping external executables and headless tools.

---

### B. News Feed App & 150+ Crawler (`tool-news-feed-app`)
*Luis: "the crawler behind your news app for over 150 sites [is] close to the integration work we do."*

* **The Crawling Engine:**  
  *"Real-world web sources are messy and fragmented, so I built dual ingestion pipelines:"*
  1. **RSS Stream Pipeline:** Streamed feeds directly via `feedparser` to extract articles without memory bloat.
  2. **Custom Scrapers for 150+ Sources:** Dedicated DOM scrapers for sites without RSS (MongoDB, Splunk, Cassandra, SQLite, Hacker News) with custom pagination and selector trees.
* **Resilience & Storage:**  
  * Concurrency-capped worker pool preventing socket overload or IP bans.
  * Browser-mimicking headers (`User-Agent`, `Sec-Fetch-*`, Google referrers) and 30s timeouts.
  * Content sanitization with **Mozilla Readability** (`@mozilla/readability` + `JSDOM`) and image resizing with `sharp`/`sharp-ico`.
  * PostgreSQL idempotency (`ON CONFLICT (url) DO NOTHING`) and exponential retry queue (`next_retry_at`) with classified error logs (`Network`, `Crawl`, `Parse`, `IO`, `AI`).
* **AI Cost Optimization:**  
  * **Informing Call Pattern:** Primed the LLM session once with category rules, allowing individual article prompts to output indices rather than long strings—**slashed token usage by >50%**.
  * Benchmarked OpenAI vs Google Cloud Vertex AI using Tiktoken for dollar cost tracking per call.
* **Why it matters to ruit:** Crawling Wallapop, Vinted, and eBay involves the **exact same engineering challenges**: anti-bot headers, rate limits, schema drift, retry queues, and structuring messy listings.

---

## 3. "How Do You Work with AI Agents?" (Luis Asked This Directly!)

* **The Core Philosophy:**  
  *"I don't just use AI for tab-autocomplete. I treat autonomous agents (Claude Code, Antigravity, Cursor) as an autonomous pair-engineering crew."*
* **Harness Engineering (The Key Term):**  
  *"Agents are only as effective as the constraints you give them. Just like I built strict AJV schema validation pipelines at QueryLaw for 95%+ accuracy, I give coding agents strict schemas, architectural invariants, and automated test feedback loops."*
* **Concrete Use Cases for ruit:**  
  1. **Reverse-Engineering Traffic:** Feeding raw network traces (HAR captures) of Wallapop/Vinted to agents to automatically generate typed Pydantic models and API client stubs.
  2. **Connector Scaffolding:** Prompting agents to scaffold boilerplate for new platform adapters (Etsy, Depop) while I focus on auth, bot evasion, and session cookies.
  3. **Regression & Chaos Testing:** Generating synthetic test payloads, edge-case listing descriptions, and rate-limit simulations.

---

## 4. Culture, Valencia & Lanzadera Alignment

* **On-Site in Valencia:** 100% excited and ready to relocate to Valencia to work on-site at **Lanzadera (Marina de Empresas)**.
* **Startup Dynamic:** Looking forward to the small, intense team, end-to-end ownership, Thursday team lunches, and Friday games.
* **Language:** Fluent English (C1 / TOEFL 110). Conversational Spanish and eager to immerse locally.

---

## 5. Top 2 Questions to Ask Luis at the End

1. *"Between Wallapop, Vinted, and eBay, what is currently our biggest technical challenge: anti-bot protections and rate-limiting, or keeping inventory synchronized with sub-second latency across all platforms?"*
2. *"What would make you look back 90 days from now and say, 'Hiring Simin was one of the best decisions we made for ruit'?"*
