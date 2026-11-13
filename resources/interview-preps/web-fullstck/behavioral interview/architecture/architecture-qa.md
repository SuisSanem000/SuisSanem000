# System Architecture - Interview Study Guide

## Architectural Patterns

### 1. Modular Architecture
- [ ] Understand benefits of modular design
- [ ] Organize code by feature/domain
- [ ] Define clear module boundaries
- [ ] Manage dependencies between modules
- [ ] Practice separation of concerns

### 2. Breaking Monoliths
- [ ] Understand strangler pattern for gradual migration
- [ ] Identify bounded contexts for services
- [ ] Extract services incrementally
- [ ] Maintain data consistency during transition
- [ ] Plan API contracts between old/new systems

### 3. Microservices vs Monolith
- [ ] Know monolith benefits: simpler deployment, shared code, easier transactions
- [ ] Know microservices benefits: independent scaling, tech diversity, fault isolation
- [ ] Understand trade-offs: complexity, network latency, data consistency
- [ ] Know when to start with monolith
- [ ] Know when to split into microservices

---

## Scalability

### 4. Horizontal vs Vertical Scaling
- [ ] Understand vertical scaling (bigger server)
- [ ] Understand horizontal scaling (more servers)
- [ ] Know when each is appropriate
- [ ] Understand load balancing across instances
- [ ] Plan for stateless services

### 5. Caching Strategies
- [ ] Understand cache-aside pattern
- [ ] Understand write-through pattern
- [ ] Use Redis for frequently accessed data
- [ ] Implement cache invalidation strategies
- [ ] Set appropriate TTL values

### 6. Database Scaling
- [ ] Use read replicas for read-heavy loads
- [ ] Understand database sharding
- [ ] Implement connection pooling
- [ ] Use caching to reduce database load
- [ ] Consider NoSQL for specific use cases

---

## Partao-Specific Design

### 7. Supplier Allocation Algorithm
- [ ] Design algorithm considering multiple factors
- [ ] Weigh delivery time, stock, price, reliability
- [ ] Handle real-time stock updates
- [ ] Scale to handle 10,000+ orders/minute
- [ ] Cache supplier scores for performance

### 8. Competitor Monitoring System
- [ ] Design web scraping service with rate limiting
- [ ] Store price history in time-series database
- [ ] Send real-time alerts for price changes
- [ ] Scale scraping across worker nodes
- [ ] Handle 5M products × price checks

### 9. Marketplace Platform
- [ ] Design architecture for 5M SKUs
- [ ] Plan product search and filtering
- [ ] Handle high traffic on popular products
- [ ] Design order processing pipeline
- [ ] Plan inventory management system

---

## Design Principles

### 10. Decision Making
- [ ] Always discuss trade-offs
- [ ] Consider current scale vs future scale
- [ ] Start simple, refactor when needed
- [ ] Measure before optimizing
- [ ] Document architectural decisions

---

## Practice Tasks

### Complete These
- [ ] Sketch architecture for breaking Magento monolith
- [ ] Design supplier allocation algorithm
- [ ] Plan caching strategy for 5M products
- [ ] Design competitor monitoring system
- [ ] Create system diagram for marketplace
- [ ] List trade-offs for each decision

---

# Detailed Explanations

## 1. Modular Architecture

### What Is Modular Architecture?
Modular architecture is a design approach where a system is divided into separate, self-contained modules (or components), each responsible for a specific feature or domain. Modules communicate through well-defined interfaces.

### Benefits of Modular Design
- **Maintainability**: Easier to update or fix one module without affecting others
- **Testability**: Modules can be tested in isolation
- **Reusability**: Modules can be reused across different projects
- **Team Scalability**: Different teams can work on different modules independently
- **Encapsulation**: Implementation details are hidden behind interfaces

### Organizing Code by Feature/Domain
```
src/
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.module.ts
├── products/
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
└── orders/
    ├── orders.controller.ts
    ├── orders.service.ts
    └── orders.module.ts
```

### Clear Module Boundaries
- Each module should have a **public API** (what it exposes) and **private implementation** (internal details)
- Use dependency injection to manage module dependencies
- Avoid circular dependencies between modules

### Managing Dependencies
```typescript
// Good: Module B depends on Module A's interface
import { UserService } from '../users/users.service';

// Bad: Circular dependency
// Module A imports Module B, and Module B imports Module A
```

### Separation of Concerns
Each module should handle **one responsibility**:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Handle data access
- **DTOs**: Define data transfer objects

---

## 2. Breaking Monoliths

### The Strangler Pattern
A gradual migration strategy where you incrementally replace parts of a monolith with new services while the monolith continues to run.

```
┌─────────────────────────────────────┐
│           API Gateway               │
│  (Routes traffic to old or new)     │
└──────────────┬──────────────────────┘
               │
   ┌───────────┴───────────┐
   │                       │
   ▼                       ▼
┌─────────┐         ┌─────────────┐
│ Monolith│         │ New Service │
│ (legacy)│         │ (extracted) │
└─────────┘         └─────────────┘
```

**Steps:**
1. Put a facade (API gateway) in front of the monolith
2. Identify a bounded context to extract
3. Build the new service
4. Route traffic to new service gradually
5. Repeat until monolith is fully strangled

### Identifying Bounded Contexts
A bounded context is a logical boundary within which a particular domain model is defined and applicable.

**Example for e-commerce:**
- **Product Catalog**: Product information, categories, attributes
- **Inventory**: Stock levels, warehouses
- **Orders**: Order processing, status
- **Payments**: Payment processing, refunds
- **Users**: Authentication, profiles

### Extracting Services Incrementally
1. Start with the least coupled module
2. Create the new service with its own database
3. Implement sync mechanism if needed
4. Update the monolith to call the new service
5. Monitor and validate
6. Remove code from monolith

### Maintaining Data Consistency
- Use **event-driven architecture** to sync data between services
- Implement **saga pattern** for distributed transactions
- Use **eventual consistency** where possible
- Avoid distributed transactions when you can

### Planning API Contracts
- Define clear API contracts before extraction
- Use versioning for APIs (e.g., `/api/v1/products`)
- Document with OpenAPI/Swagger
- Test contract compatibility

---

## 3. Microservices vs Monolith

### Monolith Benefits
| Benefit | Explanation |
|---------|-------------|
| Simpler deployment | Single artifact to deploy |
| Shared code | Easy to share utilities and models |
| Easier transactions | ACID transactions within single database |
| Easier debugging | Full stack trace in one place |
| Lower latency | No network calls between components |

### Microservices Benefits
| Benefit | Explanation |
|---------|-------------|
| Independent scaling | Scale only what needs scaling |
| Technology diversity | Use best tool for each service |
| Fault isolation | One service failure doesn't crash all |
| Independent deployment | Deploy services independently |
| Team autonomy | Teams own their services end-to-end |

### Trade-offs

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Complexity | Low | High |
| Deployment | Simple | Complex (need orchestration) |
| Data consistency | Easy (ACID) | Hard (eventual consistency) |
| Network latency | None | Present between services |
| Monitoring | Simple | Need distributed tracing |

### When to Start with Monolith
- Early-stage startup with uncertain requirements
- Small team (< 10 developers)
- Need to move fast and iterate
- Domain is not well understood yet

### When to Split into Microservices
- Clear bounded contexts identified
- Team size requires independent work
- Different scaling requirements for components
- Need technology diversity
- Deployment independence is valuable

---

## 4. Horizontal vs Vertical Scaling

### Vertical Scaling (Scale Up)
Adding more power to an existing server: more CPU, RAM, or storage.

**Pros:**
- Simple to implement
- No code changes required
- No distributed system complexity

**Cons:**
- Hardware limits
- Single point of failure
- Expensive at scale

### Horizontal Scaling (Scale Out)
Adding more servers to distribute the load.

**Pros:**
- Virtually unlimited scaling
- Better fault tolerance
- Cost-effective with commodity hardware

**Cons:**
- Requires stateless design
- Need load balancing
- Distributed system complexity

### When to Use Each

| Scenario | Recommendation |
|----------|----------------|
| Quick fix for traffic spike | Vertical |
| Database with complex queries | Vertical first |
| Web servers | Horizontal |
| Need high availability | Horizontal |
| Startup/early stage | Vertical |
| Mature product at scale | Horizontal |

### Load Balancing Algorithms
- **Round Robin**: Distribute requests equally
- **Least Connections**: Send to server with fewest connections
- **IP Hash**: Same client always goes to same server
- **Weighted**: Distribute based on server capacity

### Stateless Services
For horizontal scaling, services must be stateless:

```typescript
// ❌ Bad: State stored in server memory
let userSession = {};

app.post('/login', (req, res) => {
  userSession[req.body.userId] = { loggedIn: true };
});

// ✅ Good: State stored externally (Redis)
app.post('/login', async (req, res) => {
  await redis.set(`session:${req.body.userId}`, JSON.stringify({ loggedIn: true }));
});
```

---

## 5. Caching Strategies

### Cache-Aside Pattern (Lazy Loading)
Application manages the cache directly.

```typescript
async function getProduct(id: string) {
  // 1. Check cache first
  let product = await redis.get(`product:${id}`);
  
  if (product) {
    return JSON.parse(product);
  }
  
  // 2. Cache miss: fetch from database
  product = await db.findProduct(id);
  
  // 3. Store in cache for next time
  await redis.setex(`product:${id}`, 3600, JSON.stringify(product));
  
  return product;
}
```

**Pros:** Only cache what's needed, resilient to cache failure
**Cons:** Cache miss penalty, possible stale data

### Write-Through Pattern
Data is written to cache and database simultaneously.

```typescript
async function updateProduct(id: string, data: ProductData) {
  // Write to database
  await db.updateProduct(id, data);
  
  // Update cache immediately
  await redis.setex(`product:${id}`, 3600, JSON.stringify(data));
}
```

**Pros:** Cache always fresh
**Cons:** Write latency, cache filled with rarely read data

### Cache Invalidation Strategies
1. **TTL (Time To Live)**: Cache expires after set time
2. **Event-based**: Invalidate on update events
3. **Manual**: Explicitly delete cache when data changes

```typescript
// TTL-based
await redis.setex('product:123', 3600, data); // Expires in 1 hour

// Event-based invalidation
eventBus.on('product.updated', async (productId) => {
  await redis.del(`product:${productId}`);
});
```

### Appropriate TTL Values
| Data Type | TTL | Reason |
|-----------|-----|--------|
| Product catalog | 5-15 minutes | Changes occasionally |
| User session | 30 minutes | Security |
| Static content | 24 hours | Rarely changes |
| Real-time stock | 10-30 seconds | Changes frequently |

---

## 6. Database Scaling

### Read Replicas
Create copies of the database for read operations.

```
┌────────────────┐
│  Application   │
└───────┬────────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌─────┐   ┌─────────────────────┐
│Write│   │       Reads         │
│     │   │                     │
│Master├──►│Replica1  Replica2  │
└─────┘   └─────────────────────┘
```

### Database Sharding
Split data across multiple databases based on a shard key.

```
User ID 1-1M    → Shard 1
User ID 1M-2M   → Shard 2
User ID 2M-3M   → Shard 3
```

**Sharding strategies:**
- **Range-based**: Shard by ID ranges
- **Hash-based**: Hash the shard key
- **Geographic**: Shard by region

### Connection Pooling
Reuse database connections instead of creating new ones.

```typescript
// With connection pooling (recommended)
const pool = new Pool({
  max: 20,                 // Maximum connections
  min: 5,                  // Minimum connections
  idleTimeoutMillis: 30000 // Close idle connections
});

// Each query uses a connection from the pool
const result = await pool.query('SELECT * FROM products');
```

### NoSQL for Specific Use Cases
| Use Case | Database | Reason |
|----------|----------|--------|
| Session storage | Redis | Fast, in-memory |
| Product catalog | MongoDB | Flexible schema |
| Time-series data | InfluxDB | Optimized for time data |
| Graph relationships | Neo4j | Relationship queries |
| Full-text search | Elasticsearch | Search capabilities |

---

## 7. Supplier Allocation Algorithm

### Multi-Factor Algorithm Design
```typescript
interface SupplierScore {
  supplierId: string;
  deliveryTimeScore: number;  // 0-100
  stockScore: number;         // 0-100
  priceScore: number;         // 0-100
  reliabilityScore: number;   // 0-100
  totalScore: number;
}

function calculateSupplierScore(supplier: Supplier, order: Order): SupplierScore {
  // Weights for each factor
  const weights = {
    deliveryTime: 0.3,
    stock: 0.25,
    price: 0.25,
    reliability: 0.2
  };
  
  const deliveryTimeScore = calculateDeliveryScore(supplier, order);
  const stockScore = calculateStockScore(supplier, order);
  const priceScore = calculatePriceScore(supplier, order);
  const reliabilityScore = supplier.reliabilityRating * 10;
  
  const totalScore = 
    deliveryTimeScore * weights.deliveryTime +
    stockScore * weights.stock +
    priceScore * weights.price +
    reliabilityScore * weights.reliability;
  
  return {
    supplierId: supplier.id,
    deliveryTimeScore,
    stockScore,
    priceScore,
    reliabilityScore,
    totalScore
  };
}
```

### Handling Real-Time Stock Updates
```typescript
// Use Redis for real-time stock with TTL
async function updateStock(supplierId: string, productId: string, quantity: number) {
  const key = `stock:${supplierId}:${productId}`;
  await redis.set(key, quantity);
  await redis.expire(key, 300); // 5-minute TTL
  
  // Publish event for subscribers
  await redis.publish('stock-updates', JSON.stringify({
    supplierId,
    productId,
    quantity
  }));
}
```

### Scaling for 10,000+ Orders/Minute
- **Queue-based processing**: Use message queues (RabbitMQ, Kafka)
- **Pre-computed scores**: Cache supplier scores, update periodically
- **Horizontal scaling**: Multiple worker instances
- **Database optimization**: Indexes, read replicas

---

## 8. Competitor Monitoring System

### Web Scraping with Rate Limiting
```typescript
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  maxConcurrent: 5,      // Max 5 concurrent requests
  minTime: 200           // Min 200ms between requests
});

async function scrapePrice(url: string) {
  return limiter.schedule(async () => {
    const response = await fetch(url);
    const html = await response.text();
    return parsePrice(html);
  });
}
```

### Time-Series Database for Price History
```sql
-- InfluxDB style
SELECT mean("price") FROM "product_prices"
WHERE "competitor" = 'competitor_a' AND time > now() - 7d
GROUP BY time(1h)
```

### Real-Time Price Alerts
```typescript
async function checkPriceChange(productId: string, newPrice: number) {
  const currentPrice = await redis.get(`price:${productId}`);
  const percentChange = ((newPrice - currentPrice) / currentPrice) * 100;
  
  if (Math.abs(percentChange) > 5) { // 5% threshold
    await sendAlert({
      productId,
      oldPrice: currentPrice,
      newPrice,
      percentChange,
      timestamp: new Date()
    });
  }
  
  await redis.set(`price:${productId}`, newPrice);
}
```

### Scaling Across Worker Nodes
```
┌─────────────┐
│ Job Queue   │
│  (Redis)    │
└──────┬──────┘
       │
 ┌─────┴─────┐
 │  Workers  │
 ├───────────┤
 │ Worker 1  │──► Scrape competitor A
 │ Worker 2  │──► Scrape competitor B
 │ Worker 3  │──► Scrape competitor C
 │ Worker N  │──► ...
 └───────────┘
```

---

## 9. Marketplace Platform Architecture

### Architecture for 5M SKUs
```
┌─────────────────────────────────────────────────────────┐
│                      API Gateway                         │
│              (Rate Limiting, Auth, Routing)              │
└─────────────────────────────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐         ┌─────────────┐        ┌─────────────┐
│ Product │         │   Order     │        │  Inventory  │
│ Service │         │  Service    │        │   Service   │
└────┬────┘         └──────┬──────┘        └──────┬──────┘
     │                     │                      │
     ▼                     ▼                      ▼
┌─────────┐         ┌─────────────┐        ┌─────────────┐
│Elastic- │         │ PostgreSQL  │        │   Redis +   │
│ search  │         │             │        │  PostgreSQL │
└─────────┘         └─────────────┘        └─────────────┘
```

### Product Search and Filtering
Using Elasticsearch for fast, full-text search:

```typescript
// Elasticsearch query for products
const searchProducts = async (query: string, filters: Filters) => {
  return await elasticsearch.search({
    index: 'products',
    body: {
      query: {
        bool: {
          must: [
            { multi_match: { query, fields: ['name', 'description'] } }
          ],
          filter: [
            { range: { price: { gte: filters.minPrice, lte: filters.maxPrice } } },
            { term: { category: filters.category } },
            { term: { inStock: true } }
          ]
        }
      },
      sort: [
        { _score: 'desc' },
        { popularity: 'desc' }
      ]
    }
  });
};
```

### Order Processing Pipeline
```
Order Created
     │
     ▼
┌─────────────┐
│  Validate   │──► Invalid → Reject
└─────────────┘
     │ Valid
     ▼
┌─────────────┐
│  Reserve    │──► No Stock → Backorder
│  Inventory  │
└─────────────┘
     │ Reserved
     ▼
┌─────────────┐
│  Process    │──► Failed → Refund
│  Payment    │
└─────────────┘
     │ Paid
     ▼
┌─────────────┐
│  Allocate   │
│  Supplier   │
└─────────────┘
     │
     ▼
┌─────────────┐
│   Fulfill   │
└─────────────┘
```

---

## 10. Design Principles & Decision Making

### Always Discuss Trade-offs
Every architectural decision has trade-offs. Always present them:

| Decision | Pros | Cons |
|----------|------|------|
| Add caching | Faster reads | Stale data, complexity |
| Microservices | Scale independently | Network latency, complexity |
| NoSQL | Flexible schema | No ACID, eventual consistency |

### Current Scale vs Future Scale
- Don't over-engineer for hypothetical scale
- Design for 10x current load, not 1000x
- Plan for refactoring, not perfection

### Start Simple, Refactor When Needed
```
Phase 1: Monolith with good modules
     ↓ (when team grows)
Phase 2: Extract high-load services
     ↓ (when scale demands)
Phase 3: Full microservices
```

### Measure Before Optimizing
```typescript
// Add timing to identify bottlenecks
console.time('database-query');
const results = await db.query('SELECT * FROM products');
console.timeEnd('database-query');

// Use APM tools (New Relic, DataDog) for production
```

### Document Architectural Decisions (ADRs)
```markdown
# ADR-001: Use Redis for Session Storage

## Status
Accepted

## Context
We need session storage that works with horizontal scaling.

## Decision
Use Redis for session storage instead of in-memory sessions.

## Consequences
- Sessions work across multiple servers
- Added Redis dependency
- Need Redis high availability setup
```

---

## 11. API Design Principles

### RESTful API Design Best Practices

RESTful APIs should be **resource-oriented**, using nouns (not verbs) in URLs and HTTP methods for actions.

#### URL Structure
```
✅ Good (resource-based):
GET    /api/v1/products          → List products
GET    /api/v1/products/123      → Get product 123
POST   /api/v1/products          → Create a product
PUT    /api/v1/products/123      → Replace product 123
PATCH  /api/v1/products/123      → Partial update product 123
DELETE /api/v1/products/123      → Delete product 123

❌ Bad (verb-based):
GET    /api/getProducts
POST   /api/createProduct
POST   /api/deleteProduct/123
```

#### HTTP Status Codes (Know These!)

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (new resource) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, version conflict |
| 422 | Unprocessable Entity | Valid JSON but semantic errors |
| 429 | Too Many Requests | Rate limiting |
| 500 | Internal Server Error | Unexpected server error |

#### Consistent Response Format

```json
// Success response
{
  "data": { "id": 1, "name": "Product" },
  "meta": { "timestamp": "2024-01-15T10:00:00Z" }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid product data",
    "details": [
      { "field": "price", "message": "Price must be positive" }
    ]
  }
}

// List response with pagination
{
  "data": [{ "id": 1 }, { "id": 2 }],
  "pagination": {
    "total": 5000000,
    "page": 1,
    "limit": 20,
    "nextCursor": "abc123"
  }
}
```

#### API Versioning Strategies

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| URL path | `/api/v1/products` | Clear, easy | URL changes |
| Header | `Accept: application/vnd.api.v1+json` | Clean URLs | Less visible |
| Query param | `/api/products?version=1` | Simple | Can be forgotten |

**Recommendation**: URL path versioning (`/api/v1/`) is most common and practical.

#### Rate Limiting
```typescript
// Express/Fastify middleware pattern
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per window
  message: { error: 'Too many requests, try again later' }
};
```

#### Filtering, Sorting, and Pagination
```
GET /api/v1/products?category=electronics&minPrice=100&sort=-price&limit=20&cursor=abc123

- category=electronics  → filter
- minPrice=100          → filter
- sort=-price           → sort descending by price
- limit=20              → page size
- cursor=abc123         → cursor-based pagination
```

---

## 12. System Design Methodology

### Step-by-Step Approach for Interviews

When asked to design a system, follow this structured approach:

#### Step 1: Clarify Requirements (2-3 minutes)
- **Functional**: What should the system do?
- **Non-functional**: Scale, performance, availability requirements
- **Constraints**: Budget, timeline, team size, existing tech

```
Example: "Design a product search for a marketplace"
Questions to ask:
- How many products? (5M SKUs)
- How many searches/second? (10K QPS)
- Do we need autocomplete?
- What filters are needed?
- How fresh should results be?
```

#### Step 2: High-Level Design (5-10 minutes)
Draw components and how they interact:

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  Client  │────→│  API Gateway │────→│  Search      │
│  (React) │     │  (Auth/Rate) │     │  Service     │
└──────────┘     └─────────────┘     └──────┬───────┘
                                            │
                                    ┌───────┴────────┐
                                    │                │
                                ┌───▼────┐     ┌────▼────┐
                                │Elastic │     │  Redis  │
                                │search  │     │ (cache) │
                                └────────┘     └─────────┘
```

#### Step 3: Deep Dive into Components (10-15 minutes)
- Database schema and indexing
- Caching strategy
- Data flow and APIs
- Error handling

#### Step 4: Address Scalability (5 minutes)
- What's the bottleneck?
- How to scale horizontally?
- Where to add caching?
- What to monitor?

#### Step 5: Trade-offs Discussion (2-3 minutes)
Always present alternatives with pros/cons.

### Common System Design Topics

| System | Key Challenges |
|--------|---------------|
| URL Shortener | Hashing, collision handling, redirect performance |
| Chat System | WebSockets, message ordering, offline delivery |
| E-commerce Search | Full-text search, faceted filtering, ranking |
| Rate Limiter | Token bucket, sliding window, distributed state |
| Notification System | Multi-channel delivery, priority queues, retry |
| File Storage | Chunking, deduplication, CDN distribution |

---

## 13. PNPM Workspaces (Monorepo Management)

### What is PNPM?
PNPM (Performant NPM) is a fast, disk-efficient package manager that uses a content-addressable store to avoid duplicate packages.

### Why PNPM over NPM/Yarn?

| Feature | npm | Yarn | PNPM |
|---------|-----|------|------|
| Disk space | Duplicates per project | Duplicates per project | Shared store (symlinks) |
| Install speed | Slow | Fast | Fastest |
| Strictness | Phantom dependencies allowed | Phantom dependencies allowed | Strict (no hoisting issues) |
| Monorepo support | npm workspaces | Yarn workspaces | PNPM workspaces |

### PNPM Workspaces Setup

```yaml
# pnpm-workspace.yaml (root of monorepo)
packages:
  - 'apps/*'        # Frontend apps
  - 'packages/*'    # Shared libraries
  - 'services/*'    # Backend services
```

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json             # Root package.json
├── apps/
│   ├── web/                 # Next.js frontend
│   │   └── package.json
│   └── admin/               # Admin dashboard
│       └── package.json
├── packages/
│   ├── ui/                  # Shared UI components
│   │   └── package.json
│   ├── utils/               # Shared utilities
│   │   └── package.json
│   └── types/               # Shared TypeScript types
│       └── package.json
└── services/
    ├── api/                 # NestJS API
    │   └── package.json
    └── worker/              # Background worker
        └── package.json
```

### Key PNPM Commands

```bash
# Install all dependencies across workspace
pnpm install

# Run a script in a specific workspace
pnpm --filter web dev
pnpm --filter api build

# Run scripts across all workspaces
pnpm -r build           # Build all packages
pnpm -r test            # Test all packages

# Add dependency to a specific workspace
pnpm --filter web add react
pnpm --filter api add @nestjs/core

# Add shared package as dependency
pnpm --filter web add @myorg/ui --workspace

# Add dev dependency to root
pnpm add -D typescript -w
```

### Referencing Workspace Packages

```json
// apps/web/package.json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",      // Use workspace version
    "@myorg/utils": "workspace:^1.0.0"
  }
}
```

### Benefits for Full-Stack Projects
- **Shared types**: Define TypeScript types once, use in frontend + backend
- **Shared utils**: Common validation, formatting functions
- **Shared UI**: Component library used across multiple apps
- **Single CI/CD**: One pipeline to build, test, and deploy everything
- **Consistent versions**: All projects use same dependency versions

---

## 14. Dependency Injection (DI) Design Pattern

### What is Dependency Injection?
DI is a design pattern where a class receives its dependencies from external sources rather than creating them itself. It's a form of **Inversion of Control (IoC)**.

### Without DI (Tightly Coupled)
```typescript
// ❌ Bad: Service creates its own dependencies
class OrderService {
  private db: Database;
  private emailService: EmailService;
  
  constructor() {
    this.db = new PostgresDatabase();     // Hardcoded dependency
    this.emailService = new SmtpEmailService(); // Hardcoded
  }
  
  async createOrder(data: OrderData) {
    const order = await this.db.save(data);
    await this.emailService.send(order);
    return order;
  }
}

// Problems:
// - Can't switch database without changing OrderService
// - Can't test without real database and email server
// - Tightly coupled
```

### With DI (Loosely Coupled)
```typescript
// ✅ Good: Dependencies are injected
interface IDatabase {
  save(data: any): Promise<any>;
}

interface IEmailService {
  send(data: any): Promise<void>;
}

class OrderService {
  constructor(
    private db: IDatabase,           // Injected via interface
    private emailService: IEmailService  // Injected via interface
  ) {}
  
  async createOrder(data: OrderData) {
    const order = await this.db.save(data);
    await this.emailService.send(order);
    return order;
  }
}

// Usage: Wire dependencies externally
const db = new PostgresDatabase();
const email = new SmtpEmailService();
const orderService = new OrderService(db, email);

// Testing: Easy to mock
const mockDb = { save: jest.fn().mockResolvedValue({ id: 1 }) };
const mockEmail = { send: jest.fn().mockResolvedValue(undefined) };
const testService = new OrderService(mockDb, mockEmail);
```

### DI in NestJS (Framework-Managed)
```typescript
// NestJS handles DI automatically via decorators
@Injectable()
class OrderService {
  constructor(
    private db: DatabaseService,    // NestJS injects this
    private email: EmailService     // NestJS injects this
  ) {}
}

@Module({
  providers: [OrderService, DatabaseService, EmailService],
  controllers: [OrderController],
})
class OrderModule {}
```

### Benefits of DI
| Benefit | Explanation |
|---------|-------------|
| Testability | Mock dependencies in unit tests |
| Loose Coupling | Components don't know concrete implementations |
| Flexibility | Swap implementations without changing consumers |
| Single Responsibility | Each class does one thing |
| Maintainability | Changes in one component don't cascade |

### Types of DI
1. **Constructor Injection** (most common): Dependencies passed via constructor
2. **Setter Injection**: Dependencies set via setter methods
3. **Interface Injection**: Component implements an interface for injection

