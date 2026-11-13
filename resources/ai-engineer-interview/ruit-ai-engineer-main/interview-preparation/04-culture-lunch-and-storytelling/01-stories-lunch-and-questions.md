# 01 — My 3 Signature Stories, Team Lunch & Strategic Questions

> **Interview 2 Focus (14:00 Lunch + 15:00 Architecture):** Culture fit, values, storytelling (STAR format), and high-signal technical questions for Luis and the team.

---

## 1. Story 1: Building Multi-Tenant SaaS Backend from Scratch (`b2b-api` at Visual Meta)

- **Situation:** Visual Meta’s German marketplaces (`ladenzeile.de`, `shopping.de`) needed a new B2B portal for thousands of merchants to manage product feeds, campaigns, and reports.
- **Task:** Take full ownership of designing and implementing the backend (`b2b-api`) from scratch with 4 user roles (`admin`, `manager`, `partner`, `user`).
- **Action (Architecture Decisions):** Built with Node.js, TypeScript, Express, MySQL, and Redis. Implemented strict multi-tenant tenant-isolation filters, Redis caching (15-min TTL) for heavy aggregation queries, and transactional updates for role assignments. Containerized with Docker and Jenkins CI/CD.
- **What Went Wrong & Fix:** Large merchants with 50K+ products caused high memory spikes during dashboard exports. Fixed by replacing full in-memory queries with cursor pagination, composite indexes on `(partner_id, created_at)`, and Redis caching.
- **What I'd Do Differently Today:** Introduce cursor-based streaming and async background export workers from Day 1.

---

## 2. Story 2: Migrating Legacy C++ & Eliminating SQL Deadlocks (Dotin Banking)

- **Situation:** High-volume EFTPOS banking middleware handled millions of card transactions, but legacy C++ suffered concurrency bottlenecks and crashes during peak hours.
- **Task:** Lead a 6-person team to migrate critical transaction modules to Delphi and optimize Oracle PL/SQL stored procedures.
- **Action (Architecture Decisions):** Re-architected the transaction pipeline with worker thread pools and non-blocking I/O. Profiled slow Oracle queries, removed table-level locks, and enforced strict row-locking order (`SELECT ... FOR UPDATE`) across concurrent transactions.
- **What Went Wrong & Fix:** Concurrent settlement jobs locked accounts in reverse order, causing database deadlocks during month-end spikes. Fixed by sorting account IDs numerically before acquiring row locks and keeping transactions small.
- **Result:** Reduced system crash rate by **75%** and cut response times by **65%**.
- **What I'd Do Differently Today:** Use the event-driven transactional outbox pattern earlier to decouple core ledger updates from external notifications.

---

## 3. Story 3: Rewriting a Legacy Monolith via Strangler Fig (`shop-engine` at Visual Meta)

- **Situation:** E-commerce platform served millions of product listings, but the legacy PHP monolith was slow, brittle, and difficult to deploy safely.
- **Task:** Lead 4 developers to extract core catalog and user services into a modern Node.js + TypeScript + PostgreSQL + Redis architecture.
- **Action (Architecture Decisions):** Used the **Strangler Fig pattern**—migrated endpoints one-by-one behind the routing proxy instead of a risky "big bang" rewrite. Added strict schema validation at API boundaries and automated CI integration tests.
- **What Went Wrong & Fix:** Legacy PHP data had inconsistent nulls and missing attributes that broke new strict TypeScript schemas during initial shadow traffic. Built a resilient normalization and fallback layer to sanitize legacy records with logged warnings.
- **Result:** Improved response times by **40%**, cut server costs by **25%**, and reduced user errors by **60%**.

---

## 4. Team Lunch Etiquette & High-Signal Questions for Luis and the Team

- **Lunch Vibe (14:00 at Lanzadera, on Ruit):**
  - Relax and be yourself. Luis noted: *"This is the most important part."* They are evaluating: *Do we enjoy working and solving problems with this person every day?*
  - Be warm, curious, and collaborative. Ask teammates about living in Valencia, their Lanzadera experience, and what they enjoy building.
- **Questions for the Engineering Team:**
  - *"Which marketplace gives you the biggest headache right now with anti-bot walls or schema changes?"*
  - *"How do you currently split responsibilities between the Chrome Extension and backend Celery workers?"*
  - *"For your 1-photo AI listing flow, what was the hardest part to get right—category mapping, brand detection, or price estimation?"*
  - *"What does your daily AI-assisted workflow look like across the team? Do you share `CLAUDE.md` rules or custom skills?"*
- **Questions for Luis Grau (CEO):**
  - *"How has your journey inside Lanzadera been so far, and what is Ruit's biggest milestone over the next 6 months?"*
  - *"Beyond Vinted, Wallapop, and eBay, which new marketplaces or European countries are most requested by your sellers?"*
  - *"What does a great first 30 days look like for someone joining as Senior Integrations Engineer?"*

