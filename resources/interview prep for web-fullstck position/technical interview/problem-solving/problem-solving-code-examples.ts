// ============================================
// PROBLEM SOLVING - SUPPLIER ALLOCATION & ALGORITHMS
// ============================================

// ============================================
// Q1: Design a supplier allocation algorithm for Partao
// ============================================

// Answer: Multi-factor scoring system considering delivery time,
// stock availability, price, and supplier reliability

interface Supplier {
  id: number;
  name: string;
  stock: number;
  price: number;
  deliveryDays: number;
  reliabilityScore: number; // 0-100
  location: string;
}

interface AllocationWeights {
  price: number;
  deliveryTime: number;
  stock: number;
  reliability: number;
}

function allocateSupplier(
  suppliers: Supplier[],
  quantity: number,
  weights: AllocationWeights = {
    price: 0.3,
    deliveryTime: 0.25,
    stock: 0.2,
    reliability: 0.25
  }
): Supplier | null {
  // Filter suppliers with enough stock
  const eligibleSuppliers = suppliers.filter(s => s.stock >= quantity);
  
  if (eligibleSuppliers.length === 0) {
    return null; // No supplier can fulfill
  }
  
  // Calculate scores
  const maxPrice = Math.max(...eligibleSuppliers.map(s => s.price));
  const maxDelivery = Math.max(...eligibleSuppliers.map(s => s.deliveryDays));
  
  const scoredSuppliers = eligibleSuppliers.map(supplier => {
    // Normalize to 0-1 (lower is better for price/delivery)
    const priceScore = 1 - (supplier.price / maxPrice);
    const deliveryScore = 1 - (supplier.deliveryDays / maxDelivery);
    const stockScore = supplier.stock >= quantity * 2 ? 1 : 0.5; // Bonus for extra stock
    const reliabilityScore = supplier.reliabilityScore / 100;
    
    // Weighted total score
    const totalScore = 
      priceScore * weights.price +
      deliveryScore * weights.deliveryTime +
      stockScore * weights.stock +
      reliabilityScore * weights.reliability;
    
    return {
      supplier,
      score: totalScore
    };
  });
  
  // Sort by score descending
  scoredSuppliers.sort((a, b) => b.score - a.score);
  
  return scoredSuppliers[0].supplier;
}

// Usage
const suppliers: Supplier[] = [
  { id: 1, name: 'Supplier A', stock: 100, price: 50, deliveryDays: 3, reliabilityScore: 95, location: 'EU' },
  { id: 2, name: 'Supplier B', stock: 200, price: 45, deliveryDays: 7, reliabilityScore: 85, location: 'Asia' },
  { id: 3, name: 'Supplier C', stock: 50, price: 55, deliveryDays: 1, reliabilityScore: 90, location: 'Local' }
];

const bestSupplier = allocateSupplier(suppliers, 40);
console.log('Best supplier:', bestSupplier?.name);


// ============================================
// Q2: How would you handle real-time inventory updates for concurrent orders?
// ============================================

// Answer: Use database transactions with row-level locking

// PostgreSQL example with transactions
async function reserveStock(productId: number, supplierId: number, quantity: number) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Lock row for update
    const result = await client.query(
      `SELECT stock FROM supplier_inventory 
       WHERE product_id = $1 AND supplier_id = $2 
       FOR UPDATE`,
      [productId, supplierId]
    );
    
    const currentStock = result.rows[0]?.stock || 0;
    
    if (currentStock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    // Reserve stock
    await client.query(
      `UPDATE supplier_inventory 
       SET stock = stock - $1, reserved = reserved + $1 
       WHERE product_id = $2 AND supplier_id = $3`,
      [quantity, productId, supplierId]
    );
    
    await client.query('COMMIT');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Release reserved stock after timeout
async function releaseReservedStock(orderId: number) {
  await db.query(
    `UPDATE supplier_inventory 
     SET reserved = reserved - oi.quantity, stock = stock + oi.quantity
     FROM order_items oi
     WHERE oi.order_id = $1`,
    [orderId]
  );
}


// ============================================
// Q3: Implement debounce function from scratch
// ============================================

// Answer: Delay execution until delay ms after last call

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage: Search API only called 300ms after user stops typing
const searchProducts = debounce((query: string) => {
  console.log('Searching for:', query);
  // API call here
}, 300);

searchProducts('lap'); // Won't execute
searchProducts('lapt'); // Won't execute
searchProducts('laptop'); // Executes after 300ms


// ============================================
// Q4: Implement an LRU (Least Recently Used) cache
// ============================================

// Answer: Use Map for O(1) lookups and doubly-linked structure

class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key: K, value: V): void {
    // Remove if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Add to end
    this.cache.set(key, value);
    
    // Remove oldest if over capacity
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// Usage
const cache = new LRUCache<number, Product>(100);
cache.put(1, { id: 1, name: 'Laptop', price: 1000 });
const product = cache.get(1);


// ============================================
// Q5: How would you implement product search with filters for 5M products?
// ============================================

// Answer: Use database indexes, full-text search, and cursor pagination

// Create indexes
/*
CREATE INDEX idx_products_name ON products USING GIN(to_tsvector('english', name));
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
*/

interface SearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  brandId?: number;
  cursor?: number;
  limit?: number;
}

async function searchProducts(filters: SearchFilters) {
  const {
    query,
    minPrice,
    maxPrice,
    categoryId,
    brandId,
    cursor = 0,
    limit = 20
  } = filters;
  
  let sql = 'SELECT * FROM products WHERE id > $1';
  const params: any[] = [cursor];
  let paramIndex = 2;
  
  // Full-text search
  if (query) {
    sql += ` AND to_tsvector('english', name) @@ plainto_tsquery('english', $${paramIndex})`;
    params.push(query);
    paramIndex++;
  }
  
  // Price range
  if (minPrice !== undefined) {
    sql += ` AND price >= $${paramIndex}`;
    params.push(minPrice);
    paramIndex++;
  }
  
  if (maxPrice !== undefined) {
    sql += ` AND price <= $${paramIndex}`;
    params.push(maxPrice);
    paramIndex++;
  }
  
  // Category filter
  if (categoryId) {
    sql += ` AND category_id = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }
  
  // Brand filter
  if (brandId) {
    sql += ` AND brand_id = $${paramIndex}`;
    params.push(brandId);
    paramIndex++;
  }
  
  sql += ` ORDER BY id LIMIT $${paramIndex}`;
  params.push(limit);
  
  const results = await db.query(sql, params);
  
  return {
    data: results.rows,
    nextCursor: results.rows.length === limit 
      ? results.rows[results.rows.length - 1].id 
      : null
  };
}


// ============================================
// Q6: Implement deep clone function
// ============================================

// Answer: Recursively clone all nested properties

function deepClone<T>(obj: T): T {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  // Handle Object
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// Test
const original = {
  id: 1,
  details: {
    prices: [100, 200, 300],
    metadata: { created: new Date() }
  }
};

const clone = deepClone(original);
clone.details.prices.push(400);
console.log(original.details.prices); // [100, 200, 300] - unchanged


// ============================================
// Q7: Flatten nested array without using flat()
// ============================================

// Answer: Recursive approach

function flatten<T>(arr: any[]): T[] {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return acc.concat(flatten(item));
    }
    return acc.concat(item);
  }, []);
}

// Test
const nested = [1, [2, [3, [4, 5]], 6], 7];
console.log(flatten(nested)); // [1, 2, 3, 4, 5, 6, 7]


// ============================================
// Q8: Implement Promise.all from scratch
// ============================================

// Answer: Wait for all promises, fail fast on first error

function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results: T[] = [];
    let completed = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;
          
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject); // Fail fast
    });
  });
}

// Test
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results); // [1, 2, 3]
});


// ============================================
// Q9: How would you optimize a slow database query?
// ============================================

// Answer: Use EXPLAIN ANALYZE, add indexes, optimize joins

// Step 1: Identify slow query with EXPLAIN ANALYZE
/*
EXPLAIN ANALYZE
SELECT p.name, c.name as category, b.name as brand
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.price > 100
ORDER BY p.created_at DESC
LIMIT 20;
*/

// Step 2: Add indexes
/*
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
*/

// Step 3: Optimize query
// BAD: N+1 problem
async function getProductsWithDetails() {
  const products = await db.query('SELECT * FROM products LIMIT 20');
  
  for (const product of products) {
    product.category = await db.query('SELECT * FROM categories WHERE id = $1', [product.category_id]);
    product.brand = await db.query('SELECT * FROM brands WHERE id = $1', [product.brand_id]);
  }
  
  return products;
}

// GOOD: Single query with JOINs
async function getProductsWithDetailsOptimized() {
  const result = await db.query(`
    SELECT 
      p.*,
      c.name as category_name,
      b.name as brand_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LIMIT 20
  `);
  
  return result.rows;
}


// ============================================
// Q10: Design a competitor price monitoring system
// ============================================

// Answer: Web scraping service with rate limiting, caching, and alerts

interface CompetitorPrice {
  competitorId: number;
  productSKU: string;
  price: number;
  currency: string;
  checkedAt: Date;
}

class PriceMonitoringService {
  private queue: string[] = [];
  private rateLimit = 10; // Requests per second
  
  async monitorPrices(productSKUs: string[]) {
    // Add to queue
    this.queue.push(...productSKUs);
    
    // Process queue with rate limiting
    await this.processQueue();
  }
  
  private async processQueue() {
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.rateLimit);
      
      // Scrape in parallel (up to rate limit)
      await Promise.all(
        batch.map(sku => this.scrapePrice(sku))
      );
      
      // Wait 1 second before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  private async scrapePrice(sku: string) {
    try {
      // Scrape competitor website
      const price = await this.fetchCompetitorPrice(sku);
      
      // Store in database
      await db.competitorPrices.insert({
        productSKU: sku,
        price,
        checkedAt: new Date()
      });
      
      // Check if price changed
      const previousPrice = await db.competitorPrices.getPrevious(sku);
      
      if (previousPrice && Math.abs(price - previousPrice) > 5) {
        // Alert on significant price change
        await this.sendPriceAlert(sku, previousPrice, price);
      }
    } catch (error) {
      console.error(`Failed to scrape ${sku}:`, error);
    }
  }
  
  private async fetchCompetitorPrice(sku: string): Promise<number> {
    // Web scraping logic here
    return 99.99;
  }
  
  private async sendPriceAlert(sku: string, oldPrice: number, newPrice: number) {
    console.log(`Price alert: ${sku} changed from $${oldPrice} to $${newPrice}`);
    // Send notification
  }
}

// Usage
const monitor = new PriceMonitoringService();
await monitor.monitorPrices(['SKU001', 'SKU002', /* ... 5M SKUs */]);
