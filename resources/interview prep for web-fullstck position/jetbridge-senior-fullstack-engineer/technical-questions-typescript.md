# Technical Questions: TypeScript / Node.js / React (10 Questions)

> **JetBridge – Senior Fullstack Engineer (TypeScript)**
> Focus: Advanced types, async patterns, generics, React enterprise patterns, Node.js best practices

---

## Q1. Explain and implement TypeScript's conditional types with `infer`. How would you build a utility that deeply unwraps a Promise type?

**Why asked:** Tests understanding of advanced type-level programming — critical for building type-safe SDKs and API layers at scale.

**Answer:**

Conditional types let you branch at the type level. `infer` captures a type variable inside a conditional.

```typescript
// Deeply unwraps nested Promises: Promise<Promise<string>> → string
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;

// Usage
type A = DeepAwaited<Promise<Promise<number>>>; // number
type B = DeepAwaited<string>;                   // string

// Practical: Extract return types from async service functions
type ServiceMethods = {
  getUser: () => Promise<{ id: string; name: string }>;
  getOrders: () => Promise<Promise<Order[]>>;
};

type UnwrappedReturns = {
  [K in keyof ServiceMethods]: DeepAwaited<ReturnType<ServiceMethods[K]>>;
};
// { getUser: { id: string; name: string }; getOrders: Order[] }
```

**Key points:**
- `infer` only works inside the `extends` clause of a conditional type
- Recursive conditional types (like `DeepAwaited`) are supported since TS 4.1
- The built-in `Awaited<T>` (TS 4.5+) does exactly this — know it exists but be able to build it

---

## Q2. How do you implement a type-safe event emitter in TypeScript using generics and mapped types?

**Why asked:** Tests generic constraints, mapped types, and real-world application — event systems are core to Node.js and React architectures.

**Answer:**

```typescript
type EventMap = Record<string, unknown[]>;

class TypedEventEmitter<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(
    event: K,
    handler: (...args: Events[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }
}

// Usage: fully type-safe events
interface AppEvents {
  userLoggedIn: [userId: string, timestamp: number];
  orderPlaced: [orderId: string, total: number, items: string[]];
  error: [error: Error];
}

const bus = new TypedEventEmitter<AppEvents>();

bus.on("userLoggedIn", (userId, timestamp) => {
  // userId: string, timestamp: number — fully inferred
  console.log(`User ${userId} logged in at ${timestamp}`);
});

// TS error: Argument of type 'number' is not assignable to 'string'
// bus.emit("userLoggedIn", 123, Date.now());
```

**Key points:**
- `Events extends EventMap` constrains the generic to valid event shapes
- Labeled tuple elements (`[userId: string]`) improve DX via named parameters
- Return cleanup function from `on()` — mirrors React `useEffect` pattern

---

## Q3. Implement robust error handling for a Node.js/TypeScript REST API using discriminated unions (no exceptions for control flow).

**Why asked:** Tests coding philosophy — JetBridge builds production SaaS; exception-based control flow is fragile. Discriminated unions are idiomatic TS.

**Answer:**

```typescript
// Result type — discriminated union
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Domain errors as a union
type AppError =
  | { code: "NOT_FOUND"; resource: string; id: string }
  | { code: "VALIDATION"; field: string; message: string }
  | { code: "UNAUTHORIZED"; reason: string }
  | { code: "INTERNAL"; cause: Error };

// Service layer returns Result, never throws
async function getUserById(
  id: string
): Promise<Result<User, AppError>> {
  if (!isValidUUID(id)) {
    return {
      success: false,
      error: { code: "VALIDATION", field: "id", message: "Invalid UUID" },
    };
  }

  const user = await db.users.findUnique({ where: { id } });

  if (!user) {
    return {
      success: false,
      error: { code: "NOT_FOUND", resource: "User", id },
    };
  }

  return { success: true, data: user };
}

// Controller: exhaustive error mapping
async function handleGetUser(req: Request, res: Response) {
  const result = await getUserById(req.params.id);

  if (result.success) {
    return res.json(result.data);
  }

  // Exhaustive switch — TS ensures all cases handled
  switch (result.error.code) {
    case "NOT_FOUND":
      return res.status(404).json({ message: `${result.error.resource} not found` });
    case "VALIDATION":
      return res.status(400).json({ message: result.error.message });
    case "UNAUTHORIZED":
      return res.status(401).json({ message: result.error.reason });
    case "INTERNAL":
      console.error(result.error.cause);
      return res.status(500).json({ message: "Internal server error" });
    default:
      const _exhaustive: never = result.error;
      return res.status(500).json({ message: "Unknown error" });
  }
}
```

**Key points:**
- `never` in default branch ensures exhaustive handling — adding a new error code causes compile error
- No `try/catch` for business logic — exceptions only for truly unexpected failures
- Result pattern composes well: `map`, `flatMap` can be added for chaining

---

## Q4. How does TypeScript's type narrowing work? Demonstrate narrowing with type guards, `in` operator, and assertion functions.

**Why asked:** Type narrowing is fundamental to writing safe TS code — tests whether candidate goes beyond `as` type assertions.

**Answer:**

```typescript
// 1. typeof guard
function padValue(value: string | number): string {
  if (typeof value === "string") {
    return value.padStart(10, " "); // TS knows: string
  }
  return value.toFixed(2); // TS knows: number
}

// 2. Custom type guard (type predicate)
interface ApiError {
  statusCode: number;
  message: string;
  retryable: boolean;
}

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as ApiError).statusCode === "number"
  );
}

// 3. `in` operator narrowing
interface S3Object { bucket: string; key: string }
interface LocalFile { path: string }
type FileSource = S3Object | LocalFile;

function getPath(source: FileSource): string {
  if ("bucket" in source) {
    return `s3://${source.bucket}/${source.key}`; // narrowed to S3Object
  }
  return source.path; // narrowed to LocalFile
}

// 4. Assertion function (asserts condition)
function assertDefined<T>(
  val: T | null | undefined,
  name: string
): asserts val is T {
  if (val == null) {
    throw new Error(`Expected ${name} to be defined`);
  }
}

// Usage
function processConfig(config: AppConfig | undefined) {
  assertDefined(config, "config");
  // After assertion: config is AppConfig (not undefined)
  console.log(config.databaseUrl);
}
```

**Key points:**
- Prefer `is` guards over type assertions (`as`) — they're checked at runtime
- `asserts` functions narrow in the current scope after the call
- `in` operator is cleaner than `hasOwnProperty` for discriminating unions

---

## Q5. Design a generic repository pattern in TypeScript for a multi-table database layer.

**Why asked:** Tests ability to design reusable abstractions — generic repositories are fundamental for enterprise backends with PostgreSQL (JetBridge stack).

**Answer:**

```typescript
// Base entity contract
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Query options — type-safe filtering
type WhereClause<T> = Partial<{
  [K in keyof T]: T[K] | { $in: T[K][] } | { $gt: T[K] } | { $lt: T[K] };
}>;

interface QueryOptions<T> {
  where?: WhereClause<T>;
  orderBy?: { field: keyof T; direction: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

// Generic repository interface
interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findMany(options?: QueryOptions<T>): Promise<T[]>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T>;
  delete(id: string): Promise<void>;
  count(where?: WhereClause<T>): Promise<number>;
}

// Concrete PostgreSQL implementation
class PgRepository<T extends BaseEntity> implements Repository<T> {
  constructor(
    private pool: Pool,
    private tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return (rows[0] as T) ?? null;
  }

  async findMany(options?: QueryOptions<T>): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: unknown[] = [];

    if (options?.where) {
      const conditions = Object.entries(options.where).map(([key, val], i) => {
        params.push(val);
        return `${key} = $${i + 1}`;
      });
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (options?.orderBy) {
      query += ` ORDER BY ${String(options.orderBy.field)} ${options.orderBy.direction}`;
    }

    if (options?.limit) {
      params.push(options.limit);
      query += ` LIMIT $${params.length}`;
    }

    const { rows } = await this.pool.query(query, params);
    return rows as T[];
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const id = crypto.randomUUID();
    const now = new Date();
    const full = { ...data, id, createdAt: now, updatedAt: now };
    const keys = Object.keys(full);
    const values = Object.values(full);
    const placeholders = keys.map((_, i) => `$${i + 1}`);

    const { rows } = await this.pool.query(
      `INSERT INTO ${this.tableName} (${keys.join(", ")})
       VALUES (${placeholders.join(", ")}) RETURNING *`,
      values
    );
    return rows[0] as T;
  }

  // update, delete, count follow same pattern...
  async update(id: string, data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T> {
    const entries = Object.entries(data);
    const sets = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = [...entries.map(([, v]) => v), new Date(), id];

    const { rows } = await this.pool.query(
      `UPDATE ${this.tableName}
       SET ${sets.join(", ")}, "updatedAt" = $${entries.length + 1}
       WHERE id = $${entries.length + 2} RETURNING *`,
      values
    );
    return rows[0] as T;
  }

  async delete(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  async count(where?: WhereClause<T>): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.tableName}`;
    const params: unknown[] = [];
    if (where) {
      const conditions = Object.entries(where).map(([key, val], i) => {
        params.push(val);
        return `${key} = $${i + 1}`;
      });
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    const { rows } = await this.pool.query(query, params);
    return parseInt(rows[0].count, 10);
  }
}

// Usage with domain entities
interface User extends BaseEntity {
  email: string;
  name: string;
  role: "admin" | "user";
}

const userRepo = new PgRepository<User>(pool, "users");
const admins = await userRepo.findMany({
  where: { role: "admin" },
  orderBy: { field: "createdAt", direction: "desc" },
  limit: 10,
});
```

---

## Q6. Explain and demonstrate async concurrency patterns in Node.js: `Promise.all` vs `Promise.allSettled` vs `Promise.race`, and implement a rate-limited parallel executor.

**Why asked:** Cloud-native SaaS hits external APIs constantly — understanding concurrency and rate limiting is essential.

**Answer:**

```typescript
// Promise.all — fails fast on first rejection
const [users, orders] = await Promise.all([
  fetchUsers(),   // If this fails, orders is NOT awaited
  fetchOrders(),
]);

// Promise.allSettled — always waits for all, never rejects
const results = await Promise.allSettled([
  uploadToS3(file1),
  uploadToS3(file2),
  uploadToS3(file3),
]);
const failed = results.filter(
  (r): r is PromiseRejectedResult => r.status === "rejected"
);
if (failed.length > 0) {
  console.error("Some uploads failed:", failed.map((f) => f.reason));
}

// Promise.race — first to settle wins (timeout pattern)
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// Rate-limited parallel executor — process N items with max concurrency
async function parallelLimit<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing = new Set<Promise<void>>();

  for (const [index, item] of items.entries()) {
    const p = fn(item).then((result) => {
      results[index] = result;
    });

    const tracked = p.then(() => executing.delete(tracked));
    executing.add(tracked);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

// Usage: upload 100 files, max 5 concurrent
const uploadResults = await parallelLimit(files, 5, async (file) => {
  return s3Client.send(new PutObjectCommand({
    Bucket: "my-bucket",
    Key: file.name,
    Body: file.content,
  }));
});
```

**Key points:**
- `Promise.all` for dependent-on-all; `allSettled` for partial-failure tolerance
- Rate limiting prevents AWS throttling (Lambda concurrency, S3 request rates)
- The `parallelLimit` pattern is a common interview question — know it cold

---

## Q7. How do you implement custom React hooks with proper TypeScript generics? Build a `useFetch` hook with caching, error handling, and abort support.

**Why asked:** React hooks are core to enterprise UIs — tests hook composition, generics, cleanup, and real-world concerns like race conditions.

**Answer:**

```typescript
import { useState, useEffect, useRef, useCallback } from "react";

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseFetchOptions {
  enabled?: boolean;
  cacheKey?: string;
  staleTime?: number; // ms before refetch
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): FetchState<T> & { refetch: () => void } {
  const { enabled = true, cacheKey, staleTime = 30_000 } = options;
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache
    const key = cacheKey ?? url;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setState({ data: cached.data as T, error: null, isLoading: false });
      return;
    }

    // Abort previous request (prevents race conditions)
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data: T = await res.json();

      // Only update if not aborted
      if (!controller.signal.aborted) {
        cache.set(key, { data, timestamp: Date.now() });
        setState({ data, error: null, isLoading: false });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setState({ data: null, error: err as Error, isLoading: false });
      }
    }
  }, [url, cacheKey, staleTime]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    return () => abortRef.current?.abort(); // Cleanup on unmount
  }, [enabled, fetchData]);

  return { ...state, refetch: fetchData };
}

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, refetch } = useFetch<User>(
    `/api/users/${userId}`,
    { staleTime: 60_000 }
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorBanner error={error} onRetry={refetch} />;
  if (!data) return null;

  return <ProfileCard user={data} />;
}
```

**Key points:**
- `AbortController` prevents race conditions on rapid URL changes
- Cache with `staleTime` avoids unnecessary re-fetches
- Generic `T` flows from usage site — no manual type annotation needed
- Cleanup function in `useEffect` prevents state updates on unmounted components

---

## Q8. Explain TypeScript's `satisfies` operator, template literal types, and `const` assertions. When would you use each in production?

**Why asked:** Tests awareness of modern TS features (4.9+) — distinguishes senior engineers who keep current.

**Answer:**

```typescript
// 1. `satisfies` (TS 4.9) — validates type WITHOUT widening
const routes = {
  home: "/",
  users: "/users",
  userDetail: "/users/:id",
} satisfies Record<string, string>;
// Type is preserved: routes.home is "/" (literal), not string
// But TS still validates it satisfies Record<string, string>

// Without satisfies:
const routesWide: Record<string, string> = { home: "/" };
// routesWide.home is `string` — literal type lost

// 2. Template literal types — string pattern matching at type level
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type APIRoute = `/api/${string}`;
type Endpoint = `${HTTPMethod} ${APIRoute}`;

// "GET /api/users" ✅
// "PATCH /api/users" ❌ — not in HTTPMethod

// Practical: environment variable keys
type EnvKey = `${Uppercase<string>}_${Uppercase<string>}`;

// 3. `as const` — makes everything readonly + literal
const CONFIG = {
  maxRetries: 3,
  timeout: 5000,
  regions: ["us-east-1", "eu-west-1"],
} as const;
// CONFIG.maxRetries is 3, not number
// CONFIG.regions is readonly ["us-east-1", "eu-west-1"], not string[]

// Combined: type-safe route config
const apiRoutes = {
  getUsers: { method: "GET", path: "/api/users" },
  createUser: { method: "POST", path: "/api/users" },
} as const satisfies Record<string, { method: HTTPMethod; path: APIRoute }>;

type RouteNames = keyof typeof apiRoutes; // "getUsers" | "createUser"
```

**Key points:**
- `satisfies` = validation without type widening — use for configs and constants
- Template literals = type-safe string patterns — use for API routes, env vars, event names
- `as const` = deep readonly + literal inference — use for enums-as-objects and fixed configs

---

## Q9. How do you handle dependency injection in a Node.js/TypeScript backend without a framework like NestJS?

**Why asked:** Tests architecture skills — DI is critical for testable, maintainable backends. Not every project uses NestJS.

**Answer:**

```typescript
// Lightweight DI using factory functions + interfaces

// 1. Define interfaces (contracts)
interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, error?: Error): void;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}

interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

// 2. Create concrete implementations
class PinoLogger implements Logger {
  private logger = pino();
  info(msg: string, meta?: Record<string, unknown>) {
    this.logger.info(meta, msg);
  }
  error(msg: string, error?: Error) {
    this.logger.error({ err: error }, msg);
  }
}

// 3. Wire dependencies via factory
interface ServiceContainer {
  logger: Logger;
  userRepo: UserRepository;
  emailService: EmailService;
}

function createContainer(config: AppConfig): ServiceContainer {
  const logger = new PinoLogger();
  const pool = new Pool({ connectionString: config.databaseUrl });
  const userRepo = new PgUserRepository(pool, logger);
  const emailService = new SESEmailService(config.sesRegion, logger);

  return { logger, userRepo, emailService };
}

// 4. Services receive dependencies through constructor
class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}

  async registerUser(dto: CreateUserDTO): Promise<Result<User, AppError>> {
    this.logger.info("Registering user", { email: dto.email });
    const user = await this.userRepo.create(dto);
    await this.emailService.send(user.email, "Welcome!", "...");
    return { success: true, data: user };
  }
}

// 5. Easy to test — inject mocks
const mockRepo: UserRepository = {
  findById: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue({ id: "1", email: "test@test.com" }),
};
const service = new UserService(mockRepo, mockEmail, mockLogger);
```

**Key points:**
- No decorators or reflection needed — pure TypeScript
- Factory function = composition root (single place to wire dependencies)
- Interfaces enable swapping implementations (Postgres ↔ DynamoDB, SES ↔ SendGrid)
- Testing becomes trivial with dependency injection

---

## Q10. Build a React `useReducer`-based state machine for a multi-step form with validation, persistence, and undo.

**Why asked:** Tests complex state management in React — enterprise UIs at JetBridge need structured state beyond simple `useState`.

**Answer:**

```typescript
// State machine for multi-step onboarding form

type FormStep = "personal" | "company" | "billing" | "review";

interface FormState {
  currentStep: FormStep;
  data: {
    personal: { name: string; email: string };
    company: { companyName: string; size: string };
    billing: { plan: string; cardLast4: string };
  };
  errors: Partial<Record<FormStep, Record<string, string>>>;
  history: FormState[]; // for undo
  isSubmitting: boolean;
}

type FormAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: FormStep }
  | { type: "UPDATE_FIELD"; step: FormStep; field: string; value: string }
  | { type: "SET_ERRORS"; step: FormStep; errors: Record<string, string> }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "UNDO" };

const STEP_ORDER: FormStep[] = ["personal", "company", "billing", "review"];

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "NEXT_STEP": {
      const idx = STEP_ORDER.indexOf(state.currentStep);
      if (idx >= STEP_ORDER.length - 1) return state;
      return {
        ...state,
        currentStep: STEP_ORDER[idx + 1],
        history: [...state.history, state], // save for undo
      };
    }
    case "PREV_STEP": {
      const idx = STEP_ORDER.indexOf(state.currentStep);
      if (idx <= 0) return state;
      return { ...state, currentStep: STEP_ORDER[idx - 1] };
    }
    case "GO_TO_STEP":
      return { ...state, currentStep: action.step };
    case "UPDATE_FIELD":
      return {
        ...state,
        data: {
          ...state.data,
          [action.step]: {
            ...state.data[action.step],
            [action.field]: action.value,
          },
        },
        errors: { ...state.errors, [action.step]: undefined }, // clear step errors
      };
    case "SET_ERRORS":
      return {
        ...state,
        errors: { ...state.errors, [action.step]: action.errors },
      };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true };
    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitting: false };
    case "UNDO": {
      const prev = state.history[state.history.length - 1];
      if (!prev) return state;
      return prev; // restore full previous state
    }
    default:
      return state;
  }
}

// Hook wrapping reducer + localStorage persistence
function useMultiStepForm() {
  const [state, dispatch] = useReducer(formReducer, undefined, () => {
    const saved = localStorage.getItem("onboarding-form");
    return saved ? JSON.parse(saved) : initialState;
  });

  // Persist on every change
  useEffect(() => {
    localStorage.setItem("onboarding-form", JSON.stringify(state));
  }, [state]);

  // Validation per step
  const validateStep = useCallback(
    (step: FormStep): boolean => {
      const validators: Record<FormStep, () => Record<string, string>> = {
        personal: () => {
          const errors: Record<string, string> = {};
          if (!state.data.personal.name) errors.name = "Required";
          if (!/\S+@\S+\.\S+/.test(state.data.personal.email))
            errors.email = "Invalid email";
          return errors;
        },
        company: () => {
          const errors: Record<string, string> = {};
          if (!state.data.company.companyName) errors.companyName = "Required";
          return errors;
        },
        billing: () => ({}),
        review: () => ({}),
      };

      const errors = validators[step]();
      if (Object.keys(errors).length > 0) {
        dispatch({ type: "SET_ERRORS", step, errors });
        return false;
      }
      return true;
    },
    [state.data]
  );

  const nextStep = useCallback(() => {
    if (validateStep(state.currentStep)) {
      dispatch({ type: "NEXT_STEP" });
    }
  }, [state.currentStep, validateStep]);

  return { state, dispatch, nextStep, validateStep };
}
```

**Key points:**
- Discriminated union for actions = exhaustive action handling
- `history` array enables undo without external state libraries
- Lazy initializer in `useReducer` loads from `localStorage`
- Validation runs before step transition — prevents invalid state transitions
