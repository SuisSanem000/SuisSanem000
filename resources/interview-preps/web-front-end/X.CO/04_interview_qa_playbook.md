# 04 — Master Interview Playbook & Q&A: EXCO Game Studio

> **Panel Today:** **Jeremie** (CFO / Admin) & **Serhii** (Head of Engineering)  
> **Call Goal:** Pass the initial screening + technical/business alignment check to advance to the next stage.

---

## 1. The 30-Second Executive Pitch (Tailored to Jeremie & Serhii)

> *"Thanks for taking the time today, Jeremie and Serhii—and thanks to Fredrik for connecting us. I'm Simin, a software engineer based in Barcelona with over 9 years of experience building TypeScript systems, real-time web applications, and custom developer tooling.*
>
> *What stood out to me about EXCO is your 'no-clones' philosophy—shipping original titles like VEGASCALINE and Piranha Bite Club with custom math and unique mechanics every month, rather than reskinning templates. My background fits both sides of that challenge: earlier in my career I built a custom **2D vector rendering engine with Skia** and a cross-platform tool used by **60K+ users**, and over the last several years I've scaled **TypeScript/React/WebSocket** clients for **60K+ concurrent users**, shipped a **630K+ install VS Code extension**, and built **strict schema-validated client-server pipelines** at QueryLaw.*
>
> *I love working at the intersection of smooth front-end craft, rock-solid server state integrity, and shared tooling that helps teams ship faster every month—so I'd love to hear more about how you're structuring your shared game client and monthly pipeline."*

---

## 2. 14 High-Impact Interview Questions & Customized Answers

### A. Screening, Motivation & Logistics

#### Q1. Why EXCO Game Studio, and why transition into front-end slot game development?
* **Angle:** Connect EXCO's unique market stance with your love for graphics/rendering and high-craft TypeScript engineering.
* **Answer:** *"I followed Fredrik's philosophy at EXCO—pushing back against cookie-cutter reskins to build original games from scratch around strong math models. Technically, it brings together three things I genuinely enjoy: strict TypeScript client architecture, low-level 2D graphics and animation performance (which I loved when building a Skia-based 2D rendering engine earlier in my career), and zero-tolerance accuracy between the server math and what the user sees on screen."*

#### Q2. Your CV is full-stack and AI-heavy—are you genuinely excited to focus on Front End Game Development?
* **Angle:** Reassure Serhii you aren't looking to drift away from front-end execution; frame your backend/validation skills as making you a *better* game client engineer.
* **Answer:** *"Yes, 100%. Across my career, even in full-stack roles, my flagship visible wins were front-end and user-facing tooling—like the 630K-install VS Code extension, the real-time React/TypeScript dashboards, and the multi-GB JSON Viewer UI. Having backend and schema-validation experience simply means when I integrate our game client with the RGS and math server, I anticipate edge cases like race conditions, payload mismatches, and reconnect states immediately."*

#### Q3. We mentioned full-time or part-time remote—how does your schedule work with your MIRI Master's at UPC?
* **Angle:** Clarity and dependability for Jeremie (CFO/Admin).
* **Answer:** *"I'm based in Barcelona with full EU work authorization, and I'm experienced working asynchronously in remote international teams—including Australia and the Netherlands. My UPC internship and MIRI studies are structured cleanly around my work commitments, and I'm open to discussing whether full-time or part-time fits EXCO's roadmap best right now, as long as expectations and sprint deliverables are crystal clear."*

---

### B. Technical Depth (Head of Engineering Focus — Serhii)

#### Q4. Our stack involves HTML5 slot clients (Canvas/WebGL, e.g., PixiJS) rather than standard DOM forms. How does your experience translate?
* **Angle:** Bridge directly from your **Skia 2D rendering engine** and high-performance grid work to PixiJS/WebGL.
* **Answer:** *"While my recent web work used React and TypeScript, my foundations aren't limited to standard DOM forms. In 2017–2018 I engineered an internal **2D vector and typography rendering engine using Skia** and built a desktop JSON Viewer handling multi-GB datasets without UI stutter. Concepts like scene graphs, texture/glyph rendering, memory budgets, and maintaining a smooth 60fps frame loop transfer directly to WebGL/Canvas engines like PixiJS—and I ramp up on new frameworks quickly, like shipping my VS Code extension in 3 days."*

#### Q5. How would you connect the slot front end to our RGS / math server and guarantee results always display accurately?
* **Angle:** Highlight **strict JSON Schema validation (AJV)**, deterministic state machines, and math-first discipline.
* **Answer:** *"The math server and RGS are always the single source of truth. First, I would enforce strict TypeScript interfaces and runtime schema validation (like the multi-layer AJV schemas I used at QueryLaw) on every RGS response before triggering animations. Second, I'd model the game loop as a deterministic **Finite State Machine** (`IDLE` $\rightarrow$ `SPIN_REQUESTED` $\rightarrow$ `REELS_SPINNING` $\rightarrow$ `BONUS_ROUND` $\rightarrow$ `SETTLED`). Animations only visualize validated server outcomes—never client-side guesses—so balances, win lines, and multipliers stay 100% consistent."*

#### Q6. What happens if a player loses internet mid-spin or refreshes during a bonus round?
* **Angle:** Show deep distributed-systems & real-time client reliability instincts.
* **Answer:** *"A reliable slot client needs idempotency and clean state recovery. Every spin request should carry a unique round/transaction identifier so retries never trigger duplicate bets. On reconnect or refresh, the client queries the RGS recovery endpoint for the active round state—then fast-forwards or resumes directly into the exact bonus state or settled outcome returned by the server, re-syncing the player's balance cleanly without visual corruption."*

#### Q7. How do you ensure smooth 60fps performance across both desktop monitors and lower-end mobile devices?
* **Angle:** Concrete browser performance hygiene.
* **Answer:** *"Mobile devices are usually memory- and GPU-bound first. I'd focus on: (1) texture atlases and sprite sheets to minimize WebGL draw calls, (2) lazy-loading heavy bonus-round art and audio assets after the base game initializes so initial load stays fast, (3) object pooling for recurring particles/coins to avoid garbage-collection frame drops, and (4) profiling frame times and GPU memory in Chrome DevTools across throttled mobile viewports."*

#### Q8. How do you work with Figma designs, artists, and sound designers to nail "game feel" rather than just functional code?
* **Angle:** Show collaborative attention to detail and UX polish.
* **Answer:** *"At QueryLaw and Dadroit, my UI work was praised for clarity and responsiveness. With game art and Figma specs, 'feel' lives in timing, easing curves, anticipation frames, and audio-visual sync. I work closely with artists and designers to turn static specs into configurable animation timings (e.g., reel acceleration/deceleration, stagger stops, win-tier celebrations), decoupling timing constants so designers and engineers can iterate on pacing quickly without rewriting logic."*

#### Q9. How would you contribute to our "shared game client" so each new monthly title is faster to build?
* **Angle:** Connect directly to your shared tooling (`jutge-toolkit` CLI, npm packages, VS Code extension) experience.
* **Answer:** *"If every game is bespoke—like EXCO's GAMEX mechanics—the shared client shouldn't force rigid templates; it should standardize the **plumbing**. I'd keep RGS networking, state recovery, sound/asset preloading, responsive layout scaling, localization, and telemetry inside the shared core—while exposing clean TypeScript hooks/interfaces so individual games only implement their unique reel math bindings, art, and custom bonus state machines."*

---

### C. Executive & CFO Focus (ROI, Speed & Efficiency — Jeremie)

#### Q10. We release new, non-clone titles monthly. How do you balance high creative polish with strict monthly deadlines?
* **Angle:** Timeboxing, early vertical slices, and eliminating late surprises.
* **Answer:** *"By building a playable **vertical slice** early—getting the core spin loop, RGS contract, and placeholder assets working end-to-end in week one—so we verify the math integration and responsive layout immediately. Then art, Spine/animations, and audio layer in cleanly without blocking engineering. That avoids last-minute crunch before release."*

#### Q11. From a business/ROI perspective, where do you think front-end engineers waste the most time in game studios?
* **Angle:** Speak Jeremie's language—rework, duplicated boilerplate, and untraceable live bugs.
* **Answer:** *"Two places: reinventing core plumbing (asset loaders, RGS error handling, mobile resize logic) per title instead of pushing it into the shared client, and debugging unreproducible live issues in production. When we built failure-reproduction tooling and strict schema telemetry at QueryLaw, it drastically cut support and debugging time—saving engineering hours for revenue-generating new releases."*

#### Q12. How do you use AI in your daily workflow, and does it actually speed up production reliably?
* **Angle:** Your superpower—**Harness Engineering** (faster delivery *with* guardrails, not sloppy AI code).
* **Answer:** *"I don't use AI as blind autocomplete—that creates technical debt that costs more later. I practice what I call Harness Engineering: locking strict TypeScript types, schema contracts, and automated test cases first, then using AI agents (like Claude Code) to scaffold boilerplate, write edge-case tests, and validate against the terminal test suite. At UPC's Jutge.org, I literally build closed-loop validation workflows like this. For EXCO, it means scaffolding repetitive game configs or test cases much faster while keeping code quality rock solid."*

#### Q13. Tell me about a time a production bug or performance bottleneck impacted users, and how you fixed it.
* **Angle:** Grounded real metric from **Parsaiane** (35–40% latency reduction / 60K+ concurrent users) or **QueryLaw** (telemetry & failure reproduction).
* **Answer:** *"At Parsaiane, our real-time dashboards and APIs served over 60K concurrent users, and heavy queries began creating latency spikes under load. By profiling the bottlenecks, redesigning database schemas and indexing, and optimizing client-server data fetching, we reduced API latency by 35–40% and maintained 99.9% uptime. The lesson applies directly to live game operations: measure first, fix the structural bottleneck, and add automated checks so it doesn't regress."*

#### Q14. What makes you effective in a lean, remote studio team without heavy management overhead?
* **Angle:** Autonomy, written communication (12 technical articles / docs), and ownership.
* **Answer:** *"Having worked remotely across time zones with teams in Australia and the Netherlands, I rely on crisp written communication, clear interface contracts, and proactive visibility. I've authored internal engineering documentation and 12 technical articles reaching 120K+ developers, and at QueryLaw I owned the full product lifecycle end-to-end—meaning you don't need to micromanage me to get a title from Figma to live release."*

---

## 3. 5 Sharp Questions to Ask Jeremie & Serhii

1. *(For Serhii — Tech & Shared Client):*
   **"Looking at the shared game client today, what is the biggest bottleneck slowing down your monthly title launches—is it RGS integration quirks, custom GAMEX mechanic implementation, or mobile device QA?"**
2. *(For Serhii — Rendering Stack):*
   **"What is your current front-end rendering and animation stack on the client side (for example, TypeScript + PixiJS + Spine), and how do you structure the handoff from Figma and art assets into code?"**
3. *(For Jeremie — Business & Cadence):*
   **"With EXCO's 'no-clones' model and monthly release cadence across partners like Tequity and SOFTSWISS, how do you balance engineering time between shipping the next new title versus investing in the shared client?"**
4. *(For Both — Live Ops & Quality):*
   **"Once a game goes live across hundreds of casino brands, what does your telemetry and bug-reproduction setup look like when an operator reports an edge-case issue?"**
5. *(For Both — Role Scope & Next Steps):*
   **"In the first 60 days, would success look like owning a brand-new slot title end-to-end from Figma to launch, or starting by upgrading specific modules in the shared client—and what are the next steps in your hiring process?"**

