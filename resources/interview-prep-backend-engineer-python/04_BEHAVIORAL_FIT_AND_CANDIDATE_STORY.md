# Behavioral Fit, Candidate Narrative & Working with AI Agents

---

## 1. The Candidate Narrative: "Tell Me About Yourself"

### 90-Second Founder-Focused Pitch
> *"I’ve been building and scaling software for over 9 years, and my career has always been driven by one core theme: **building tools and high-resilience systems that people genuinely rely on every single day**.*  
>  
> *I started deep in systems and performance engineering—building cross-platform desktop applications and high-performance JSON viewing engines capable of handling multi-gigabyte datasets for over 60,000 users worldwide.*  
>  
> *Over the past six years at Dadroit and Parsaiane, I scaled full-stack web platforms serving 60,000+ concurrent users, built the crawler and AI-enrichment engine across 150+ tech sources, and created a top-10 VS Code extension that reached over 630,000 developers. I also shipped the Dadroit JSON Generator extension and package in three days.*  
>  
> *Most recently, at QueryLaw, I owned the full-stack architecture for an AI automation platform modeling complex European laws into machine-readable decision graphs, achieving 95%+ reasoning accuracy through structured validation pipelines.*  
>  
> *What excites me about ruit is the mission to make second-hand the primary way Europe shops. Reverse-engineering platforms like Wallapop and Vinted, dealing with undocumented changes, and building a bulletproof multi-channel operating system is the exact intersection of crawling, systems resilience, and high-agency product building where I thrive."*

---

## 2. Core Pillars of the Narrative

### Pillar 1: Where You Come From & Breadth of Experience
- **Systems & Performance Foundations (2016–2018):**
  - Delphi, Free Pascal, C-style memory management, custom 2D graphics rendering engines (Skia), SQLite/SQL Server/PostgreSQL.
  - Built a JSON Viewer desktop application handling multi-GB datasets with instant tree rendering for 60K+ developers.
  - *Why it matters:* You don't just know high-level web APIs; you understand processes, sockets, memory constraints, and binary data.
- **High-Scale Web & Developer Tools (2019–2024 at Parsaiane / Dadroit):**
  - Scaled PERN/MERN systems for 60K+ concurrent users with 99.9% uptime.
  - 35–40% API latency reductions via query optimization, indexing, and Redis caching.
  - Built the 150+ source crawling and LLM enrichment engine (`tool-news-feed-app`).
  - Shipped the Dadroit JSON Generator in 3 days across VS Code, npm, and Homebrew (`tool-json-generator`).
  - Created top-10 VS Code extensions with 630K+ installs and authored 12 technical articles reaching 120K+ readers.
  - *Why it matters:* Proven track record of shipping fast and maintaining software that scaled organically.
- **AI Systems & Decision Modeling (2025–2026 at TreeScribe / QueryLaw):**
  - Modeled complex European statutes into machine-readable automated decision graphs.
  - Reached 95%+ accuracy with Anthropic Claude Opus/Sonnet using structured JSON validation pipelines (AJV) and telemetry for real-time failure reproduction.
  - *Why it matters:* You know how to make AI reliable and deterministic in mission-critical applications.

---

## 3. How You Work with AI Agents (Crucial: Luis's Explicit Prompt)

> **Context:** In his very first email, Luis specifically asked to see *"how you work with agents"*. Demonstrating a modern, AI-augmented engineering philosophy is a critical positive signal for ruit.

### Simin's AI Agent Philosophy: "The Architect & Autonomous Crew"
1. **AI as an Autonomous Force Multiplier, Not Just Autocomplete:**
   - *"I don’t just use AI for tab-completion. I treat autonomous agents (Claude Code, Antigravity, Cursor) as junior-to-mid pair engineers who execute well-bounded, parallel tasks."*
2. **Harness Engineering & Guardrails:**
   - *"Agents are only as good as the harness you build around them. Just like I built structured AJV JSON Schema validation pipelines at QueryLaw to keep LLM reasoning above 95% accuracy, I give coding agents strict schemas, architectural invariants, and automated test feedback loops."*
3. **Specific Workflows You Run with Agents:**
   - **Reverse-Engineering & API Reverse-Mapping:** Feeding raw HTTP/HAR session recordings of undocumented marketplace requests to agents to automatically generate typed Pydantic models and API client stubs.
   - **Test Suite Generation & Edge-Case Fuzzing:** Prompting agents to generate negative test cases, malformed payloads, rate-limit simulations, and network partition scenarios.
   - **Boilerplate & Connector Scaffolding:** Using agents to rapidly scaffold new connector adapters (e.g., Etsy, Depop, Subito) while focusing human engineering on bot evasion, session cookies, and distributed transaction locks.
   - **Continuous Verification:** Setting up automated test suites so when an agent generates code, it must pass tests before merging.

---

## 4. Why ruit and What Drives You

### What Drives You
- **High-Agency Ownership:** You enjoy seeing the full chain—from diagnosing a broken marketplace reverse-proxy to modifying the database query to ensuring the merchant's dashboard updates in real time.
- **Real-World Impact:** Building software that empowers independent merchants, vintage sellers, and sustainable entrepreneurs to grow their businesses.
- **Thriving in Ambiguity:** You love the technical puzzle of integrating platforms that don't provide neat documentation.

### Why ruit?
- **The Market Opportunity:** Second-hand fashion and recommerce in Europe is growing exponentially, but the merchant tooling is stuck in the 2000s. Providing the unified operating system is a massive market.
- **The Culture & Location:**
  - Fast-moving startup culture at **Lanzadera (Marina de Empresas)** in the Port of Valencia.
  - Values alignment: You love collaborative team dynamics (weekly Thursday lunches, Friday games), transparent communication, and rapid shipping cycles.
  - **Relocation Commitment:** Fully enthusiastic about moving to Valencia, Spain. You have elementary conversational Spanish and full professional English, and are eager to immerse yourself locally.

---

## 5. Strategic Questions to Ask Luis Grau

Having 4–5 sharp, founder-level questions prepared will demonstrate that you think like a co-builder, not just an applicant.

1. **On Integration Strategy & Cat-and-Mouse Dynamics:**
   > *"Wallapop and Vinted are notorious for frequent client-side obfuscation and anti-bot updates. Today at ruit, how much of our integration stability comes from mobile app reverse-engineering versus web automation, and what does our current replay-testing pipeline look like when a platform pushes an unexpected breaking change?"*

2. **On Race Conditions & Inventory Consistency:**
   > *"When a seller has a unique, one-of-a-kind vintage jacket listed simultaneously on Wallapop, Vinted, and eBay, and a buyer checks out on Wallapop, what is our target latency to delist on Vinted, and how do we handle the edge case where two users buy the item within a 3-second window?"*

3. **On Product Roadmap & New Marketplaces:**
   > *"Looking at the roadmap—Etsy, Depop, Leboncoin, Subito—what criteria determines the order of platforms we integrate next? Is it seller demand volume, or the technical complexity and stability of reverse-engineering the platform?"*

4. **On Team Growth & The Next 12 Months:**
   > *"You mentioned in your email that whoever joins now will shape a big part of what ruit becomes. What does success look like for this Senior Integrations Engineer in their first 90 days at Lanzadera?"*
