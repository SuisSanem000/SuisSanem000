// ============================================
// NODE.JS ESSENTIALS - INTERVIEW CHEATSHEET
// ============================================

const fs = require('fs').promises; // Use promises version
const EventEmitter = require('events');

// --- 1. EVENT EMITTER PATTERN ---
class OrderService extends EventEmitter {
  async create(order) {
    // Process order...
    this.emit('order:created', order); // Fire event
  }
}
const orders = new OrderService();
orders.on('order:created', (order) => console.log('Email sent for', order.id));
// orders.emit('error', new Error('fail')); // Always handle error events!

// --- 2. ASYNC/AWAIT & ERROR HANDLING ---
async function readFileSafe(path) {
  try {
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('File read failed:', error.message);
    throw error; // Re-throw if caller needs to know
  }
}

// Global Error Handlers (Safety Nets)
process.on('uncaughtException', (err) => {
  console.error('Crash!', err);
  process.exit(1); // Force restart
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise:', reason);
});

// --- 3. STREAMS (Memory Efficiency) ---
// Use for large files/data to avoid memory overflow
const { createReadStream, createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');

async function copyBigFile() {
  // Pipes data chunk by chunk: Source -> Dest
  await pipeline(
    createReadStream('huge-input.csv'),
    createWriteStream('output.csv')
  );
}

// --- 4. MODULE SYSTEMS ---
// CommonJS (Default)
// module.exports = { foo };
// const { foo } = require('./lib');

// ESM (Newer, "type": "module")
// export const foo = 1;
// import { foo } from './lib.js';

// --- 5. PERFORMANCE BASICS ---
// Event Loop: Single threaded, non-blocking I/O.
// Don't block it with heavy loops! Use Worker Threads.

// Worker Threads (CPU Intensive tasks)
const { Worker, isMainThread, parentPort } = require('worker_threads');
if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on('message', msg => console.log(msg));
} else {
  // Heavy computation here
  parentPort.postMessage('Done');
}

// Clustering (Multi-core utilization)
const cluster = require('cluster');
const os = require('os');
if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork()); // Fork 1 process per Core
} else {
  // Start server in worker
  require('http').createServer().listen(3000);
}
