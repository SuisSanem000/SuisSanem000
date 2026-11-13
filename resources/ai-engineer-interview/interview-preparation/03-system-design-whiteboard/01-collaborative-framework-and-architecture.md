# 01 — Collaborative Whiteboard Framework & Core Architecture

> **System Design Strategy:** A structured, collaborative framework for 45–60 minute technical whiteboard and architectural design interviews.

---

## 1. The 4-Step Collaborative Structure (45–60 Minutes)

1. **Step 1 — Clarify Requirements & Define Scope (0–10 mins):**
   - Ask 4–5 clarifying questions before touching the board: current scale (users, events/day), latency targets (real-time vs background), execution context (client/browser vs cloud workers), and failure tolerances.
2. **Step 2 — High-Level Architecture Diagram (10–25 mins):**
   - Draw 4 primary boxes: **Backend API Gateway**, **Database (PostgreSQL / Source of Truth)**, **Redis (Locks, Rate Limits, Broker)**, and **Background Workers / Queue Consumers**.
3. **Step 3 — Deep Dive on Hard Edge Cases (25–45 mins):**
   - Trace race conditions, token expiry, network timeouts, partial failure handling, and broken external responses.
4. **Step 4 — Trade-offs, Scale & Observability (45–60 mins):**
   - Discuss database indexing, connection pooling (PgBouncer), cache invalidation, and metrics/alerts.

---

## 2. Key Spoken Phrases for Collaborative Whiteboarding (Upper-B2)

- *"Before I draw the boxes, let me ask a few quick questions to make sure I am solving the exact right problem."*
- *"Here is the basic flow from the webhook receiver to the background queue and Redis. Does this match how your existing pipeline is structured, or would you like me to adjust anything?"*
- *"We have a clear trade-off here: Option A is faster to build today, while Option B scales better for 10x volume. For the current stage, I would recommend Option A and migrate when volume demands it."*
- *"Which edge case should we zoom into next—database row locking or the retry queue with rate limits?"*

---

## 3. High-Signal Architectural Blueprint for Integration Challenges

- **Entry Point:** API endpoint receives webhook or user action. Returns `200 OK` within 2 seconds.
- **Persistence & Locking:** PostgreSQL holds entities and state. Updates wrapped in a database transaction using row-level locking (`SELECT ... FOR UPDATE`) to prevent race conditions.
- **Background Orchestration:** Background worker processes jobs asynchronously from a prioritized queue (`urgent` vs `bulk_sync`).
- **External Integration:** Connector uses connection pooling, explicit timeouts, and exponential backoff retries with jitter.
- **Data Validation:** Strict data contracts and schema validation on raw JSON payloads, triggering alerts if schema drift occurs.
