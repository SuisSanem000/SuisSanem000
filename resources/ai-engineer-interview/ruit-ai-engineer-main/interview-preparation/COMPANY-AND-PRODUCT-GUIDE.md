# Company, Product & Position Guide — Ruit

> **Quick Context:** This file gives you everything you need to know about **Ruit**, their **product**, the **team**, and the **exact position you are applying for**, so you can speak with full confidence and insider knowledge during your interview at Lanzadera.

---

## 1. What Position Are You Applying For?

- **Official Job Title:** **Senior Backend Engineer, Integrations (Python)**
- **Dual Consideration (From Luis's Email):**
  - *"A quick note: you applied for multiple roles. There's no need to fill in two forms: I'll consider you for both roles with the one I sent you."*
  - You are also being evaluated for **Senior Full Stack Engineer, Integrations (Python) / AI Engineer**.
- **What This Role Actually Does:**
  - Build and maintain marketplace connectors (Wallapop, Vinted, eBay, Depop, Vestiaire, Facebook Marketplace, etc.).
  - Rebuild APIs using network traffic (`.har` files and mobile proxies) when marketplaces do not offer public APIs.
  - Build **proactive breakage detection** so Ruit catches schema changes and blocks *before* any seller notices.
  - Build safe inventory sync to prevent double-selling when an item sells on one platform.
  - Work with **AI agents every day** (Ruit provides ~€2,000/month budget per engineer for AI tools).

---

## 2. About Ruit (The Company)

- **Website:** `https://ruit.es/en/`
- **Location:** On-site in **Valencia**, at **Lanzadera** (Marina de Empresas, Carrer del Moll de la Duana, s/n, 46024 València — by the beach).
  - *Fun Fact:* Lanzadera is ranked **19th among Europe's startup hubs** by Financial Times and Statista.
- **Mission:**
  > *"We want second-hand to become the first way everyone in Europe shops. Millions of products sold again instead of made new, millions of euros for the people who sell them, and a world a bit better than we found it."*
- **Funding & Traction:**
  - Raised close to **€1M** from top Spanish investors: **Angels Capital** (the investment fund of Juan Roig, founder of Mercadona, based at Lanzadera), **Decelera Ventures**, **Abac Capital**, and **Successful Fund**.
  - Target: Reaching **€1M in Annual Recurring Revenue (ARR)** by the end of 2027.
- **Team Culture & Perks:**
  - Close-knit, high-velocity engineering team.
  - Lunch together every Thursday (and team lunch during your interview on Friday at 14:00!).
  - Board games / video games on Friday afternoons.
  - Every engineer works across the product and speaks with real sellers.
  - Massive AI budget: **~€2,000/month** per engineer for AI agents, plus budgets for servers and experiments.

---

## 3. Key People to Know

- **Luis Grau (CEO & Co-founder):**
  - He conducts the values and conversational interviews, reviews applications personally, and leads vision.
  - He loves engineers who **ship things people rely on** (which is why your Dadroit VS Code extension and 150-site news crawler immediately stood out to him).
- **Alonso Veliz Garcia (Founding Engineer):**
  - Profile: Python, Django, Rust, Cybersecurity, Machine Learning.
  - *Why this matters:* Alonso's Rust background is the exact reason Luis has **"error handling philosophy: Python vs Go vs Rust"** on his email cheat sheet. When talking about error handling, mentioning Rust's explicit `Result<T, E>` pattern shows you speak their language.

---

## 4. The Product: What Ruit Actually Does & How It Works

### The Real Problem for Professional Second-Hand Sellers:
- Professional vintage and second-hand sellers have hundreds of unique physical items (quantity = 1).
- To make a living, they must list their items on multiple marketplaces (Wallapop, Vinted, eBay, Depop, Vestiaire Collective).
- Today, sellers do this manually: taking photos, copying descriptions, selecting categories for each platform, and adjusting prices.
- **The Nightmare ("Double-Selling"):** When an item sells on Vinted, the seller must immediately open Wallapop and eBay to delete the listing manually. If someone buys it on Wallapop 10 minutes later, the seller has to cancel the sale, gets penalized by the platform, loses reputation, and risks getting banned.

### How Ruit Solves This (The Core Features):
- **1. AI Listing from a Single Photo:**
  - The seller takes a photo of an item.
  - Ruit's multimodal AI identifies the product, brand, color, and condition, generates optimized descriptions, and suggests market prices.
- **2. One-Click Multi-Marketplace Cross-Listing:**
  - With one click, Ruit formats and publishes the item across Vinted, Wallapop, eBay, and more at the same time.
- **3. Instant Inventory Sync (Anti-Double-Sell):**
  - The moment an item sells on one platform, Ruit automatically delists or marks it as sold across all other platforms within seconds.
- **4. Hybrid Architecture (Chrome Extension + Cloud Workers):**
  - **Chrome Extension (Manifest V3):** Runs in the seller's browser using their real residential IP and existing cookies to bypass strict anti-bot protections.
  - **Cloud Workers (Celery + Redis):** Monitor listings, check sales, and run tasks 24/7 even when the seller's laptop is closed.
- **5. Unified Seller Dashboard:**
  - Central inbox for buyer messages across all platforms, unified order management, and sales analytics.

---

## 5. Current & Upcoming Marketplaces (Your Roadmap)

- **Currently Supported:**
  - **Wallapop** (Spain's top second-hand marketplace)
  - **Vinted** (Europe's largest second-hand clothing platform)
  - **eBay** (Global marketplace for collectibles and vintage)
- **Roadmap / Next Up to Connect (From the Job Ad):**
  - **Vestiaire Collective** (Luxury pre-owned fashion)
  - **Depop** (Gen-Z and vintage streetwear)
  - **Facebook Marketplace** (Local classifieds with huge volume)
  - **Etsy** (Vintage items and handmade goods)
  - **Amazon** & **TikTok Shop** (E-commerce and social commerce)
  - **Grailed**, **Poshmark**, **Mercari**, **Whatnot** (Fashion and live-stream auctions)
  - **Milanuncios** & **Todocolección** (Spanish classifieds and vintage collectibles)

---

## 6. How Your Experience Fits This Position Perfectly

- **1. Reverse Engineering & Web Crawling (Parsaiane News Crawler):**
  - You crawled 150+ websites, inspected HTTP traffic, bypassed anti-scraping walls, and normalized messy HTML/JSON into standard models.
  - *At Ruit:* You will do this exact same work with marketplace endpoints.
- **2. Strict Schema Validation & Self-Healing AI (QueryLaw):**
  - At QueryLaw, you built strict **JSON Schema / AJV validation** around LLMs to achieve 95%+ reliability without hallucination.
  - *At Ruit:* You use strict data contracts and validation schemas to validate marketplace responses and AI-generated listings, immediately catching when a marketplace changes its JSON fields.
- **3. Real-World Developer Tools (Dadroit VS Code Extension):**
  - Built in 3 days, reached 630K+ installs and 60K+ active users. Shows you ship fast and know how browser/editor extensions work.
  - *At Ruit:* You understand how their Chrome Extension and developer tools work together.
- **4. High-Concurrency Backend Systems (9+ Years Experience):**
  - You know how to stop double-sells using database transactions (`SELECT ... FOR UPDATE`), idempotency keys, and Redis locks.
  - While you are 100% honest that you do not know Python and have never worked with it, your 9+ years of senior backend architecture and elite AI orchestration are exactly what Ruit needs.

