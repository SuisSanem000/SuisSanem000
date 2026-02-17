// ============================================
// FASTIFY & EXPRESS - MAIN CONCEPTS
// ============================================

import Fastify from 'fastify';
import express from 'express';

// ============================================
// 1. FASTIFY BASICS
// ============================================

const fastify = Fastify({
  logger: true // Built-in logging
});

// Route with schema validation
fastify.get('/products/:id', {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'number' }
      },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          price: { type: 'number' }
        }
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { id } = request.params;
  
  const product = await db.products.findById(id);
  
  if (!product) {
    return reply.code(404).send({ error: 'Product not found' });
  }
  
  return product;
});

// POST with body validation
fastify.post('/products', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'price'],
      properties: {
        name: { type: 'string', minLength: 1 },
        price: { type: 'number', minimum: 0 },
        stock: { type: 'number', minimum: 0 }
      }
    }
  }
}, async (request, reply) => {
  const product = await db.products.create(request.body);
  return reply.code(201).send(product);
});


// ============================================
// 2. FASTIFY PLUGINS
// ============================================

// Plugin for product routes
async function productRoutes(fastify, options) {
  fastify.get('/products', async (request, reply) => {
    const products = await db.products.findAll();
    return products;
  });
  
  fastify.get('/products/:id', async (request, reply) => {
    const product = await db.products.findById(request.params.id);
    return product || reply.code(404).send({ error: 'Not found' });
  });
  
  fastify.post('/products', async (request, reply) => {
    const product = await db.products.create(request.body);
    return reply.code(201).send(product);
  });
}

// Register plugin with prefix
fastify.register(productRoutes, { prefix: '/api' });


// ============================================
// 3. FASTIFY HOOKS
// ============================================

// onRequest - runs first
fastify.addHook('onRequest', async (request, reply) => {
  request.startTime = Date.now();
  console.log(`[${request.method}] ${request.url}`);
});

// preValidation - before validation
fastify.addHook('preValidation', async (request, reply) => {
  const token = request.headers.authorization;
  
  if (!token) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
  
  // Verify token
  const user = await verifyToken(token);
  request.user = user; // Attach user to request
});

// preHandler - before route handler
fastify.addHook('preHandler', async (request, reply) => {
  // Check permissions
  if (request.user.role !== 'admin') {
    reply.code(403).send({ error: 'Forbidden' });
  }
});

// onSend - transform response
fastify.addHook('onSend', async (request, reply, payload) => {
  // Add custom header
  reply.header('X-Response-Time', Date.now() - request.startTime);
  return payload;
});

// onResponse - after response sent (logging)
fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - request.startTime;
  console.log(`Response sent in ${duration}ms`);
});


// ============================================
// 4. FASTIFY ERROR HANDLING
// ============================================

// Custom error handler
fastify.setErrorHandler((error, request, reply) => {
  // Log error
  fastify.log.error(error);
  
  // Validation error
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation failed',
      details: error.validation
    });
  }
  
  // Custom error
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.message
    });
  }
  
  // Default error
  reply.status(500).send({
    error: 'Internal server error'
  });
});

// Throwing errors
fastify.get('/products/:id', async (request, reply) => {
  const product = await db.products.findById(request.params.id);
  
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  
  return product;
});


// ============================================
// 5. RESTful API DESIGN
// ============================================

// GET /api/products - List all (with pagination)
fastify.get('/api/products', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        sort: { type: 'string', enum: ['name', 'price', 'created_at'] }
      }
    }
  }
}, async (request, reply) => {
  const { page, limit, sort } = request.query;
  const offset = (page - 1) * limit;
  
  const products = await db.products
    .findAll()
    .limit(limit)
    .offset(offset)
    .orderBy(sort || 'created_at', 'desc');
  
  const total = await db.products.count();
  
  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
});

// GET /api/products/:id - Get single
fastify.get('/api/products/:id', async (request, reply) => {
  const product = await db.products.findById(request.params.id);
  
  if (!product) {
    return reply.code(404).send({ error: 'Product not found' });
  }
  
  return product;
});

// POST /api/products - Create
fastify.post('/api/products', async (request, reply) => {
  const product = await db.products.create(request.body);
  return reply.code(201).send(product);
});

// PATCH /api/products/:id - Update
fastify.patch('/api/products/:id', async (request, reply) => {
  const product = await db.products.update(request.params.id, request.body);
  
  if (!product) {
    return reply.code(404).send({ error: 'Product not found' });
  }
  
  return product;
});

// DELETE /api/products/:id - Delete
fastify.delete('/api/products/:id', async (request, reply) => {
  await db.products.delete(request.params.id);
  return reply.code(204).send();
});


// ============================================
// 6. PAGINATION STRATEGIES
// ============================================

// Offset pagination (simple but slow for large datasets)
fastify.get('/api/products', async (request, reply) => {
  const { page = 1, limit = 20 } = request.query;
  const offset = (page - 1) * limit;
  
  const products = await db.query(`
    SELECT * FROM products
    ORDER BY id
    LIMIT ${limit} OFFSET ${offset}
  `);
  
  // Problem: OFFSET 2000000 skips 2M rows! Very slow!
  
  return products;
});

// Cursor-based pagination (fast for any size)
fastify.get('/api/products', async (request, reply) => {
  const { cursor = 0, limit = 20 } = request.query;
  
  const products = await db.query(`
    SELECT * FROM products
    WHERE id > ${cursor}
    ORDER BY id
    LIMIT ${limit}
  `);
  
  const nextCursor = products.length === limit 
    ? products[products.length - 1].id
    : null;
  
  return {
    data: products,
    nextCursor
  };
});


// ============================================
// 7. EXPRESS BASICS (for comparison)
// ============================================

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
app.get('/products/:id', async (req, res, next) => {
  try {
    const product = await db.products.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Error middleware (4 parameters)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});


// ============================================
// 8. FASTIFY VS EXPRESS
// ============================================

/*
FASTIFY:
+ Faster (~2x performance)
+ Built-in schema validation (JSON Schema)
+ Async/await first
+ Better TypeScript support
+ Plugin architecture

EXPRESS:
+ More mature ecosystem
+ Larger community
+ More middleware options
+ Simpler learning curve

When to use Fastify:
- New projects
- Performance is critical
- Need schema validation
- TypeScript projects

When to use Express:
- Team already knows Express
- Need specific middleware
- Rapid prototyping
*/


// ============================================
// 9. RATE LIMITING
// ============================================

// Fastify rate limit plugin
import rateLimit from '@fastify/rate-limit';

await fastify.register(rateLimit, {
  max: 100, // Max requests
  timeWindow: '1 minute' // Per time window
});

// Per-route rate limit
fastify.get('/api/products', {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute'
    }
  }
}, async (request, reply) => {
  // ...
});


// ============================================
// 10. CORS
// ============================================

import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: 'https://partao.com',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
});
