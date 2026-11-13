# Databases - Interview Study Guide

## SQL Concepts

### 1. Database Schema Design
- [ ] Design normalized schemas (1NF, 2NF, 3NF)
- [ ] Understand when to denormalize for performance
- [ ] Create proper primary and foreign keys
- [ ] Design schemas for marketplace (products, suppliers, orders)
- [ ] Handle many-to-many relationships with junction tables

### 2. Indexing
- [ ] Understand what indexes are and why they speed up queries
- [ ] Create indexes on foreign keys
- [ ] Create indexes on frequently filtered columns
- [ ] Know when indexes slow down writes
- [ ] Use EXPLAIN/EXPLAIN ANALYZE to check query plans

### 3. Query Optimization
- [ ] Identify and fix N+1 query problems
- [ ] Use JOINs instead of multiple queries
- [ ] Optimize WHERE clauses with indexes
- [ ] Use LIMIT for pagination
- [ ] Understand query execution plans

### 4. Transactions
- [ ] Understand ACID properties
- [ ] Use transactions for multi-step operations
- [ ] Handle rollbacks on errors
- [ ] Understand isolation levels
- [ ] Avoid deadlocks

---

## NoSQL Concepts

### 5. MongoDB Patterns
- [ ] Understand document-based data model
- [ ] Design schemas with embedded vs referenced documents
- [ ] Use aggregation pipelines for complex queries
- [ ] Create indexes for query performance
- [ ] Handle large datasets efficiently

### 6. NoSQL vs SQL Trade-offs
- [ ] Know when to use SQL (transactions, complex joins)
- [ ] Know when to use NoSQL (flexibility, horizontal scaling)
- [ ] Understand CAP theorem basics
- [ ] Compare consistency models
- [ ] Choose right database for use case

---

## Partao-Specific Scenarios

### 7. Handling 5 Million SKUs
- [ ] Design schema that scales to 5M products
- [ ] Use appropriate indexes for product searches
- [ ] Implement efficient pagination (cursor vs offset)
- [ ] Consider partitioning strategies
- [ ] Cache frequently accessed data

### 8. Supplier Data Management
- [ ] Design supplier table with stock, pricing, delivery time
- [ ] Create indexes for allocation queries
- [ ] Handle real-time stock updates
- [ ] Track supplier reliability/rating
- [ ] Design order-supplier relationship

---

## Common Issues

### Problems to Solve
- [ ] Fix N+1 query problems with eager loading
- [ ] Add missing indexes after running EXPLAIN
- [ ] Optimize slow queries for large tables
- [ ] Design connection pooling strategy
- [ ] Implement caching layer with Redis

---

## Practice Tasks

### Complete These
- [ ] Design complete marketplace database schema
- [ ] Write optimized query for searching 5M products
- [ ] Implement pagination with cursor-based approach
- [ ] Create indexes and verify with EXPLAIN
- [ ] Build MongoDB aggregation pipeline
- [ ] Design caching strategy for product catalog

---

# Detailed Explanations

## 1. Database Schema Design

### Understanding Normal Forms

**First Normal Form (1NF):**
- Each column contains atomic (indivisible) values
- No repeating groups or arrays in a single column

```sql
-- ❌ Bad: Not in 1NF (multiple values in one column)
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    product_ids VARCHAR(255)  -- "1,2,3,4"
);

-- ✅ Good: 1NF (separate rows for each product)
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    PRIMARY KEY (order_id, product_id)
);
```

**Second Normal Form (2NF):**
- Must be in 1NF
- All non-key columns depend on the entire primary key (no partial dependencies)

```sql
-- ❌ Bad: product_name depends only on product_id, not order_id
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),  -- Partial dependency
    quantity INT
);

-- ✅ Good: Separate tables
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT
);
```

**Third Normal Form (3NF):**
- Must be in 2NF
- No transitive dependencies (non-key columns depending on other non-key columns)

```sql
-- ❌ Bad: city depends on zip_code, not directly on customer_id
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    zip_code VARCHAR(10),
    city VARCHAR(100)  -- Transitive dependency
);

-- ✅ Good: Separate lookup table
CREATE TABLE zip_codes (
    zip_code VARCHAR(10) PRIMARY KEY,
    city VARCHAR(100)
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    zip_code VARCHAR(10) REFERENCES zip_codes(zip_code)
);
```

### When to Denormalize

| Scenario | Denormalize? | Reason |
|----------|--------------|--------|
| Read-heavy analytics | ✅ Yes | Avoid JOINs for faster reads |
| Frequently accessed aggregates | ✅ Yes | Cache calculated values |
| Write-heavy OLTP | ❌ No | Need data integrity |
| Complex transactions | ❌ No | Maintain ACID |

### Marketplace Schema Example

```sql
-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT REFERENCES categories(id),
    base_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0,
    delivery_time_hours INT
);

-- Product-Supplier relationship (many-to-many)
CREATE TABLE supplier_products (
    supplier_id INT REFERENCES suppliers(id),
    product_id INT REFERENCES products(id),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    PRIMARY KEY (supplier_id, product_id)
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    supplier_id INT REFERENCES suppliers(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);
```

---

## 2. Indexing

### What Are Indexes?

An index is a data structure (typically B-tree) that speeds up data retrieval at the cost of slower writes and additional storage.

```
Without Index: Full table scan O(n)
┌───────────────────────────────────────────┐
│ Scan every row to find product_id = 1234  │
└───────────────────────────────────────────┘

With Index: B-tree lookup O(log n)
┌─────────────────────────────────────────────┐
│ Jump directly to product_id = 1234 via tree │
└─────────────────────────────────────────────┘
```

### Creating Effective Indexes

```sql
-- Index on foreign keys (always do this)
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Index on frequently filtered columns
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);

-- Composite index for common query patterns
CREATE INDEX idx_supplier_products_price 
ON supplier_products(product_id, price);

-- Partial index for specific conditions
CREATE INDEX idx_orders_pending 
ON orders(created_at) 
WHERE status = 'pending';
```

### When Indexes Slow Down Writes

Each index must be updated when data changes:

| Operation | Without Index | With 5 Indexes |
|-----------|---------------|----------------|
| INSERT | 1 write | 6 writes |
| UPDATE | 1 write | Up to 6 writes |
| DELETE | 1 write | 6 writes |

**Rule of thumb:** More indexes = faster reads, slower writes

### Using EXPLAIN ANALYZE

```sql
-- Check if query uses index
EXPLAIN ANALYZE 
SELECT * FROM products WHERE category_id = 5;

-- Good output (uses index):
-- Index Scan using idx_products_category on products
-- Execution Time: 0.5ms

-- Bad output (full table scan):
-- Seq Scan on products
-- Execution Time: 150ms
```

---

## 3. Query Optimization

### The N+1 Query Problem

```typescript
// ❌ Bad: N+1 queries (1 + N additional queries)
const orders = await db.query('SELECT * FROM orders LIMIT 10');
for (const order of orders) {
    // This executes 10 separate queries!
    const items = await db.query(
        'SELECT * FROM order_items WHERE order_id = $1', 
        [order.id]
    );
}

// ✅ Good: Single query with JOIN
const ordersWithItems = await db.query(`
    SELECT o.*, oi.product_id, oi.quantity, oi.unit_price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LIMIT 10
`);

// ✅ Good: Two queries (batch approach)
const orders = await db.query('SELECT * FROM orders LIMIT 10');
const orderIds = orders.map(o => o.id);
const items = await db.query(
    'SELECT * FROM order_items WHERE order_id = ANY($1)',
    [orderIds]
);
```

### JOIN vs Multiple Queries

| Approach | Use When |
|----------|----------|
| JOIN | Related data always needed together |
| Multiple Queries | Optional/conditional data loading |
| Batch Query | Loading many entities at once |

### Optimizing WHERE Clauses

```sql
-- ❌ Bad: Function on indexed column (can't use index)
SELECT * FROM products WHERE LOWER(name) = 'laptop';

-- ✅ Good: Use functional index or case-insensitive collation
CREATE INDEX idx_products_name_lower ON products(LOWER(name));

-- ❌ Bad: Leading wildcard (can't use index)
SELECT * FROM products WHERE name LIKE '%laptop%';

-- ✅ Good: Use full-text search for pattern matching
SELECT * FROM products 
WHERE to_tsvector('english', name) @@ to_tsquery('laptop');
```

### Efficient Pagination

```sql
-- ❌ Bad: OFFSET for large datasets (scans all skipped rows)
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 100000;

-- ✅ Good: Cursor-based pagination (keyset)
SELECT * FROM products 
WHERE id > 100000  -- Last seen ID
ORDER BY id 
LIMIT 20;
```

---

## 4. Transactions

### ACID Properties

| Property | Description | Example |
|----------|-------------|---------|
| **A**tomicity | All or nothing | Transfer money: debit AND credit must both succeed |
| **C**onsistency | Valid state before and after | Account balance never negative |
| **I**solation | Concurrent transactions don't interfere | Two users buying last item |
| **D**urability | Committed data survives crashes | Data persists after power failure |

### Transaction Example

```typescript
const client = await pool.connect();

try {
    await client.query('BEGIN');
    
    // Check stock
    const { rows } = await client.query(
        'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
        [productId]
    );
    
    if (rows[0].stock < quantity) {
        throw new Error('Insufficient stock');
    }
    
    // Decrease stock
    await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [quantity, productId]
    );
    
    // Create order
    await client.query(
        'INSERT INTO orders (product_id, quantity) VALUES ($1, $2)',
        [productId, quantity]
    );
    
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

### Isolation Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance |
|-------|------------|---------------------|--------------|-------------|
| READ UNCOMMITTED | ✓ | ✓ | ✓ | Fastest |
| READ COMMITTED | ✗ | ✓ | ✓ | Fast |
| REPEATABLE READ | ✗ | ✗ | ✓ | Medium |
| SERIALIZABLE | ✗ | ✗ | ✗ | Slowest |

```sql
-- Set isolation level for transaction
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- ... your queries ...
COMMIT;
```

### Avoiding Deadlocks

```sql
-- ❌ Bad: Different lock order causes deadlock
-- Transaction 1: UPDATE A then B
-- Transaction 2: UPDATE B then A

-- ✅ Good: Consistent lock order (always A before B)
-- Transaction 1: UPDATE A then B
-- Transaction 2: UPDATE A then B
```

---

## 5. MongoDB Patterns

### Document Model vs Relational

```javascript
// Relational (normalized)
// Tables: users, addresses, orders, order_items

// MongoDB (embedded)
{
    _id: ObjectId("..."),
    name: "John Doe",
    email: "john@example.com",
    addresses: [
        { type: "home", city: "New York", zip: "10001" },
        { type: "work", city: "Boston", zip: "02101" }
    ],
    orders: [
        {
            date: ISODate("2024-01-15"),
            items: [
                { productId: "P001", quantity: 2, price: 29.99 }
            ],
            total: 59.98
        }
    ]
}
```

### Embedded vs Referenced Documents

| Pattern | Use When | Trade-offs |
|---------|----------|------------|
| **Embedded** | Data accessed together, 1:few relationship | Fast reads, larger documents |
| **Referenced** | 1:many relationship, independent access | Smaller docs, extra queries |

```javascript
// Embedded (recommended for addresses)
const userSchema = {
    name: String,
    addresses: [{
        street: String,
        city: String
    }]
};

// Referenced (recommended for orders)
const orderSchema = {
    userId: ObjectId,  // Reference to user
    items: [{ productId: ObjectId, quantity: Number }]
};
```

### Aggregation Pipeline

```javascript
// Find top 5 suppliers by total sales
db.orders.aggregate([
    // Stage 1: Unwind order items
    { $unwind: "$items" },
    
    // Stage 2: Group by supplier
    { 
        $group: {
            _id: "$items.supplierId",
            totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            orderCount: { $sum: 1 }
        }
    },
    
    // Stage 3: Sort by total sales
    { $sort: { totalSales: -1 } },
    
    // Stage 4: Limit to top 5
    { $limit: 5 },
    
    // Stage 5: Lookup supplier details
    {
        $lookup: {
            from: "suppliers",
            localField: "_id",
            foreignField: "_id",
            as: "supplier"
        }
    },
    
    // Stage 6: Project final shape
    {
        $project: {
            supplierName: { $arrayElemAt: ["$supplier.name", 0] },
            totalSales: 1,
            orderCount: 1
        }
    }
]);
```

---

## 6. NoSQL vs SQL Trade-offs

### When to Use SQL

| Scenario | Why SQL |
|----------|---------|
| Complex transactions | ACID guarantees |
| Complex relationships | JOINs across tables |
| Data integrity critical | Foreign key constraints |
| Reporting/analytics | SQL is powerful for aggregations |
| Schema is stable | Enforce structure |

### When to Use NoSQL

| Scenario | Why NoSQL |
|----------|-----------|
| Flexible/evolving schema | No migrations needed |
| Horizontal scaling | Built-in sharding |
| High write throughput | Eventual consistency trade-off |
| Document-like data | Natural fit for JSON |
| Caching/sessions | Redis for fast storage |

### CAP Theorem

```
       Consistency
           /\
          /  \
         /    \
        /      \
       /  CA    \
      /----------\
     / CP     AP  \
    Partition  Availability
    Tolerance
```

**You can only have 2 of 3:**
- **CA** (Consistency + Availability): Traditional RDBMS
- **CP** (Consistency + Partition Tolerance): MongoDB, Redis
- **AP** (Availability + Partition Tolerance): Cassandra, DynamoDB

### Database Selection Guide

| Use Case | Database | Reason |
|----------|----------|--------|
| E-commerce orders | PostgreSQL | Transactions, relations |
| Product catalog | MongoDB | Flexible attributes |
| User sessions | Redis | Fast, TTL support |
| Time-series metrics | InfluxDB | Optimized for time data |
| Search | Elasticsearch | Full-text search |
| Social graph | Neo4j | Relationship queries |

---

## 7. Handling 5 Million SKUs

### Schema Design for Scale

```sql
-- Use partitioning for large tables
CREATE TABLE products (
    id SERIAL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create partitions by year
CREATE TABLE products_2024 PARTITION OF products
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Essential Indexes

```sql
-- Primary search patterns
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name_gin ON products USING GIN(to_tsvector('english', name));

-- For sorting and filtering
CREATE INDEX idx_products_price_category 
ON products(category_id, price);
```

### Cursor-Based Pagination

```typescript
interface PaginationCursor {
    lastId: number;
    lastCreatedAt: Date;
}

async function getProducts(cursor?: PaginationCursor, limit = 20) {
    if (cursor) {
        return db.query(`
            SELECT * FROM products
            WHERE (created_at, id) < ($1, $2)
            ORDER BY created_at DESC, id DESC
            LIMIT $3
        `, [cursor.lastCreatedAt, cursor.lastId, limit]);
    }
    
    return db.query(`
        SELECT * FROM products
        ORDER BY created_at DESC, id DESC
        LIMIT $1
    `, [limit]);
}
```

### Caching Strategy

```typescript
// Multi-level caching
async function getProduct(id: string) {
    // L1: In-memory cache (fastest, limited size)
    let product = memoryCache.get(id);
    if (product) return product;
    
    // L2: Redis cache (fast, shared across instances)
    product = await redis.get(`product:${id}`);
    if (product) {
        memoryCache.set(id, product);
        return JSON.parse(product);
    }
    
    // L3: Database (slowest, source of truth)
    product = await db.findProduct(id);
    
    // Warm caches
    await redis.setex(`product:${id}`, 300, JSON.stringify(product));
    memoryCache.set(id, product);
    
    return product;
}
```

---

## 8. Supplier Data Management

### Supplier Schema

```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Performance metrics
    reliability_score DECIMAL(3,2) DEFAULT 0.00,  -- 0.00 to 1.00
    avg_delivery_hours INT,
    on_time_rate DECIMAL(3,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE supplier_inventory (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(id),
    product_id INT REFERENCES products(id),
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    bulk_price DECIMAL(10,2),
    bulk_threshold INT DEFAULT 100,
    
    -- Stock
    current_stock INT DEFAULT 0,
    reserved_stock INT DEFAULT 0,
    last_stock_update TIMESTAMP,
    
    -- Constraints
    UNIQUE(supplier_id, product_id)
);

-- Indexes for allocation queries
CREATE INDEX idx_supplier_inv_product ON supplier_inventory(product_id);
CREATE INDEX idx_supplier_inv_stock ON supplier_inventory(current_stock) WHERE current_stock > 0;
CREATE INDEX idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;
```

### Real-Time Stock Updates

```typescript
// Using Redis for real-time stock
async function updateStock(supplierId: number, productId: number, quantity: number) {
    const key = `stock:${supplierId}:${productId}`;
    
    // Update Redis (real-time)
    await redis.set(key, quantity);
    await redis.expire(key, 600); // 10 min TTL
    
    // Update database (persistence)
    await db.query(`
        UPDATE supplier_inventory 
        SET current_stock = $1, last_stock_update = NOW()
        WHERE supplier_id = $2 AND product_id = $3
    `, [quantity, supplierId, productId]);
    
    // Publish event for subscribers
    await redis.publish('stock-updates', JSON.stringify({
        supplierId, productId, quantity, timestamp: Date.now()
    }));
}

// Get stock (check Redis first, fallback to DB)
async function getStock(supplierId: number, productId: number) {
    const key = `stock:${supplierId}:${productId}`;
    
    let stock = await redis.get(key);
    if (stock !== null) {
        return parseInt(stock);
    }
    
    const result = await db.query(`
        SELECT current_stock FROM supplier_inventory
        WHERE supplier_id = $1 AND product_id = $2
    `, [supplierId, productId]);
    
    stock = result.rows[0]?.current_stock || 0;
    await redis.setex(key, 600, stock.toString());
    
    return stock;
}
```

### Supplier Reliability Tracking

```sql
-- Track order fulfillment
CREATE TABLE order_fulfillment (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    supplier_id INT REFERENCES suppliers(id),
    
    promised_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    
    status VARCHAR(50),  -- 'pending', 'shipped', 'delivered', 'failed'
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Update supplier reliability score (run periodically)
WITH supplier_stats AS (
    SELECT 
        supplier_id,
        COUNT(*) as total_orders,
        SUM(CASE WHEN actual_delivery <= promised_delivery THEN 1 ELSE 0 END) as on_time,
        AVG(EXTRACT(EPOCH FROM (actual_delivery - created_at)) / 3600) as avg_hours
    FROM order_fulfillment
    WHERE status = 'delivered'
    AND created_at > NOW() - INTERVAL '90 days'
    GROUP BY supplier_id
)
UPDATE suppliers s
SET 
    reliability_score = ss.on_time::DECIMAL / ss.total_orders,
    on_time_rate = ss.on_time::DECIMAL / ss.total_orders,
    avg_delivery_hours = ss.avg_hours,
    updated_at = NOW()
FROM supplier_stats ss
WHERE s.id = ss.supplier_id;
```

### Allocation Query

```sql
-- Find best supplier for a product
SELECT 
    s.id as supplier_id,
    s.name,
    si.unit_price,
    si.current_stock - si.reserved_stock as available_stock,
    s.avg_delivery_hours,
    s.reliability_score,
    -- Weighted score for allocation
    (
        (1 - (si.unit_price / MAX(si.unit_price) OVER())) * 0.25 +  -- Price score
        (si.current_stock::DECIMAL / 1000) * 0.25 +                  -- Stock score
        (1 - (s.avg_delivery_hours / 168.0)) * 0.30 +                -- Delivery score (168h = 1 week)
        s.reliability_score * 0.20                                    -- Reliability score
    ) as allocation_score
FROM suppliers s
JOIN supplier_inventory si ON s.id = si.supplier_id
WHERE si.product_id = $1
  AND si.current_stock - si.reserved_stock >= $2  -- Required quantity
  AND s.is_active = true
ORDER BY allocation_score DESC
LIMIT 1;
```
