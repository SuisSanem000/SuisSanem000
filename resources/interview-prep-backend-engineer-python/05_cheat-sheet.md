# Round 1 CEO Call: Rapid Cheat Sheet (For Today's Call with Luis Grau)

> **Quick Snapshot:**  
> - **Who:** Luis Grau, CEO of ruit (`luis.grau@ruit.es`).  
> - **Duration:** 45 minutes on video.  
> - **Format:** Fit, personal motivation, project deep-dive, startup culture.  
> - **Tone:** Authentic, passionate builder, pragmatic, direct, founder-to-builder.  
> - **Language:** English (with an opening or warm acknowledgment of Spanish and excitement for Valencia).

---

## 1. Opening Icebreaker & Setting the Tone

- **Greeting:**
  > *"Hi Luis, great to meet you! Thanks for having me. I really appreciated your thoughtful email about the Dadroit JSON Generator and the news feed crawler—it’s rare to see a founder look so closely at a candidate’s actual code and architecture."*
- **Language Bridge:**
  > *"We can certainly do this call in English, but as I mentioned, I also speak conversational Spanish and am really looking forward to immersing myself fully in Valencia!"*

---

## 2. Project Cheat Cards (Have These on Screen)

### Card A: The News Feed App & 150+ Crawler (`tool-news-feed-app`)
*Luis said: "the crawler behind your news app for over 150 sites... close to the integration work we do."*
- **1-Sentence Summary:** A production tech news aggregator that crawls 150+ heterogeneous sources, extracts and sanitizes content via Mozilla Readability, enriches articles using a cost-optimized LLM pipeline, and materializes low-latency feeds.
- **Top 3 Tech Bullets to Mention:**
  1. **Dual Ingestion Engine:** Stream-based RSS ingestion via `feedparser` paired with dedicated custom scrapers (MongoDB, Splunk, Cassandra, SQLite, Hacker News) with custom pagination and selector trees.
  2. **Resilience & Idempotency:** PostgreSQL `ON CONFLICT (url) DO NOTHING`, concurrency-capped worker pools, classified error logging (`Network`, `Crawl`, `Parse`, `IO`, `AI`), and an automated exponential retry queue (`next_retry_at`).
  3. **AI Pipeline & Cost Optimization:** Designed an "informing call" pattern to prime category schemas once per session, cutting per-article token usage by >50%. Benchmarked OpenAI vs Google Cloud Vertex AI using Tiktoken for real-time dollar tracking.
- **Ruit Parallel:** Exactly matches reverse-engineering Wallapop/Vinted/eBay, scraping listing feeds, bypassing bot detection, handling schema drift, and structuring raw listings into standard inventory.

---

### Card B: The Dadroit JSON Generator (`tool-json-generator`)
*Luis said: "built in three days... built a VS Code extension that hundreds of thousands of developers use."*
- **1-Sentence Summary:** A cross-platform developer tool and package that generates realistic, nested mock JSON from declarative templates, delivered via a VS Code extension, npm CLI package, and Homebrew formula.
- **Top 3 Tech Bullets to Mention:**
  1. **Shipped in 3 Days:** Full TypeScript architecture, dynamic binary streaming, child process IPC, and package distribution all designed, coded, and released in 72 hours.
  2. **Dynamic Cross-Platform Binary Harness:** Automatically detects OS (`win32`, `darwin`, `linux`), streams native CLI binaries over HTTPS with redirect resolution and native progress reporting, sets POSIX executable permissions (`chmod 0o755`), and manages IPC via `child_process.spawn`.
  3. **Multi-Channel Distribution:** Built for the VS Code Marketplace (630K+ extension installs ecosystem), npm registry with automated `postinstall` zip extraction, and Homebrew tap.
- **Ruit Parallel:** Proves speed of execution, startup bias for action, and deep experience building integration wrappers around native executables and external tooling.

---

## 3. Top 7 Anticipated Questions & High-Impact Answers

### 1. "Tell me about where you come from and what drives you."
- **Focus:** 9+ years journey from low-level systems & high-performance JSON viewing (60K+ users) to large-scale web backends (60K+ DAU) and AI systems (TreeScribe 95%+ accuracy).
- **Driver:** Shipping software that real people and businesses depend on daily, and solving gnarly real-world engineering puzzles.

### 2. "How do you work with AI agents?" (Luis's explicit question from Email 1)
- **Answer:**
  - Treat agents (Claude Code, Antigravity, Cursor) as autonomous force multipliers, not just autocomplete.
  - Apply **Harness Engineering**: Provide strict schemas, invariants, and automated test feedback loops (antifragile systems).
  - Use agents to reverse-engineer network captures (HAR files to Pydantic models), scaffold new platform adapters (Etsy, Depop), and generate edge-case regression test suites.

### 3. "How do you feel about moving to Valencia and working on-site at Lanzadera?"
- **Answer:**
  - Enthusiastic and 100% committed. Lanzadera and Marina de Empresas is one of Europe's top startup hubs.
  - Love the startup camaraderie—Thursday team lunches, Friday games, working directly with founders and merchants.
  - Full professional English, conversational Spanish, and excited to settle in Valencia.

### 4. "How do you handle undocumented marketplace APIs breaking overnight?"
- **Answer:**
  - **Defensive Design:** Isolate platform adapters behind a strict internal domain interface.
  - **Telemetry & Replay Traffic:** Replay recorded traffic and run canary health-checks on real seller listings.
  - **Error Classification:** Distinguish between network blocks (rate-limiting/proxy ban) vs. schema drift (DOM change or new JSON payload key).
  - **Fast Recovery:** Inspect the updated network traffic, patch the adapter, and deploy immediately.

### 5. "What if an item is sold on Wallapop and Vinted at the exact same second?"
- **Answer:**
  - This is a classic distributed two-way sync race condition.
  - We need distributed locking (e.g., Redis Redlock) or database row-level locking on the master inventory record with an idempotency key.
  - When the webhook/sync event arrives, the first platform to acquire the lock completes the checkout; the second sync attempt detects the zero-stock state and triggers an immediate cancel/refund API call before seller penalties kick in.

### 6. "Why ruit instead of a big tech company or another remote role?"
- **Answer:**
  - In large corporations, you own a tiny slice of an internal tool. At ruit, you are shaping the operating system of European recommerce.
  - As Luis noted, whoever joins now shapes what ruit becomes. I thrive on end-to-end responsibility, direct customer feedback, and seeing my code move the needle for real merchants.

### 7. "Do you have any questions for me?"
- *Pick 2–3 from your prepared list (see Section 4).*

---

## 4. Your Questions for Luis (Choose 2 or 3)

1. *"Today, between Wallapop, Vinted, and eBay, what is currently our biggest engineering bottleneck: rate-limiting/bot-detection, or keeping inventory synchronized with near-zero latency?"*
2. *"How does the team currently simulate and replay marketplace traffic to catch undocumented API changes before our sellers experience errors?"*
3. *"Looking ahead at Etsy, Depop, and Leboncoin, what determines the priority of our integration roadmap—merchant demand or the technical complexity of reverse-engineering?"*
4. *"What would make you look back 90 days from now and say, 'Hiring Simin was one of the best decisions we made for ruit'?"*

---

## 5. Closing the Call

> *"Luis, this was a fantastic conversation. Everything you've shared about ruit’s vision and the culture at Lanzadera confirms that this is exactly the team and challenge I want to dedicate myself to. I’m really looking forward to the technical discussion and coming over to Valencia for the whiteboard day!"*
