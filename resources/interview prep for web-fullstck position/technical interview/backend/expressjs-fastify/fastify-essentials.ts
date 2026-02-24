// ============================================
// FASTIFY ESSENTIALS - INTERVIEW CHEATSHEET
// ============================================

import Fastify from 'fastify';
const fastify = Fastify({ logger: true });

// --- 1. BASIC ROUTE & SCHEMA VALIDATION ---
// Fastify uses JSON Schema for validation (Very Fast!)
fastify.get('/items/:id', {
  schema: {
    params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
    },
    response: {
      200: {
        type: 'object',
        properties: { 
            id: { type: 'integer' },
            name: { type: 'string' } 
        }
      }
    }
  }
}, async (request, reply) => {
  // Request is typed & validated
  return { id: Number(request.params.id), name: 'Item' };
});

// --- 2. PLUGINS (Everything is a plugin) ---
// Plugins encapsulate features, routes, and decorators
async function userRoutes(fastify, options) {
  fastify.get('/', async () => [{ id: 1, name: 'User' }]);
}
fastify.register(userRoutes, { prefix: '/users' });

// --- 3. HOOKS (Lifecycle) ---
// Order: onRequest -> preHandler -> Handler -> onSend -> onResponse

// Global Hook
fastify.addHook('onRequest', async (req, reply) => {
  console.log('Request received:', req.url);
});

// Auth Hook Example
fastify.addHook('preHandler', async (req, reply) => {
  if (!req.headers.authorization) {
    throw new Error('Unauthorized'); // Sends 500 (or 401 if handled)
  }
});

// --- 4. DECORATORS ---
// Extend Fastify instance, Request, or Reply
fastify.decorate('db', {
  find: () => 'db result'
});
// Usage: fastify.db.find()

// --- 5. ERROR HANDLING ---
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: 'Something went wrong' });
});

// --- 6. EXPRESS VS FASTIFY ---
/*
- Fastify is structured around Plugins and Hooks.
- Fastify is "Schema First" (Validation built-in, impacts perf).
- Faster serialization logic.
- Express is "Middleware First" (Linear chain).
*/

// --- START ---
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    process.exit(1);
  }
};
start();
