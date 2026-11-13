# Fastify — Quick Review

> ⏱ ~10 min read | Focus: plugins, routing, validation, error handling, best practices

---

## Core Concept: Plugin Architecture

```
Fastify App
├── Plugin A (encapsulated scope)
│   ├── Routes
│   ├── Decorators
│   └── Hooks
├── Plugin B (separate scope)
└── Global hooks (run for everything)
```

Unlike Express's flat middleware chain, Fastify uses **encapsulated plugins**. Each plugin has its own isolated scope — decorators and hooks registered inside a plugin don't leak to other plugins.

---

## Basic Setup

```typescript
import Fastify from "fastify";

const app = Fastify({ logger: true }); // built-in logger (pino) — no need for morgan

app.get("/", async (request, reply) => {
  return { hello: "world" }; // auto-serialized to JSON
});

app.listen({ port: 3000 }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
});
```

**Key difference from Express:** Fastify has a built-in logger (`pino`) — no need for `morgan`.

---

## Routing

```typescript
import { FastifyInstance } from "fastify";

async function userRoutes(app: FastifyInstance) {
  app.get("/users", async (request, reply) => {
    const users = await db.users.findMany();
    return users; // return = auto reply with JSON
  });

  app.get("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await db.users.findById(id);
    if (!user) return reply.status(404).send({ error: "Not found" });
    return user;
  });

  app.post("/users", async (request, reply) => {
    const user = await db.users.create(request.body as any);
    return reply.status(201).send(user);
  });

  app.put("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await db.users.update(id, request.body as any);
    return user;
  });

  app.delete("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.users.delete(id);
    return reply.status(204).send();
  });
}

// Register routes as a plugin
app.register(userRoutes, { prefix: "/api" });
```

---

## Error Handling

```typescript
// 1. Custom error class (same concept as Express)
class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

// 2. Global error handler
app.setErrorHandler((error, request, reply) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  app.log.error(error);
  reply.status(statusCode).send({
    error: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// 3. Usage in routes — just throw (no asyncHandler wrapper needed!)
app.get("/users/:id", async (request, reply) => {
  const user = await db.users.findById(request.params.id);
  if (!user) throw new AppError("User not found", 404); // caught automatically
  return user;
});
```

**Key difference from Express:** No `asyncHandler` wrapper needed — Fastify natively catches async errors.

---

## Built-in JSON Schema Validation (no Zod needed)

```typescript
const createUserSchema = {
  body: {
    type: "object",
    required: ["name", "email"],
    properties: {
      name: { type: "string", minLength: 2 },
      email: { type: "string", format: "email" },
      role: { type: "string", enum: ["admin", "user"], default: "user" },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
      },
    },
  },
};

app.post("/users", { schema: createUserSchema }, async (request, reply) => {
  // request.body is already validated here
  const user = await db.users.create(request.body as any);
  return reply.status(201).send(user);
});
```

Fastify validates both **input** (body, params, query) and **output** (response serialization), which also makes responses faster.

---

## Common Plugin Stack

```typescript
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

app.register(cors, { origin: "https://app.com" });      // CORS
app.register(helmet);                                     // security headers
app.register(rateLimit, { max: 100, timeWindow: "15 min" }); // rate limit
// Logger is BUILT-IN (pino) — no need for morgan equivalent
```

**Why you need them (same purpose as Express):**
- **`@fastify/helmet`**: Sets secure HTTP headers (prevents XSS, hides server identity).
- **`@fastify/cors`**: Allows your separated frontend to safely call your API.
- **`@fastify/rate-limit`**: Blocks IPs making too many requests (brute-force/DoS protection).
- **Built-in logger (pino)**: Fastify ships with pino — the fastest Node.js logger. No extra package needed.

---

## Hooks (Lifecycle)

```typescript
// Runs before every request (like Express middleware, but more granular)
app.addHook("onRequest", async (request, reply) => {
  // Auth check, logging, etc.
  const token = request.headers.authorization?.split(" ")[1];
  if (!token) return reply.status(401).send({ error: "No token" });
});

// Runs after response is sent
app.addHook("onResponse", async (request, reply) => {
  app.log.info(`${request.method} ${request.url} → ${reply.statusCode}`);
});
```

### Hook lifecycle order:
```
onRequest → preParsing → preValidation → preHandler → handler → preSerialization → onSend → onResponse
```

---

## Authentication Plugin Pattern

```typescript
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";

// Decorator + hook pattern (replaces Express middleware)
export default fp(async function authPlugin(app: FastifyInstance) {
  // Add a "user" property to every request
  app.decorateRequest("user", null);

  app.addHook("onRequest", async (request, reply) => {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) return reply.status(401).send({ error: "No token" });

    try {
      request.user = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });
});

// Register it
app.register(authPlugin);
```

---

## Express vs Fastify — Summary

| | Express | Fastify |
|---|---------|---------|
| Speed | Slower | ~2x faster (optimized JSON serialization) |
| Validation | Manual (Zod/Joi) | Built-in JSON Schema |
| Error handling | Needs `asyncHandler` wrapper | Native async/await support |
| Logging | Manual (`morgan`) | Built-in (`pino`) |
| Architecture | Flat middleware chain | Encapsulated plugins |
| Ecosystem | Huge (most popular) | Growing fast |
| Best for | Most projects, familiarity | Performance-critical APIs, new projects |
