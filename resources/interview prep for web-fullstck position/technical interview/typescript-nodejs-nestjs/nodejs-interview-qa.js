// ============================================
// NODE.JS INTERVIEW QUESTIONS & ANSWERS
// ============================================

const EventEmitter = require('events');
const fs = require('fs');
const { Transform } = require('stream');

// ============================================
// Q1: Explain Node.js event-driven architecture
// ============================================

// Answer: Node.js uses an event loop to handle async operations.
// It's single-threaded but non-blocking through events and callbacks.

class OrderService extends EventEmitter {
  async createOrder(orderData) {
    try {
      const order = { id: Date.now(), ...orderData };
      
      // Emit event - decoupled from main logic
      this.emit('order:created', order);
      
      return order;
    } catch (error) {
      this.emit('order:error', error);
      throw error;
    }
  }
}

const service = new OrderService();

// Multiple listeners can react to same event
service.on('order:created', (order) => {
  console.log('Send confirmation email');
});

service.on('order:created', (order) => {
  console.log('Update inventory');
});

service.on('order:created', (order) => {
  console.log('Notify supplier');
});

// All three listeners fire when order is created
service.createOrder({ product: 'Laptop', quantity: 1 });


// ============================================
// Q2: When and why would you use streams in Node.js?
// ============================================

// Answer: Streams are for handling large data efficiently.
// They process data in chunks instead of loading all into memory.

// Use case 1: File upload (large files)
function uploadLargeFile(req, res) {
  // BAD - loads entire file into memory
  let data = '';
  req.on('data', chunk => {
    data += chunk; // All chunks accumulate in memory
  });
  req.on('end', () => {
    fs.writeFileSync('upload.zip', data); // OOM for large files!
  });
  
  // GOOD - stream directly to file
  const writeStream = fs.createWriteStream('upload.zip');
  req.pipe(writeStream);
  
  writeStream.on('finish', () => {
    res.send('Upload complete');
  });
  
  writeStream.on('error', (error) => {
    res.status(500).send('Upload failed');
  });
}

// Use case 2: Transform data on the fly
const csvToJsonStream = new Transform({
  transform(chunk, encoding, callback) {
    const line = chunk.toString().trim();
    const [id, name, price] = line.split(',');
    const json = JSON.stringify({ id, name, price });
    callback(null, json + '\n');
  }
});

// Read 5M products CSV, transform to JSON, write to file
// Memory usage: constant (only current chunk in memory)
fs.createReadStream('products.csv')
  .pipe(csvToJsonStream)
  .pipe(fs.createWriteStream('products.json'));


// ============================================
// Q3: How do you handle errors in Node.js applications?
// ============================================

// Answer: Multiple layers of error handling

// 1. Try/catch for async code
async function fetchProduct(id) {
  try {
    const product = await db.products.findById(id);
    if (!product) {
      throw new Error(`Product ${id} not found`);
    }
    return product;
  } catch (error) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}

// 2. Express error middleware
function errorMiddleware(err, req, res, next) {
  console.error(err.stack);
  
  // Custom errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json({ error: err.message });
  }
  
  // Default
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack
    })
  });
}

// 3. Global handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Log to monitoring service, then exit
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log and exit gracefully
  process.exit(1);
});

// 4. Async route wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/products/:id', asyncHandler(async (req, res) => {
  const product = await fetchProduct(req.params.id);
  res.json(product);
}));


// ============================================
// Q4: Explain the difference between CommonJS and ES Modules
// ============================================

// Answer:
// CommonJS: require/module.exports, synchronous, default in Node.js
// ES Modules: import/export, asynchronous, need "type": "module" in package.json

// CommonJS
const express = require('express');
const { Router } = require('express');

function createProduct(data) {
  return { id: 1, ...data };
}

module.exports = { createProduct };

// ES Modules (in .mjs file or with "type": "module")
/*
import express from 'express';
import { Router } from 'express';

export function createProduct(data) {
  return { id: 1, ...data };
}

export default class ProductService {}
*/

// Key differences:
// 1. CommonJS loads synchronously, ESM asynchronously
// 2. CommonJS can load conditionally, ESM cannot
// 3. ESM has static analysis (tree-shaking possible)


// ============================================
// Q5: How would you handle 10,000 concurrent requests in Node.js?
// ============================================

// Answer: Node.js handles concurrency well due to event loop,
// but need to avoid blocking and scale properly

// 1. Use clustering to utilize all CPU cores
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length; // 4, 8, 16 cores
  
  console.log(`Master process ${process.pid} starting ${numCPUs} workers`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // Each worker runs the server
  const app = require('express')();
  
  app.get('/products', async (req, res) => {
    const products = await db.products.find();
    res.json(products);
  });
  
  app.listen(3000);
  console.log(`Worker ${process.pid} started`);
}

// 2. Use caching to reduce database load
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 min TTL

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  
  // Check cache first
  const cached = cache.get(`product:${id}`);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from DB
  const product = await db.products.findById(id);
  
  // Cache result
  cache.set(`product:${id}`, product);
  
  res.json(product);
});

// 3. Use connection pooling
const { Pool } = require('pg');
const pool = new Pool({
  max: 20, // Max 20 concurrent DB connections
  idleTimeoutMillis: 30000
});

// 4. Offload CPU-intensive tasks to worker threads
const { Worker } = require('worker_threads');

app.post('/process-data', async (req, res) => {
  const worker = new Worker('./cpu-intensive.js', {
    workerData: req.body
  });
  
  worker.on('message', (result) => {
    res.json(result);
  });
  
  worker.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });
});


// ============================================
// Q6: What's the difference between process.nextTick() and setImmediate()?
// ============================================

// Answer:
// process.nextTick() - executes BEFORE event loop continues (high priority)
// setImmediate() - executes on NEXT event loop iteration

console.log('1');

setImmediate(() => {
  console.log('2 - setImmediate'); // Runs in next event loop
});

process.nextTick(() => {
  console.log('3 - nextTick'); // Runs before event loop continues
});

Promise.resolve().then(() => {
  console.log('4 - Promise'); // Microtask, runs after nextTick
});

console.log('5');

// Output: 1, 5, 3, 4, 2
// Order: sync → nextTick → microtasks (promises) → setImmediate


// ============================================
// Q7: How would you prevent memory leaks in Node.js?
// ============================================

// Answer: Common causes and solutions

// 1. Global variables - BAD
var globalCache = []; // Never gets garbage collected

// 2. Event listeners not removed - BAD
const emitter = new EventEmitter();
function handler() {}
emitter.on('data', handler);
// If emitter persists but we're done with it, memory leaks

// GOOD - remove listener
emitter.removeListener('data', handler);

// 3. Closures holding references - BAD
function createHandler() {
  const largeData = new Array(1000000);
  return function() {
    console.log(largeData[0]); // Keeps largeData in memory forever
  };
}

// 4. Timers not cleared - BAD
const timerId = setInterval(() => {
  // Do something
}, 1000);
// If not cleared, runs forever

// GOOD
clearInterval(timerId);

// 5. Use WeakMap for caches
const cache = new WeakMap(); // Allows garbage collection
const key = { id: 1 };
cache.set(key, someData);
// When key is no longer referenced, cache entry is GC'd


// ============================================
// Q8: Explain how you would structure a scalable Node.js application
// ============================================

// Answer: Modular architecture with clear separation of concerns

/*
project/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── middleware/      # Express middleware
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration
│   └── app.js           # Express app setup
├── tests/
└── package.json
*/

// controllers/productController.js
const productService = require('../services/productService');

exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.findById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// services/productService.js
const Product = require('../models/Product');
const cache = require('../utils/cache');

exports.findById = async (id) => {
  // Check cache
  const cached = await cache.get(`product:${id}`);
  if (cached) return cached;
  
  // Fetch from DB
  const product = await Product.findById(id);
  
  // Cache result
  await cache.set(`product:${id}`, product, 300);
  
  return product;
};

// models/Product.js
const db = require('../config/database');

class Product {
  static async findById(id) {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = Product;


// ============================================
// Q9: How do you debug performance issues in Node.js?
// ============================================

// Answer: Multiple approaches

// 1. Use built-in profiler
// Start with: node --prof app.js
// Generate readable output: node --prof-process isolate-*.log

// 2. Measure execution time
console.time('database-query');
await db.products.find();
console.timeEnd('database-query');

// 3. Monitor event loop lag
const { performance } = require('perf_hooks');

setInterval(() => {
  const start = performance.now();
  setImmediate(() => {
    const lag = performance.now() - start;
    if (lag > 10) {
      console.warn('Event loop lag:', lag, 'ms');
    }
  });
}, 1000);

// 4. Use APM tools (New Relic, Datadog, etc.)
// 5. Check memory usage
const used = process.memoryUsage();
console.log('Memory usage:', {
  rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`
});


// ============================================
// Q10: How would you implement graceful shutdown?
// ============================================

// Answer: Clean up resources before exiting

const express = require('express');
const app = express();

const server = app.listen(3000, () => {
  console.log('Server started on port 3000');
});

// Handle shutdown signals
function gracefulShutdown(signal) {
  console.log(`${signal} received, closing server gracefully...`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections
    db.close(() => {
      console.log('Database connection closed');
      
      // Exit process
      process.exit(0);
    });
  });
  
  // Force exit after timeout
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 seconds
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


// ============================================
// Q11: Explain the Node.js event loop in detail. How is it different from the browser event loop?
// ============================================

// Answer: Node.js uses libuv to implement its event loop with 6 phases.
// Each phase has a FIFO queue of callbacks to execute.

/*
   ┌───────────────────────────┐
┌─>│        timers              │  ← setTimeout, setInterval callbacks
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │     pending callbacks      │  ← I/O callbacks deferred from previous loop
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │     idle, prepare          │  ← internal use only
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │         poll               │  ← retrieve new I/O events, execute I/O callbacks
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │         check              │  ← setImmediate callbacks
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │     close callbacks        │  ← socket.on('close', ...) etc.
│  └──────────┬────────────────┘
└─────────────┘
*/

// Phase details:

// 1. Timers: Executes callbacks scheduled by setTimeout() and setInterval()
//    Timers only guarantee MINIMUM delay, not exact timing

// 2. Pending Callbacks: Executes I/O callbacks deferred to the next iteration
//    (e.g., TCP error callbacks)

// 3. Idle, Prepare: Internal use by Node.js

// 4. Poll: The most important phase!
//    - Retrieves new I/O events (file read, network, etc.)
//    - Executes I/O-related callbacks
//    - Will block here waiting for I/O if no timers are scheduled

// 5. Check: setImmediate() callbacks execute here, right after poll

// 6. Close Callbacks: socket.on('close', ...) type callbacks

// Between EACH phase, Node.js checks:
// - process.nextTick() queue (highest priority)
// - Microtask queue (Promises, queueMicrotask)

// Execution priority order:
// 1. process.nextTick() — runs before ANYTHING else between phases
// 2. Microtasks (Promise.then, queueMicrotask) — runs after nextTick
// 3. Macrotasks (setTimeout, setImmediate, I/O) — runs in their phase

console.log('1 - sync');

process.nextTick(() => {
  console.log('2 - nextTick'); // Runs first (between phases)
});

Promise.resolve().then(() => {
  console.log('3 - promise'); // Runs after nextTick
});

setTimeout(() => {
  console.log('4 - setTimeout'); // Timers phase
}, 0);

setImmediate(() => {
  console.log('5 - setImmediate'); // Check phase
});

console.log('6 - sync');

// Output: 1, 6, 2, 3, 4, 5 (4 and 5 order can vary at top level)

// Key difference: Browser vs Node.js event loop
// Browser: simpler model (macrotask → microtasks → render → repeat)
// Node.js: 6-phase loop (timers → poll → check → close → repeat)
//          plus process.nextTick() and microtask queues between phases

// Practical implications:
// - Use setImmediate() when you want to execute after I/O
// - Use process.nextTick() for critical, high-priority callbacks (use sparingly!)
// - process.nextTick() can starve I/O if called recursively (bad practice)
// - setTimeout(fn, 0) vs setImmediate: order depends on context

// Inside an I/O callback, setImmediate ALWAYS runs before setTimeout:
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  // Always: "immediate" then "timeout"
});
