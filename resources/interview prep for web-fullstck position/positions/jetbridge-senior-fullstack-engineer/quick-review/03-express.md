# Express.js — Quick Review

> ⏱ ~10 min read | Focus: middleware, routing, error handling, best practices

---

## Core Concept: Middleware Pipeline

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
           (logging)      (auth)         (business logic)
```

Every middleware is `(req, res, next) => { ... }`. Call `next()` to continue, or send response to stop.

---

## Basic Setup

```typescript
import express from "express";

const app = express();

// Built-in middleware
app.use(express.json());                    // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse form data

// Custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.listen(3000, () => console.log("Server on port 3000"));
```

---

## Routing

```typescript
import { Router } from "express";

const router = Router();

router.get("/users", async (req, res) => {
  const users = await db.users.findMany();
  res.json(users);
});

router.get("/users/:id", async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.post("/users", async (req, res) => {
  const user = await db.users.create(req.body);
  res.status(201).json(user);
});

router.put("/users/:id", async (req, res) => {
  const user = await db.users.update(req.params.id, req.body);
  res.json(user);
});

router.delete("/users/:id", async (req, res) => {
  await db.users.delete(req.params.id);
  res.status(204).send();
});

// Mount
app.use("/api", router);
```

---

## Error Handling (critical interview topic)

```typescript
// 1. Async wrapper — catches rejected promises
const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// 2. Use it on routes
router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
}));

// 3. Custom error class
class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

// 4. Global error middleware (4 params — Express detects this signature)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({
    error: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

---

## Common Middleware Stack

```typescript
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

app.use(helmet());                          // security headers
app.use(cors({ origin: "https://app.com" })); // CORS
app.use(morgan("combined"));               // request logging
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // rate limit
app.use(express.json({ limit: "10mb" }));  // body parser with size limit
```

**Why you need them:**
- **`helmet`**: Automatically sets secure HTTP headers (prevents XSS, hides `X-Powered-By: Express`).
- **`cors`**: Allows your separated frontend (e.g. running on localhost:3000) to safely make API requests to your backend (e.g. localhost:8080).
- **`morgan`**: Logs every incoming HTTP request to the console for debugging (`GET /api/users 200 15ms`).
- **`express-rate-limit`**: Blocks IPs that make too many requests too fast (prevents brute-force/DoS attacks).

---

## Authentication Middleware Pattern

```typescript
function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // attach user to request
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Protect routes
router.get("/profile", authenticate, asyncHandler(async (req, res) => {
  const user = await db.users.findById(req.user.id);
  res.json(user);
}));
```

---

## Request Validation (with Zod)

```typescript
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "user"]).default("user"),
});

router.post("/users", asyncHandler(async (req, res) => {
  const data = createUserSchema.parse(req.body); // throws ZodError if invalid
  const user = await db.users.create(data);
  res.status(201).json(user);
}));
```

---

## Express vs Fastify (know the tradeoff)

| | Express | Fastify |
|---|---------|---------|
| Speed | Slower | ~2x faster |
| Validation | Manual (Zod/Joi) | Built-in JSON Schema |
| Ecosystem | Huge | Growing |
| Architecture | Middleware chain | Plugin-based (encapsulated) |
| Best for | Most projects, familiarity | Performance-critical APIs |
