# 01 — Studio & Market Intelligence: EXCO Game Studio (X.CO)

> **Interview Context:** Introductory / Screening Call  
> **Panel:** **Jeremie** (CFO / Admin) & **Serhii** (Head of Engineering)  
> **Referral Connection:** **Fredrik Elmqvist** (Founder) shared your CV directly with Jeremie.  
> **Format:** Remote (Full-Time or Part-Time open for discussion)

---

## 1. Studio Identity & Origin
* **Official Name:** **EXCO Game Studio** (`exco.gg`), short for *Excommunicado*.
* **Founded:** Late **2025** by **Fredrik Elmqvist**, the founder and former CEO of **Yggdrasil Gaming**.
* **Core Mission ("No Clones" Philosophy):**
  * Launched explicitly to rebel against "tired and lazy" industry reskins, recycled themes (e.g., generic Egyptian/buffalo slots), and licensed template engines.
  * Every game is built **from scratch** with original math models ("the engine"), distinct visual identity, and bespoke features.
* **Target Audience:**
  * **B2B Customers:** Regulated online casino operators and aggregators worldwide (accessible via EXCO's partner **Client Zone** with game sheets, demos, and integration assets).
  * **End Players:** Slot players seeking high-craft, stylized, edgy themes and high-tempo, mechanic-driven gameplay rather than generic clones.

---

## 2. Games Portfolio & Proprietary Mechanics
* **Release Cadence:** Targeting **monthly new title releases** across a growing portfolio—balancing rapid cadence with high production polish.
* **Proprietary Mechanic Suite (`GAMEX`):**
  * *Wrapper Stacks*, *Power Field*, *Power Bar*, *Boss Fights*, *Doubling Dial*, and *Swimmer Reel* (e.g., 5x1 reel setups paired with custom grids and wild multipliers).
* **Known Titles & Aesthetic:**
  * ***VEGASCALINE*** (Sept 2025 debut): Psychedelic, neon-soaked aesthetic.
  * ***Piranha Bite Club***: 5x5 grid beach-horror theme with quirky 1950s vintage illustrations.
  * ***Ministry of Like*** (late 2026): Satirizes social media algorithms and "like" obsession.
  * Other portfolio titles: ***Luna X***, ***Apex Dregs***, ***The Robbin' Goblins***.
  * **Visual Signature:** Bold street-art, graffiti-inspired art, vibrant neon palettes, and heavily stylized UI/UX.

---

## 3. Business Model, Tech Stack & Distribution
* **B2B Monetization Model:**
  * Studio builds original games and distributes them to online casino operators via aggregators (revenue share / GGR-based B2B licensing).
  * **Cost-to-Launch Equation:** Because EXCO refuses to build clone games, every new monthly release carries real engineering and art cost. **Shared client architecture** is the key financial lever to keep monthly production costs predictable while preserving unique game feel.
* **Backend & Distribution Infrastructure:**
  * **RGS Partner:** Built on **Tequity's modular Remote Gaming Server (RGS)**, which handles RNG outcomes, game math execution, wallet transactions, and regulatory compliance.
  * **Aggregator Reach:** Integrated with major B2B networks including **SOFTSWISS** to reach hundreds of casino brands.
* **Expected Front End Tech Stack:**
  * **Browser-First HTML5 (Mobile & Desktop):** Cross-platform web clients written in **TypeScript / JavaScript**.
  * **2D Rendering & Animation:** Hardware-accelerated **WebGL / Canvas 2D** (typically **PixiJS** in HTML5 iGaming), paired with skeletal/vector animations (Spine/Lottie) and Figma-driven UI layers.
  * **Audio & Communication:** Web Audio / Howler.js for sound integration; JSON/HTTP or WebSocket contracts connecting the client to the RGS and math server.

---

## 4. Strategic Angle for Speaking with Jeremie (CFO / Admin)
Because the **CFO** is co-leading this screening call, anchor your technical points in **unit economics, velocity, and risk reduction**:

1. **Shared Game Client = Higher Margins per Monthly Title:**
   * Building custom, non-clone games every month can easily explode engineering hours. Framing your experience building reusable component libraries, shared toolkits (`jutge-toolkit`), and cross-platform engines shows you understand how a **shared game client** cuts marginal development cost per title.
2. **Zero-Defect Financial & Result Accuracy (Compliance & Trust):**
   * In iGaming, a front-end display bug (wrong payout rendered, frozen reel on disconnect, desynced bonus state) creates player disputes, operator support tickets, and regulatory risk. Emphasize your **AJV schema validation** and **strict client-server state synchronization** background.
3. **AI-Accelerated Engineering ROI (Without Quality Drop):**
   * Highlight your **Harness Engineering** workflow (strict TypeScript types + automated validation gates) as a force multiplier that lets a lean remote engineer ship polished features faster with fewer regressions.
4. **Live-Ops Maintenance Efficiency:**
   * Supporting live titles across hundreds of casino brands and mobile viewports is expensive if bugs aren't reproducible. Emphasize your telemetry, failure-reproduction tooling, and automated regression checks.
