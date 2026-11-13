# Part 2 — Step-by-Step: How to Execute the Live AI Task (15–20 Minutes)

> **The Golden Rule for the Live Task:**  
> Never copy-paste their task directly into the AI chat box in silence. Follow these **6 steps out loud** so the interviewers see your 9+ years of senior backend & systems engineering guiding every decision the AI makes.

---

## Step 1: Clarify Failure Modes & Edge Cases First (Minutes 0–2)

- **What You Do:**
  - Before touching the keyboard, read the problem and ask the interviewers 2 or 3 sharp backend questions.
- **What You Ask Out Loud:**
  - *"Before I instruct the agent, let me clarify the boundaries: First, how should we classify external failures here—for example, retrying on 429 rate limits and 503 timeouts versus stopping immediately on 401 auth errors? Second, do we need idempotency protection or concurrency limits on these calls?"*
- **Why This Impresses Them:**
  - Junior developers jump straight to prompting. Senior engineers define failure modes, timeouts, and concurrency rules first.

---

## Step 2: Start in Plan Mode & Lock the Architecture (Minutes 2–5)

- **What You Do:**
  - Put your agent in **Plan Mode** (read-only exploration and design) and give it a structured architectural prompt containing:
    1. The goal of the task.
    2. The exact file structure to create or modify.
    3. The edge cases you just agreed on (timeouts, retry rules, validation).
    4. Instruction to propose a short step-by-step plan before writing any files.
- **What You Say While Doing It:**
  - *"I always start in Plan Mode so the agent inspects the existing files and proposes a short plan first. It takes 30 seconds to review a plan, versus 10 minutes to untangle bad code if the agent goes in the wrong direction."*

---

## Step 3: Instruct the Agent to Define Data Schemas & Error Types First (Minutes 5–8)

- **What You Do:**
  - Once the plan looks clean, tell the agent to generate the **data contracts (input/output schemas) and custom error classes first** before writing the core business logic.
- **What You Say While Doing It:**
  - *"Just like I did at QueryLaw to reach 95%+ reliability, I always make the agent define strict data validation schemas and explicit error types—such as retryable network errors versus fatal authentication or schema-drift errors—before writing the main logic. That acts as a guardrail for the rest of the implementation."*

---

## Step 4: Generate the Implementation + Offline Automated Tests Together (Minutes 8–14)

- **What You Do:**
  - Instruct the agent to implement the feature **and** write automated unit tests using offline mock fixtures (covering the happy path, a retryable 429/timeout, an auth failure, and malformed data).
  - Let the agent run the test command and linter/type-checker directly in the terminal.
  - If a test fails, do **not** manually edit or copy-paste errors—let the agent read the terminal failure output and self-correct autonomously.
- **What You Say While Doing It:**
  - *"I practice a strict verification harness. I have the agent write offline mock tests alongside the feature—testing rate-limit retries, auth failures, and invalid JSON payloads—and run the test runner and type checker directly in the terminal until every check is green."*

---

## Step 5: Audit the 5 Senior Backend Invariants Out Loud (Minutes 14–17)

- **What You Do:**
  - While looking at the generated solution on screen, walk the interviewers through **5 architectural checks** you always verify on AI-generated backend work:
    1. **Connection Reuse:** Are we reusing a single HTTP client session instead of opening a new TCP/TLS connection inside a loop?
    2. **Explicit Timeouts:** Did the AI include explicit connection and read timeouts on every network call so a hung server never blocks a worker forever?
    3. **Non-Blocking Execution:** Are delays and I/O operations asynchronous so they never freeze the event loop?
    4. **Specific Error Handling:** Is the agent catching specific error categories rather than swallowing all exceptions silently?
    5. **Idempotency & Safety:** If a job retries after a network drop, is it safe from duplicating side effects?

---

## Step 6: Run Independent Diff Review & Commit Cleanly (Minutes 17–20)

- **What You Do:**
  - Open the Git diff view, run **GitHub Copilot Code Review** (or inspect the diff line-by-line), verify no temporary files or secrets are staged, and make a clean atomic commit.
- **What You Say to Wrap Up:**
  - *"The terminal test suite and type checks are all passing, I audited the timeouts and error boundaries, and I ran a second-opinion diff check. This is now ready for a clean commit."*
