# 01 — My 3 Signature Stories, Team Culture & Strategic Questions

> **Interview Focus:** Culture fit, collaborative values, storytelling (STAR format), and high-signal technical questions for engineering teams and leadership.

---

## 1. Story 1: Building Multi-Tenant SaaS Backend from Scratch (`b2b-api` at Visual Meta)

- **Situation:** Visual Meta’s marketplaces (`ladenzeile.de`, `shopping.de`) needed a new B2B portal for thousands of merchants to manage product feeds, campaigns, and reports.
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

## 4. Team Culture, Collaborative Etiquette & High-Signal Questions

- **Team Collaboration & Culture Fit:**
  - Be authentic, curious, and collaborative. Technical interviews assess not just competence, but: *Do we enjoy solving hard problems with this person every day?*
  - Actively listen, validate team perspectives, and frame trade-offs openly rather than being dogmatic.
- **High-Signal Questions for the Engineering Team:**
  - *"Which external integration or third-party service gives you the biggest headache right now with anti-bot walls or schema changes?"*
  - *"How do you currently split responsibilities between client-side execution (e.g., browser extensions) and backend workers?"*
  - *"What does your daily AI-assisted engineering workflow look like across the team? Do you share repository rules, skills, or custom harnesses?"*
  - *"How do you handle schema drift and proactive breakage detection before downstream customers notice?"*
- **High-Signal Questions for Founders / Engineering Leadership:**
  - *"What is the engineering team's single biggest technical milestone over the next 6 months?"*
  - *"What does a great first 30–60 days look like for someone joining this role?"*
  - *"How do you cultivate an environment where engineers can ship quickly while maintaining system invariants and high test standards?"*
