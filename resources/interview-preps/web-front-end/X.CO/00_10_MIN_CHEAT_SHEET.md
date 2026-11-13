# EXCO Game Studio (X.CO) — 10-Minute Pre-Interview Cheat Sheet

> **Your Call:** Screening / Intro with **Jeremie (CFO / Admin)** & **Serhii (Head of Engineering)**  
> **Warm Intro:** **Fredrik Elmqvist** (EXCO Founder, ex-Yggdrasil CEO) shared your CV directly with Jeremie.  
> **Role:** Front End Game Developer — Remote (**Full-Time or Part-Time** open).  
> **Goal Today:** Show Serhii strong **TypeScript + 2D rendering + server-sync rigor**, and show Jeremie **fast monthly shipping via shared client leverage**.

---

## 1. Studio Cheat Sheet (Drop These Naturally — 60s)
* **Who they are:** **EXCO Game Studio** (`exco.gg`, *Excommunicado*), founded late **2025** by **Fredrik Elmqvist**.
* **Philosophy ("No Clones"):** Anti-reskin rebellion—every game is built from scratch with original math ("the engine"), street-art/neon/edgy visuals, and bespoke features.
* **Cadence:** Shipping **monthly new titles** (**Shared Game Client** is key to keeping monthly cost sustainable).
* **Proprietary Mechanics (`GAMEX`):** *Wrapper Stacks*, *Power Field*, *Power Bar*, *Boss Fights*, *Doubling Dial*, *Swimmer Reel*.
* **Titles:** *VEGASCALINE* (debut), *Piranha Bite Club* (5x5 horror-beach), *Ministry of Like* (late 2026), *Luna X*, *Apex Dregs*, *The Robbin' Goblins*.
* **Infra & Stack:** **Tequity RGS** (RNG, math, wallets, compliance) + **SOFTSWISS** aggregator; HTML5 desktop/mobile front end (**TypeScript/JS**, WebGL/Canvas/likely PixiJS + Spine/audio + Figma handoff).

---

## 2. Your 30-Second Opening Pitch (Read Twice Out Loud)
> *"Thanks for having me, Jeremie and Serhii—and thanks to Fredrik for making the intro. I'm Simin, a Barcelona-based software engineer with 9+ years building TypeScript systems, real-time web apps, and developer tooling.*
>
> *What excites me about EXCO is your 'no-clones' model—shipping original titles like VEGASCALINE and Piranha Bite Club every month. My background hits both sides of what that takes: early on I built a **custom 2D vector & typography rendering engine with Skia** and a cross-platform tool used by **60K+ users**, and since then I've scaled **TypeScript/React/WebSocket** clients for **60K+ concurrent users**, shipped a **630K+ install VS Code extension**, and built **strict schema-validated client-server flows** at QueryLaw.*
>
> *I enjoy pairing crisp front-end game feel with rock-solid RGS state integrity and shared tooling that speeds up every monthly release—so I'd love to hear how your shared game client is structured today."*

---

## 3. Your 4 Proof Pillars & Metrics (Memorize These Numbers)

| Pillar | What You Built (Verified) | Why Jeremie & Serhii Care |
| :--- | :--- | :--- |
| **1. 2D Rendering & Perf** | **Skia + Free Pascal** 2D vector/typography engine; **60K+ user** multi-GB JSON Viewer; GitHub [`tool-high-performanc-grid-component`](https://github.com/SuisSanem000/tool-high-performanc-grid-component) | Proves frame-budget, scene/coordinate, and memory discipline—not just CRUD React forms. |
| **2. Shared Tooling & Scale** | **Top-10 VS Code ext (630K+ installs)** shipped in 3 days; **React/TS/Socket.IO** for **60K+ concurrent users** (35–40% latency drop, 99.9% uptime, 40% fewer deploy bugs); **UPC `jutge-toolkit` (`jtk`)** TS + Bun CLI | Direct proof you can level up EXCO's **shared game client** to make monthly titles faster & cheaper. |
| **3. Zero-Error State Sync** | **QueryLaw** multi-layer **JSON Schema (AJV)** validation + failure telemetry (**95%+ accuracy, <3% hallucination**); GitHub [`ai-backend-engineering-fundumentals`](https://github.com/SuisSanem000/ai-backend-engineering-fundumentals) (idempotency, state machines, circuit breakers) | RGS/math outcomes must **never** render wrong; easy live-ops bug reproduction across casinos. |
| **4. AI Harness Speed** | **JutgeAI** closed-loop validation + GitHub [`ai-harness-engineering`](https://github.com/SuisSanem000/ai-harness-engineering) / [`antifragile-testing-upskill`](https://github.com/SuisSanem000/antifragile-testing-upskill) | Ships boilerplate & edge-case tests faster **without** accumulating sloppy AI tech debt. |

*(Communication & Logistics: **Barcelona**, full EU work authorization, **TOEFL iBT 110/120 [C1]**, remote experience with Australia & Netherlands teams, open to **FT or PT** around UPC MIRI.)*

---

## 4. Rapid-Fire Q&A Guide (What to Say If Asked)

### Screening & Logistics (Both)
1. **Why Front-End Slot Games when your CV has full-stack/AI?**
   * *"My biggest user-facing wins were front end & tooling (630K+ VS Code ext, 60K+ JSON Viewer, real-time TS UIs). Backend/AJV experience just makes me faster and safer at integrating the client with your RGS and math server without race conditions."*
2. **FT vs. PT & UPC MIRI Master's schedule?**
   * *"I'm Barcelona-based with full EU authorization and remote-team experience (AU/NL). My UPC research/internship fits cleanly around work, and I'm flexible on FT or PT depending on EXCO's current roadmap—let's align on expected weekly cadence."*

### Technical Depth (Serhii — Head of Engineering)
3. **You haven't listed PixiJS / Spine / iGaming on your CV—how fast can you ramp?** *(Honest Gap Bridge)*
   * *"True—I haven't shipped PixiJS specifically, but Pixi/WebGL uses the exact scene-graph, sprite/glyph batching, texture memory, and 60fps loop primitives I built natively with **Skia**. I pick up new ecosystems fast—I shipped a top-10 VS Code extension in 3 days."*
4. **How do you guarantee RGS/math results always match what's rendered?**
   * *"Math/RGS is always single source of truth. Validate every RGS response at runtime (like my **AJV JSON Schema** gates) and drive UI via a strict **Finite State Machine** (`IDLE -> SPIN_REQUESTED -> REELS_SPINNING -> BONUS_ROUND -> SETTLED`). Animations visualize validated server payloads—never client guesses."*
5. **What if a player disconnects or refreshes mid-spin / mid-bonus?**
   * *"Unique transaction/round IDs for **idempotent spin requests** so retries never double-bet; on reconnect, query RGS round-recovery state and resume/fast-forward directly into the exact server-confirmed bonus or settled state."*
6. **How do you keep 60fps on mid/low-end mobile?**
   * *"Texture atlases (fewer WebGL draw calls), lazy-load heavy bonus art/audio after base game load, object pooling for win coins/particles (avoid GC jank), and Chrome DevTools frame/memory profiling on throttled mobile."*
7. **How should the Shared Game Client be structured so monthly games don't turn into clones?**
   * *"Standardize the **plumbing**, not the creative gameplay: keep RGS networking, round recovery, preloading, responsive scaling, audio manager, localization, and telemetry in core—expose clean TypeScript hooks so each title only builds its bespoke reels, art/Figma UI, and GAMEX bonus state machine."*

### Business & Efficiency (Jeremie — CFO / Admin)
8. **How do you hit strict monthly deadlines without sacrificing polish?**
   * *"Week-1 **vertical slice**: get the core spin loop + RGS contract + placeholder art wired end-to-end early so math/layout bugs surface immediately, then layer final Figma art, Spine animations, and audio cleanly without blocking engineering."*
9. **Where do front-end teams waste money/time in monthly studios?**
   * *"Re-solving shared plumbing per title and chasing unreproducible live operator bugs. Adding structured telemetry + failure-reproduction tooling (like I built at QueryLaw) pays for itself quickly across hundreds of casino brands."*
10. **How does AI fit into your workflow responsibly?**
    * *"Harness Engineering: lock TypeScript interfaces, schemas, and tests first, then use AI to scaffold configs and edge-case tests inside an automated verification loop—velocity goes up without maintenance costs spiking."*

---

## 5. Ask 2–3 of These Sharp Questions at the End
1. *(Serhii — Shared Client):* **"What's the biggest engineering bottleneck in your monthly launches right now—custom GAMEX mechanics, RGS edge cases, or mobile device QA?"**
2. *(Serhii — Stack):* **"What's your current client stack (e.g., TypeScript + PixiJS + Spine), and how does Figma/art handoff into code work day-to-day?"**
3. *(Jeremie — ROI/Cadence):* **"With monthly original releases on Tequity and SOFTSWISS, how do you split team capacity between shipping the next title and investing in the shared client?"**
4. *(Both — Scope & Next Step):* **"In the first 60 days, would I own a new slot title from Figma to launch or start inside the shared client—and what does the next step of your process look like?"**

---

## 6. Last 60-Second Check Before Joining
* Keep **calm, concise, structured** answers (lead with the conclusion, give 1 crisp metric/project, stop talking and let them engage).
* Never invent PixiJS/gambling-law experience—bridge confidently from **Skia 2D + AJV/financial compliance + 60K+ concurrent TS apps + shared tooling**.
* Close warmly and confirm FT/PT logistics clearly if Jeremie brings it up. **You've got this!**

