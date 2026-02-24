// ============================================
// NODE.JS CORE CONCEPTS - MAIN TOPICS
// ============================================

const EventEmitter = require('events');
const fs = require('fs');
const { Transform } = require('stream');

// ============================================
// 1. EVENT-DRIVEN ARCHITECTURE
// ============================================
// Node.js uses events for async, non-blocking operations

class ProductService extends EventEmitter {
  async createProduct(data) {
    try {
      // Simulate database save
      const product = { id: Date.now(), ...data };
      
      // Emit event after creation
      this.emit('product:created', product);
      
      return product;
    } catch (error) {
      this.emit('product:error', error);
      throw error;
    }
  }
  
  async updateProduct(id, data) {
    const product = { id, ...data };
    this.emit('product:updated', product);
    return product;
  }
}

// Usage
const service = new ProductService();

// Register event listeners
service.on('product:created', (product) => {
  console.log('✉️ Send email notification');
  console.log('💾 Update cache');
  console.log('📊 Log analytics event');
});

service.on('product:updated', (product) => {
  console.log('🔄 Invalidate cache for product:', product.id);
});

service.on('product:error', (error) => {
  console.error('❌ Product operation failed:', error);
});

// Trigger events
service.createProduct({ name: 'Laptop', price: 1000 });


// ============================================
// 2. STREAMS (for handling large data)
// ============================================
// Streams process data in chunks instead of loading everything into memory
// Types: Readable, Writable, Duplex, Transform

// BAD - Load entire file into memory (causes OOM for large files)
function readFileBad() {
  const data = fs.readFileSync('large-file.csv'); // Blocks and loads all
  return data;
}

// GOOD - Stream the file in chunks
function readFileGood(res) {
  const readStream = fs.createReadStream('large-file.csv');
  readStream.pipe(res); // Send chunks to response as they're read
}

// Transform stream - process data on the fly
const csvToJson = new Transform({
  transform(chunk, encoding, callback) {
    // Convert CSV row to JSON
    const row = chunk.toString().trim();
    const json = JSON.stringify({ data: row });
    callback(null, json + '\n');
  }
});

// Pipeline: Read CSV → Transform to JSON → Write to file
fs.createReadStream('products.csv')
  .pipe(csvToJson)
  .pipe(fs.createWriteStream('products.json'));

// Handle stream events
const stream = fs.createReadStream('data.txt');

stream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length, 'bytes');
});

stream.on('end', () => {
  console.log('Finished reading file');
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});


// ============================================
// 3. ERROR HANDLING
// ============================================

// Synchronous errors - use try/catch
try {
  const data = JSON.parse('invalid json');
} catch (error) {
  console.error('Parse error:', error.message);
}

// Asynchronous errors - must catch promises
async function fetchData() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    console.error('Async error:', error);
    throw error; // Re-throw or handle
  }
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Log to monitoring service (Sentry, etc.)
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log error and gracefully shutdown
  process.exit(1);
});

// Express error middleware
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    }
  });
}

// Async route wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/products/:id', asyncHandler(async (req, res) => {
  const product = await db.findProduct(req.params.id);
  if (!product) {
    throw new Error('Product not found'); // Caught by asyncHandler
  }
  res.json(product);
}));


// ============================================
// 4. MODULE SYSTEM
// ============================================

// CommonJS (default in Node.js)
// Synchronous, single export
const express = require('express');
const { Router } = require('express');

function createProduct(data) {
  return { id: 1, ...data };
}

function getProduct(id) {
  return { id, name: 'Product' };
}

module.exports = {
  createProduct,
  getProduct
};

// ES Modules (requires "type": "module" in package.json)
// Asynchronous, named/default exports
/*
import express from 'express';
import { Router } from 'express';

export function createProduct(data) {
  return { id: 1, ...data };
}

export function getProduct(id) {
  return { id, name: 'Product' };
}

export default class ProductService {
  // ...
}
*/


// ============================================
// 5. ASYNCHRONOUS PATTERNS
// ============================================

// Callbacks (old style - avoid)
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Data:', data);
});

// Promises (better)
const readFilePromise = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('file.txt', 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

// Async/await (best)
async function readFileAsync() {
  try {
    const data = await readFilePromise();
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Parallel execution
async function fetchMultipleProducts(ids) {
  // Execute all fetches in parallel
  const promises = ids.map(id => fetchProduct(id));
  const products = await Promise.all(promises);
  return products;
}

// Sequential execution
async function processProductsSequentially(ids) {
  const results = [];
  for (const id of ids) {
    const product = await fetchProduct(id); // Wait for each
    results.push(product);
  }
  return results;
}


// ============================================
// 6. NODE.JS BEST PRACTICES
// ============================================

// 1. Use environment variables
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;

// 2. Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// 3. Use async/await instead of callbacks
// BAD
db.find(query, (err, results) => {
  if (err) return handleError(err);
  process(results, (err, processed) => {
    if (err) return handleError(err);
    save(processed, (err) => {
      if (err) return handleError(err);
    });
  });
});

// GOOD
async function processData() {
  try {
    const results = await db.find(query);
    const processed = await process(results);
    await save(processed);
  } catch (error) {
    handleError(error);
  }
}

// 4. Don't block the event loop
// BAD - blocks event loop
for (let i = 0; i < 1000000000; i++) {
  // CPU-intensive work
}

// GOOD - use worker threads for CPU-intensive tasks
const { Worker } = require('worker_threads');
const worker = new Worker('./cpu-intensive-task.js');

// 5. Use connection pooling for databases
// Reuse connections instead of creating new ones
const pool = new Pool({
  host: 'localhost',
  database: 'products',
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000
});


// ============================================
// 7. FILE SYSTEM OPERATIONS
// ============================================

// Async file operations (non-blocking)
const fsPromises = require('fs').promises;

async function readFileAsync(filepath) {
  try {
    const data = await fsPromises.readFile(filepath, 'utf8');
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

async function writeFileAsync(filepath, content) {
  try {
    await fsPromises.writeFile(filepath, content);
    console.log('File written successfully');
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
}

// Check if file exists
async function fileExists(filepath) {
  try {
    await fsPromises.access(filepath);
    return true;
  } catch {
    return false;
  }
}


// ============================================
// 8. PERFORMANCE CONSIDERATIONS
// ============================================

// Use clustering for multi-core systems
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // Create worker process
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  // Worker processes run the server
  startServer();
}

// Caching with simple in-memory cache
const cache = new Map();

async function getProductWithCache(id) {
  // Check cache first
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  // Fetch from database
  const product = await db.products.findById(id);
  
  // Store in cache
  cache.set(id, product);
  
  // Set expiration (optional)
  setTimeout(() => cache.delete(id), 5 * 60 * 1000); // 5 minutes
  
  return product;
}
