# Backend Topics Summary — Fullstack Interview Prep

> Quick-reference sheet for **non-front-end** topics a fullstack TS/JS candidate should know.
> Covers Node.js internals, HTTP, Express/Fastify, databases, caching, queues, and scaling.

---

## 1. Node.js Architecture

**V8 + libuv** — the two pillars:

| Component | Role |
|-----------|------|
| **V8** | Compiles JS to machine code, manages heap & GC |
| **libuv** | Provides the event loop, async I/O, thread pool (default 4 threads) |

**Single-threaded but non-blocking (for I/O)** — one JS thread handles your code.
> - **I/O (Network, DB, File):** Handled by libuv/OS threads. Your JS **does not wait**; it gets a callback when done.
> - **CPU (Loops, JSON.parse):** Executes on the single JS thread. **This IS blocking.** If you run a `while(true)` loop, the server freezes.

**Why it matters in interviews:**
- Explains why Node.js is great for I/O-bound tasks (APIs, file serving)
- Explains why CPU-bound tasks block the event loop → use Worker Threads

---

## 2. Event Loop — Macrotasks vs Microtasks

**Macrotasks** = the 6 phases of the loop (one task per tick):

```
   ┌───────────────────────────────────────────────────────┐
┌─>│  MACROTASK QUEUE (one phase at a time)                │
│  │                                                       │
│  │  1. timers          ← setTimeout, setInterval        │
│  │  2. pending I/O     ← deferred I/O callbacks         │
│  │  3. idle, prepare   ← internal use                   │
│  │  4. poll            ← I/O events (waits here mostly) │
│  │  5. check           ← setImmediate callbacks         │
│  │  6. close callbacks ← socket.on('close')             │
│  └───────────────────────────────────────────────────────┘
│
│  ↕ After EVERY phase above, drain the MICROTASK QUEUE:
│  ┌───────────────────────────────────────────────────────┐
│  │  MICROTASK QUEUE (ALL run before next macrotask)      │
│  │  1. process.nextTick()  ← highest priority           │
│  │  2. Promise.then / await continuations               │
│  └───────────────────────────────────────────────────────┘
└──── (loop repeats)
```

**Execution order example:**
```js
setTimeout(() => console.log('1 macrotask'), 0);
Promise.resolve().then(() => console.log('2 microtask'));
process.nextTick(() => console.log('3 nextTick'));
console.log('4 sync');

// Output order:
// 4 sync         ← runs first (synchronous code, not in the loop)
// 3 nextTick     ← microtask, highest priority
// 2 microtask    ← microtask, Promise
// 1 macrotask    ← macrotask, setTimeout
```

**Key interview point:** `process.nextTick()` can starve the event loop if called recursively. Prefer `setImmediate()` when deferring non-critical work.

---

## 3. Streams & Backpressure

**4 stream types:** Readable, Writable, Duplex, Transform

**Why streams matter:**
- Process data in **chunks** instead of loading everything into memory
- A 2GB file doesn't need 2GB of RAM — just the current chunk

**Backpressure** — when the consumer can't keep up with the producer:
- `writable.write()` returns `false` when internal buffer is full
- Producer should pause until `'drain'` event fires
- `pipe()` handles backpressure automatically

```javascript
// GOOD: pipe handles backpressure
readStream.pipe(transformStream).pipe(writeStream);

// MANUAL: check write() return value
readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    readable.pause();
    writable.once('drain', () => readable.resume());
  }
});
```

---

## 4. Memory Management & GC

**V8 heap structure:**
- **Young generation** (Scavenger GC) — short-lived objects, fast collection
- **Old generation** (Mark-Sweep-Compact) — long-lived objects, slower GC

**Default heap limit:** ~1.5GB (can be increased with `--max-old-space-size`)

**Common memory leaks:**
1. Global variables / caches that grow unbounded
2. Event listeners not removed
3. Closures holding references to large objects
4. Timers (`setInterval`) not cleared

**Detection:** `process.memoryUsage()`, Chrome DevTools heap snapshots, `--inspect` flag

---

## 5. HTTP & REST

**HTTP methods & semantics:**

| Method | Action | Idempotent | Body |
|--------|--------|------------|------|
| GET | Read | Yes | No |
| POST | Create | No | Yes |
| PUT | Replace | Yes | Yes |
| PATCH | Partial update | No* | Yes |
| DELETE | Remove | Yes | Optional |

*PATCH is not guaranteed idempotent by spec, but can be implemented as such.

**Status codes to know:**

| Code | Meaning | When to use |
|------|---------|-------------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Valid auth but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate, race condition |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Unhandled server error |

**Caching headers:**
- `Cache-Control: max-age=3600` — cache for 1 hour
- `ETag` — content fingerprint for conditional requests
- `stale-while-revalidate` — serve stale cache while fetching fresh data

---

## 6. Express.js & Fastify

### Express — middleware pattern

```
Request → Middleware1 → Middleware2 → ... → Route Handler → Response
           (logging)     (auth)              (business logic)
```

- Middleware: `(req, res, next) => { ... }`
- Error middleware: `(err, req, res, next) => { ... }` — 4 params
- `express.Router()` for modular route files

### Fastify — faster, schema-first

- ~2x faster than Express (pre-compiled serialization)
- JSON Schema validation built-in (validates request AND serializes response)
- Plugin-based architecture (encapsulated scope)
- Hook lifecycle: `onRequest → preParsing → preValidation → preHandler → handler → onSend → onResponse`

**When to choose:**
- **Express:** larger ecosystem, more middleware available, simpler for small projects
- **Fastify:** performance-critical APIs, schema-first design, NestJS integration

---

## 7. Database Concepts

### Transactions (ACID)

| Property | What it means |
|----------|---------------|
| **A**tomicity | All operations succeed or all fail |
| **C**onsistency | Data always valid (constraints enforced) |
| **I**solation | Concurrent transactions don't interfere |
| **D**urability | Committed data survives crashes |

### Indexing
- B-tree indexes: default, great for range queries and equality
- Without index: sequential scan O(n)
- With index: B-tree lookup O(log n)
- **Trade-off:** faster reads, slower writes (each write updates the index)

### Normalization vs Denormalization
- **Normalize** for data integrity, less duplication
- **Denormalize** for read performance (avoid JOINs at scale)
- In practice: normalize first, denormalize specific read paths when needed

### SQL vs NoSQL

| | SQL (PostgreSQL) | NoSQL (MongoDB) |
|---|---|---|
| Schema | Fixed, enforced | Flexible, schemaless |
| Joins | Native, powerful | Manual, expensive |
| Transactions | Full ACID | Limited (multi-doc since v4.0) |
| Scaling | Vertical first | Horizontal (sharding) |
| Best for | Complex queries, relationships | Document data, rapid iteration |

---

## 8. Caching Strategies

### Cache-Aside (Lazy Loading)
1. Read: check cache → if miss, query DB → store in cache → return
2. Write: update DB → invalidate cache (or set TTL)
3. **Pros:** only caches what's needed, resilient to cache failure
4. **Cons:** first request always misses, possible stale data

### Write-Through
1. Write: update cache AND DB simultaneously
2. **Pros:** cache always consistent
3. **Cons:** higher write latency

### TTL Strategy

| Data type | Suggested TTL | Why |
|-----------|---------------|-----|
| Product catalog | 1-5 minutes | Changes occasionally |
| User session | 30 minutes | Security |
| Config/feature flags | 5-10 minutes | Rarely changes |
| Real-time stock | 10-30 seconds | Changes frequently |

**Tool:** Redis — in-memory, supports key expiry, pub/sub, data structures

---

## 9. Promise Concurrency — `all` vs `allSettled` vs `any` vs `race`

| Method | Resolves when | Rejects when | Returns |
|--------|--------------|-------------|---------|
| **`Promise.all`** | **All** promises fulfill | **Any one** rejects (fail-fast) | Array of values |
| **`Promise.allSettled`** | **All** promises settle (fulfill or reject) | **Never** rejects | Array of `{status, value/reason}` |
| **`Promise.any`** | **Any one** fulfills | **All** reject (`AggregateError`) | First fulfilled value |
| **`Promise.race`** | **Any one** settles (first to finish) | If first to settle rejects | Value of first settled |

**When to use each:**

```javascript
// Promise.all — fetch multiple resources, need ALL of them
const [users, orders, inventory] = await Promise.all([
  fetchUsers(),
  fetchOrders(),
  fetchInventory(),
]);
// ⚠ If fetchOrders() fails, entire call rejects — users/inventory are lost

// Promise.allSettled — partial failure is OK
const results = await Promise.allSettled([
  sendEmail(user1),
  sendEmail(user2),
  sendEmail(user3),
]);
const failed = results.filter(r => r.status === 'rejected');
// ✅ Always get results for ALL — some may have failed

// Promise.any — first success wins (fallback pattern)
const data = await Promise.any([
  fetchFromPrimaryDB(),
  fetchFromReplicaDB(),
  fetchFromCache(),
]);
// ✅ Returns fastest successful response, ignores failures
// ⚠ Only rejects if ALL fail (AggregateError)

// Promise.race — first to settle wins (timeout pattern)
const result = await Promise.race([
  fetchData(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 5000)
  ),
]);
// ✅ If fetchData takes > 5s, timeout error fires
// ⚠ First to finish wins — even if it's a rejection
```

**Quick mental model:**
- **all** = "I need everything" → one failure = total failure
- **allSettled** = "Give me everything, failures included" → never throws
- **any** = "Give me the first success" → ignores failures until all fail
- **race** = "Give me the first result, good or bad" → fastest wins

---

## 10. Message Queues & Async Processing

**Why:** Decouple services, handle spikes, ensure reliability

**Pattern:** Producer → Queue → Consumer

**Use cases:**
- Email/notification sending (don't block the API response)
- Order processing (validate → charge → fulfill → notify)
- Heavy computation (image processing, report generation)
- Rate limiting external API calls

**Tools:** Bull/BullMQ (Redis-based, great with Node.js), RabbitMQ, AWS SQS

**Key concepts:**
- **At-least-once delivery** — consumer may get the same message twice → make handlers idempotent
- **Dead letter queue (DLQ)** — failed messages go here for investigation
- **Backpressure** — queue grows when consumers can't keep up → add more consumers or slow producers

---

## 10. Scaling Backend Services

### Vertical vs Horizontal

| | Vertical (scale up) | Horizontal (scale out) |
|---|---|---|
| How | Bigger machine (more CPU/RAM) | More machines |
| Limit | Hardware ceiling | Network complexity |
| Downtime | Usually requires restart | Zero-downtime possible |
| Best for | Quick fix, DB servers | Web/API servers, stateless services |

### Horizontal scaling requirements:
- **Stateless services** — no in-memory sessions (use Redis/DB)
- **Load balancer** — distribute requests (Nginx, HAProxy, cloud LB)
- **Shared storage** — DB, Redis, S3 for file uploads
- **Health checks** — LB needs to know which instances are alive

### Node.js specific scaling:
- **Cluster module** — fork one worker per CPU core
- **PM2** — process manager with cluster mode, auto-restart, monitoring
- **Worker Threads** — for CPU-bound tasks (don't block the event loop)
- **Container orchestration** — Docker + Kubernetes for multi-instance deployment

---

## 11. Security Essentials

- **Input validation** — never trust client data, validate with Zod/Joi/class-validator
- **SQL injection** — always use parameterized queries, never string concatenation
- **Authentication** — JWT (stateless) vs sessions (stateful), store tokens in httpOnly cookies
- **Authorization** — RBAC (role-based), check permissions at every endpoint
- **CORS** — configure allowed origins explicitly, never use `*` in production
- **Rate limiting** — prevent abuse, use middleware (e.g., `express-rate-limit`)
- **Environment variables** — never commit secrets, use `.env` + `dotenv` or vault

---

## 12. System Design Interview Basics

**Framework for answering:**

1. **Clarify requirements** — functional + non-functional (scale, latency, availability)
2. **Make assumptions** — state them explicitly ("I'll assume 10K requests/second")
3. **High-level design** — boxes and arrows (client → LB → API → DB)
4. **Deep dive** — pick the most interesting component, discuss trade-offs
5. **Identify bottlenecks** — single points of failure, scaling limits

**Key trade-offs to discuss:**
- Consistency vs availability (CAP theorem)
- Latency vs throughput
- Normalization vs denormalization
- Caching vs freshness
- Monolith vs microservices

**Production readiness checklist:**
- Logging (structured, centralized — e.g., Winston + ELK)
- Monitoring (APM — Datadog, New Relic)
- Alerting (error rate, latency spikes)
- Graceful shutdown (handle SIGTERM, drain connections)
- Health check endpoints
