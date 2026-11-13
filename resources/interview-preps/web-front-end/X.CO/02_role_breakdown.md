# 02 — Role Breakdown & Technical Expectations: Front End Game Developer

> **Role:** Front End Game Developer (Remote — Full-Time or Part-Time)  
> **Reporting / Collaboration:** Working directly with **Serhii** (Head of Engineering) and the wider game team (math, art, sound, RGS backend).

---

## 1. Core Responsibilities (From Studio Briefing)
1. **End-to-End Game Client Delivery:** Build the front end of new slot titles from Figma/art concepts through launch across **mobile and desktop** viewports.
2. **Core Slot Mechanics & UI:** Implement reels, symbol animations, bonus rounds, and proprietary special features (e.g., *GAMEX* mechanics) matching art and Figma specifications.
3. **Asset Integration ("Game Feel"):** Integrate art sprites/atlases, animations, and audio cues so pacing, win celebrations, and user interactions play smoothly.
4. **RGS & Math Server Integration:** Connect the front-end client to EXCO's game server (Tequity RGS) and math outputs, guaranteeing accurate result rendering, bet state updates, and recovery on disconnect.
5. **QA, Polish & Live-Ops Support:** Test, debug, and polish titles pre-release, and maintain live titles across operator environments.
6. **Shared Game Client Architecture:** Contribute reusable abstractions, UI primitives, and tooling to the **shared game client** so every subsequent monthly title ships faster.

---

## 2. Likely Screening Focus Areas (Mixed Executive + Engineering Panel)

| Interviewer | Primary Lens | What They Are Testing Today |
| :--- | :--- | :--- |
| **Jeremie (CFO / Admin)** | **ROI, Velocity & Reliability** | • Can you ship monthly titles reliably in a remote setup?<br>• Do you understand **shared client leverage** (reducing cost per game)?<br>• Are you commercially pragmatic about FT vs. PT availability, scope, and deadlines? |
| **Serhii (Head of Engineering)** | **Architecture, Craft & Execution** | • TypeScript/JavaScript depth & clean state management (finite state machines for spins/bonuses).<br>• 2D rendering performance (60fps on low-end mobile), asset budgets, and responsiveness.<br>• Strict server-client contract validation so math/RGS outcomes never display wrong. |

---

## 3. Honest Gap Analysis (Strengths vs. Growth Areas)

### Strong Direct Overlaps
* **TypeScript / JavaScript Architecture (9+ Years):** Deep production mastery of strict TypeScript, asynchronous state management, and modular client-server interfaces.
* **Low-Level 2D Rendering & High-Performance UI:** Built a custom **2D vector and typography rendering engine using Skia** (Free Pascal) and a **60K+ user multi-GB JSON Viewer**, proving deep understanding of frame budgets, memory efficiency, and custom graphics pipelines—far beyond standard CRUD React forms.
* **Client-Server Integrity & Validation:** At QueryLaw, enforced **multi-layer JSON Schema (AJV) validation** and real-time failure telemetry; at Parsaiane, built real-time **Socket.IO/WebSocket** UIs for **60K+ concurrent users**. Directly translates to validating RGS spin payloads and handling mid-round reconnects safely.
* **Shared Tooling & Developer Acceleration:** Created a **top-10 VS Code extension (630K+ installs)** and currently builds `jutge-toolkit` (`jtk`, TypeScript + Bun CLI) at UPC—proving ability to build internal/shared tooling that speeds up an entire team.

### Honest Gaps & How to Frame Them
* **iGaming-Specific Slot Libraries (PixiJS, Spine 2D, Howler.js):**
  * *Reality:* Not explicitly listed in your CV.
  * *Bridge:* Emphasize that **PixiJS / WebGL / Canvas** share the exact same scene-graph, sprite-batching, texture-atlas, and coordinate-math primitives you already built natively with **Skia** and browser rendering optimization. Your track record (shipping a top-10 VS Code extension in 3 days) proves rapid framework onboarding.
* **Regulated iGaming Compliance & Certification Nuances (Jurisdiction rules, RNG/RGS round recovery):**
  * *Reality:* Previous compliance domain was **European legal statutes** (QueryLaw) and **financial transaction reconciliation** (Parsaiane), not gambling regulators.
  * *Bridge:* Draw a direct parallel—both legal-tech and financial reconciliation require **zero-tolerance audit trails, deterministic state transitions, and exact UI representation of backend truth**.

---

## 4. High-Value Talking Points for Today's Call
* **"Shared Client Leverage":** Frame every shared client contribution as an engineering multiplier that makes **monthly original (non-clone) releases** financially sustainable.
* **"Math is the Source of Truth":** Explicitly recognize EXCO's philosophy—the RGS/math model drives the outcome; the front end's job is deterministic state presentation, resilient reconnect recovery, and crisp 60fps feedback.
* **"Mobile-First Performance Discipline":** Highlight awareness of mobile GPU/memory constraints (texture atlas packing, lazy loading bonus assets, keeping frame times <16ms on mid-tier phones).

