# Company, Role & Interviewer Profile (ruit & Luis Grau)

---

## 1. Company Profile: ruit (ReUseIt)

### The Vision & Mission
- **Mission:** Turn second-hand into the **primary way Europe shops**.
- **The Core Problem in Recommerce:**
  - Professional second-hand sellers (vintage shops, refurbished electronics vendors, pre-owned luxury, media/booksellers) are losing hours every day managing listings across fragmented European marketplaces.
  - Unlike new goods (e-commerce with uniform SKUs, barcodes, and unified Shopify/Amazon APIs), every second-hand item is unique (one-of-a-kind condition, individual photos, custom descriptions, singular stock count = 1).
  - When an item sells on **Wallapop**, the seller must immediately take it down manually on **Vinted**, **eBay**, and **Depop** to avoid double-selling and seller penalties.
- **ruit’s Solution:**
  - The **Operating System for Professional Second-Hand Sellers**.
  - A centralized multi-channel hub allowing sellers to list once, automatically publish across all European marketplaces, synchronize inventory in real time, manage messaging/orders, and track unified financial analytics.

### Marketplaces Landscape
- **Live Platforms Today:**
  - **Wallapop** (Dominant in Spain/Italy)
  - **Vinted** (Dominant across France, Spain, UK, Benelux, Germany, Poland)
  - **eBay** (Established international player with official, albeit complex, APIs)
- **Roadmap Platforms:**
  - **Etsy** (Vintage & handmade)
  - **Depop** (Gen Z / streetwear, UK/EU)
  - **Subito** (Italy)
  - **Leboncoin** (France's massive classifieds leader)
  - **Kleinanzeigen** (Germany's classifieds leader)
  - **Marktplaats** (Netherlands leader)
  - **Discogs** (Vinyl & music collectibles)

### Location & Ecosystem: Lanzadera (Valencia)
- **Hub:** **Lanzadera / Marina de Empresas** located in the vibrant Port of Valencia, Spain.
- **Backing:** Supported by **Angels Capital** and the ecosystem founded by Juan Roig (founder of Mercadona). One of the top startup hubs in Southern Europe.
- **Work Environment:**
  - On-site, highly collaborative startup environment.
  - Traditions: **Weekly Thursday team lunches**, **Friday team games**, rapid iteration cycles.
  - High ownership: Engineers talk directly to sellers, monitor real-time sync errors, and ship fixes rapidly.

---

## 2. Interviewer Profile: Luis Grau (CEO)

### Founder Background & Communication Persona
- **Role:** Founder & CEO at ruit (`luis.grau@ruit.es`).
- **Style:** Direct, pragmatic, transparent, high-speed, appreciative of builders.
- **Key Evidence from His Direct Emails:**
  1. *Personal Application Review:* *"I've gone through every application myself, and yours stood out: you built a VS Code extension that hundreds of thousands of developers use, which says a lot about shipping things people rely on."*
  2. *Eagle-Eyed Technical Recognition:* *"The Dadroit JSON Generator extension you built in three days, and the crawler behind your news app for over 150 sites, are close to the integration work we do. We'd like to keep going with you."*
  3. *Interview Demystification:* *"It isn't technical and there's nothing to prepare. We can do it in English or in Spanish, whichever you prefer."*
  4. *Accountability & Speed:* *"The whole process takes about three weeks, and you'll never go seven days without hearing from us."*

### What Luis is REALLY Looking for in Call 1 (45-Minute Fit & Founder Call)
Despite saying *"it isn't technical and there's nothing to prepare"*, startup CEOs evaluate specific dimensions:
1. **The "Builder Instinct" (High Agency):** Did you actually write the code, make the architectural trade-offs, and debug the gnarly edge cases yourself?
2. **Speed & Pragmatism:** Luis specifically noted the *"built in three days"* aspect of your JSON Generator. He values engineers who ship working software without getting bogged down in endless bikeshedding.
3. **Resilience & Grit with Messy Systems:** Second-hand marketplaces don't want automated integrations. They change web layouts, obfuscate mobile API endpoints, and enforce bot protections. Luis wants to know if you enjoy this cat-and-mouse problem-solving or if you expect tidy Swagger docs.
4. **Mission Resonance:** Do you understand the value of circular economy, sustainable consumption, and helping small independent merchants thrive?
5. **Autonomy & Communication:** Can you handle customer-facing emergencies, take ownership from database query to UI button, and communicate clearly in English (or Spanish)?

---

## 3. Position Scope: Senior Backend Engineer, Integrations (Python)

### Primary Responsibilities
1. **Reverse-Engineering Mobile & Web Endpoints:**
   - Intercepting and decoding private APIs used by mobile apps (iOS/Android) and web frontends of platforms like Vinted, Wallapop, Depop, and Leboncoin.
   - Bypassing HMAC request signatures, dynamic headers, CSRF tokens, and TLS fingerprinting.
2. **Resilient Sync & Crawling Engine:**
   - Building distributed workers in Python (FastAPI / Celery / asyncio / Playwright / HTTPX) to sync listings, inventory quantities, images, and prices.
   - Managing proxy pools (residential vs datacenter), CAPTCHA solving, session refresh tokens, and rate limits.
3. **Self-Healing & Traffic Replay:**
   - Capturing and replaying network traffic to detect API breakages before customers report them.
   - Automated alerting when a marketplace pushes a breaking DOM or schema change.
4. **Two-Way Inventory Synchronization:**
   - Handling distributed race conditions (e.g., an item sells on Wallapop at 14:02:00 and on Vinted at 14:02:05 — eliminating the window of vulnerability).
5. **Full-Stack Startup Ownership:**
   - Python backend core, but comfortable touching PostgreSQL/Supabase, TypeScript/React/Tailwind if a UI fix is required, and talking directly with power sellers to troubleshoot syncing errors.

---

## 4. Interview Strategy for Today's Call

### Language Strategy: English vs. Spanish
- Luis gave you the choice: *"We can do it in English or in Spanish, whichever you prefer."*
- **Recommendation:**
  - Start or conduct the core in **English** (Simin has full professional proficiency, TOEFL 110/120 C1, published 12 technical articles reaching 120K+ readers).
  - Explicitly acknowledge your Spanish: *"I am happy to do this in English, but I also speak conversational Spanish and am excited to immerse myself fully in Valencia."* This shows immediate cultural adaptability and eagerness for the Valencia move.

### Conversational Blueprint (45 Minutes)
- **00–05 min:** Warm greeting, acknowledging Lanzadera & Valencia, thanking Luis for his personal note on the VS Code extension and JSON Generator.
- **05–15 min:** Simin's story — from low-level systems (Delphi/C++ JSON engine, 60K+ users) to large-scale web backends (PERN, 60K+ DAU, high concurrency) to building developer tools and AI systems (TreeScribe/QueryLaw).
- **15–30 min:** Deep-dive into the two specific projects Luis asked about:
  - `tool-news-feed-app`: 150+ scrapers, Cheerio/Readability pipeline, resilient retry queues, OpenAI/Vertex AI cost comparison.
  - `tool-json-generator`: Shipping a full-stack developer harness in 3 days, multi-platform binary IPC, 630K+ developer adoption.
- **30–38 min:** Startup fit, working with AI agents, why Valencia and ruit.
- **38–45 min:** Simin's high-impact questions for Luis.
