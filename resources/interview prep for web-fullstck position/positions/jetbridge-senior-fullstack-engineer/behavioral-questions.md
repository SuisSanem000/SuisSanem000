# Behavioral Questions: STAR Format (8 Questions)

> **JetBridge – Senior Fullstack Engineer (TypeScript)**
> Focus: Ownership, autonomy, communication, scaling, end-to-end delivery
> Tailored to resume: QueryLaw/Parsaiane legal-tech, VS Code extension (500K+ installs), AI/LLM integrations

---

## Q1. Tell me about a time you took full ownership of a feature from design to deployment with minimal guidance.

**Why asked:** JetBridge values high autonomy and full-stack ownership — they want engineers who don't wait for instructions.

### Sample STAR Answer

**Situation:** At QueryLaw, we needed an automated contract analysis pipeline that would extract key clauses from legal documents using LLMs (Claude) and present findings in a dashboard. No prior architecture existed — I was the sole engineer on this feature.

**Task:** Design and deliver the complete solution end-to-end: API design, LLM integration, document processing pipeline, React dashboard, database schema, and deployment to AWS.

**Action:**
- Designed the architecture: S3 for document storage → Lambda for processing → Claude API for clause extraction → PostgreSQL for structured results → Next.js dashboard
- Wrote the full TypeScript pipeline: document upload with presigned URLs, chunking large documents, prompt engineering for consistent extraction, retry logic with exponential backoff for API failures
- Built the React dashboard with filtering, search, and export capabilities
- Set up CI/CD with GitHub Actions, automated tests (85% coverage), and staged deployment
- Documented the system for the team and created runbooks for common failure scenarios

**Result:** Delivered in 6 weeks. Reduced contract review time from 4 hours to 20 minutes. Processing pipeline handled 500+ documents daily with 99.2% uptime. The architecture became the template for three subsequent features.

---

## Q2. Describe a situation where you had to communicate a complex technical decision to non-technical stakeholders.

**Why asked:** JetBridge is a consulting company — communication with clients and cross-functional teams is essential.

### Sample STAR Answer

**Situation:** At Parsaiane, the CEO wanted to switch our entire backend from PostgreSQL to MongoDB mid-project because a competitor using MongoDB launched faster. This would have delayed our legal-tech platform by 3+ months.

**Task:** Explain why PostgreSQL was the right choice for our relational legal data (contracts, clauses, parties, obligations) without being dismissive of the CEO's concern.

**Action:**
- Prepared a visual comparison document (not code) showing how our data relationships (contracts → clauses → parties) naturally map to SQL joins vs. MongoDB's denormalized approach
- Demonstrated with a concrete example: "To find all contracts where Party A has an obligation exceeding $1M, it's one SQL query vs. complex aggregation pipeline + data consistency risks"
- Reframed the competitor's speed advantage as a product scope difference, not a technology advantage
- Offered a compromise: use MongoDB for the activity log/audit trail (write-heavy, flexible schema) while keeping PostgreSQL for core data

**Result:** CEO approved keeping PostgreSQL for core data. The hybrid approach satisfied both technical correctness and the CEO's desire to adopt new technology. Project stayed on schedule and launched on time. The audit trail in MongoDB handled 10x more writes than PostgreSQL would have.

---

## Q3. Tell me about a time you identified and resolved a critical performance bottleneck in a production system.

**Why asked:** Tests debugging ability, systematic thinking, and production experience — all critical for SaaS platforms.

### Sample STAR Answer

**Situation:** Our VS Code extension (500K+ installs) started receiving 1-star reviews about slow startup — extension activation time grew from 200ms to 4.5 seconds over 6 months as features were added.

**Task:** Diagnose the root cause and reduce activation time to under 500ms without removing features.

**Action:**
- Profiled the extension using VS Code's built-in profiler and `performance.now()` markers at each initialization step
- Found three bottlenecks: (1) synchronous file I/O reading 15 config files at startup, (2) eagerly loading a 2MB language grammar bundle, (3) initializing 8 webview panels even when not visible
- Implemented lazy loading: config files read on-demand with caching, grammar bundle loaded only when relevant file types opened, webview panels created on first access
- Added a virtual activation event system — register capabilities immediately but defer heavy initialization
- Wrote unit tests for each optimization and added a CI benchmark that fails if activation exceeds 500ms

**Result:** Activation time dropped from 4.5s to 180ms (96% improvement). User ratings recovered from 3.2 to 4.6 stars within one release cycle. The lazy loading pattern was adopted as a standard practice across all our extensions.

---

## Q4. Describe a time when you had a significant disagreement with a team member about a technical approach. How did you resolve it?

**Why asked:** Tests conflict resolution and collaboration skills — important in high-autonomy environments.

### Sample STAR Answer

**Situation:** Working on the legal-tech platform at QueryLaw, a senior colleague insisted on using GraphQL for our API. I believed REST + TypeScript type generation was a better fit for our use case (simple CRUD with few relationships, small frontend team unfamiliar with GraphQL).

**Task:** Resolve the disagreement constructively without creating team friction, while ensuring we chose the best approach for the project.

**Action:**
- Proposed a time-boxed spike (2 days each): I'd build the user management module with REST + tRPC, they'd build it with GraphQL + codegen
- Defined evaluation criteria together before the spike: developer onboarding time, type safety, query complexity, bundle size, and maintenance overhead
- Presented both spikes to the team (4 developers) — let the team vote after seeing working code
- Acknowledged GraphQL's strengths (flexible queries, built-in schema) and identified scenarios where we'd adopt it later (if we add a mobile client)

**Result:** Team chose REST + tRPC (3-1 vote). The GraphQL advocate appreciated the fair process and later said the spike approach was the best way to resolve technical disagreements. We documented the decision in an ADR (Architecture Decision Record) for future reference, including conditions that would trigger a revisit.

---

## Q5. Tell me about a time you had to scale a system to handle significantly more traffic than originally designed for.

**Why asked:** JetBridge builds SaaS platforms — scalability, reliability, and cost optimization are core to the role.

### Sample STAR Answer

**Situation:** At Parsaiane, our legal document processing API was designed for ~100 requests/minute. After a major client onboarding, we needed to handle 3,000 requests/minute within two weeks. The Node.js API was deployed on a single EC2 instance with PostgreSQL.

**Task:** Scale the system 30x without rewriting the application or incurring excessive costs.

**Action:**
- **Immediate (Day 1-2):** Added connection pooling (PgBouncer), enabled gzip compression, added Redis caching for frequently accessed data (template lookups) — handled 500 req/min
- **Short-term (Day 3-7):** Moved to ECS Fargate with auto-scaling (2-8 containers based on CPU), added an ALB with health checks, split read traffic to a PostgreSQL read replica
- **Medium-term (Day 8-14):** Identified hot path — document rendering — and moved it to Lambda (event-driven, auto-scales to thousands of concurrent executions). Added SQS queue for async processing to decouple the API from heavy computation
- Implemented circuit breaker pattern for downstream LLM API calls to prevent cascade failures
- Set up CloudWatch dashboards with alarms for p95 latency, error rate, and queue depth

**Result:** System handled 5,000 req/min at peak (67% headroom over requirement). Monthly cost increased only 2.3x despite 30x traffic increase (Lambda's pay-per-use was significantly cheaper than always-on compute for bursty processing). Zero downtime during the migration.

---

## Q6. Tell me about a project where you had to learn a new technology quickly to deliver on time.

**Why asked:** JetBridge works with diverse clients and tech stacks — adaptability is essential.

### Sample STAR Answer

**Situation:** A client project at QueryLaw required integrating Claude (Anthropic's LLM) for contract analysis. I had no prior experience with LLM APIs — the team had only used rule-based NLP before. Deadline was 4 weeks.

**Task:** Learn LLM integration patterns, design the prompt engineering pipeline, and deliver a working contract analysis module.

**Action:**
- Spent the first 3 days intensively studying: Anthropic's API docs, prompt engineering guides, token economics, and rate limiting patterns
- Built a rapid prototype in 2 days to validate the approach — tested extraction accuracy on 50 real contracts
- Designed a structured prompt pipeline: document chunking → per-chunk extraction → result aggregation → confidence scoring
- Implemented key production patterns: retry with exponential backoff, streaming responses for long documents, token budget management, response validation with Zod schemas
- Paired with the domain expert (lawyer on the team) to iterate on prompts — established a prompt versioning system

**Result:** Delivered on schedule. Extraction accuracy reached 94% (target was 85%). The prompt versioning system became a best practice across the organization. I subsequently gave a team knowledge-sharing session on LLM integration patterns.

---

## Q7. Describe a situation where you made a mistake in production. What happened and what did you learn?

**Why asked:** Tests accountability, learning culture, and post-incident process — critical in SaaS environments.

### Sample STAR Answer

**Situation:** During a deployment at Parsaiane, I pushed a database migration that added a NOT NULL column without a default value to the `contracts` table (3M+ rows). The migration ran for 15 minutes, locking the table and causing a complete service outage for all users.

**Task:** Restore service immediately and prevent similar incidents.

**Action:**
- **Immediate response (5 min):** Rolled back the migration, restored service. Communicated status to the team and affected clients via Slack/email within 10 minutes
- **Root cause analysis:** The migration worked in staging (small dataset) but locked the table in production due to full table rewrite. I hadn't tested with production-scale data
- **Prevention measures I implemented:**
  1. Pre-deployment checklist requiring migration testing against production-size datasets (anonymized)
  2. Two-phase migration pattern: first add column as nullable → backfill in batches → add NOT NULL constraint
  3. CI step that estimates migration time and flags any migration touching >100K rows
  4. Wrote a team ADR documenting safe migration patterns

**Result:** Zero migration-related incidents in the following 12 months. The migration checklist was adopted company-wide. I also gave a knowledge-sharing presentation on safe PostgreSQL migration patterns for large tables.

---

## Q8. Tell me about a time you proactively improved a system or process without being asked.

**Why asked:** JetBridge values initiative and continuous improvement — testing intrinsic motivation.

### Sample STAR Answer

**Situation:** At QueryLaw, pull request reviews were taking 3-5 days on average. Developers would context-switch between tasks while waiting, leading to merge conflicts and feature delays. Nobody had flagged this as a problem — it was "how things worked."

**Task:** I decided to reduce PR review time to under 24 hours by improving both process and tooling.

**Action:**
- Analyzed 3 months of PR data (120 PRs) to identify patterns: average size was 800+ lines, reviews were unassigned, and reviewers had no visibility into what was waiting
- Implemented automated solutions:
  1. GitHub Action that auto-assigns two reviewers based on file ownership (CODEOWNERS file)
  2. Slack bot that posted a daily summary of open PRs, age, and assigned reviewers
  3. PR template with checklist enforcing smaller PRs (< 300 lines) with focused scope
- Proposed a team agreement: PRs under 300 lines get reviewed within 4 business hours; larger PRs get pre-reviewed via a design document
- Led two "PR review workshops" teaching effective review practices (focus on logic, not style — ESLint handles style)

**Result:** Average PR review time dropped from 4.2 days to 8 hours. PR size decreased 65% (average 280 lines). Merge conflict rate dropped 80%. Team velocity (measured by sprint points completed) increased 22% over the next quarter.
