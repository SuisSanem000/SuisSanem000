# TypeScript & JavaScript — Quick Review

> ⏱ ~25 min read | Focus: what JetBridge asks at mid-senior level

---

## JavaScript Essentials

### Event Loop

```
Call Stack → Microtasks (Promise.then, queueMicrotask) → Macrotasks (setTimeout, setImmediate)
```

- **Microtasks always run before macrotasks** between each phase
- `process.nextTick()` runs before Promise microtasks (Node.js only)
- `async/await` is syntactic sugar over Promises — `await` yields to microtask queue

**Classic Interview Question:** What is the output order?

```javascript
console.log("1");

setTimeout(() => console.log("5 (Macrotask)"), 0);

Promise.resolve().then(() => console.log("3 (Microtask - Promise)"));

queueMicrotask(() => console.log("4 (Microtask - queueMicrotask)"));

process.nextTick(() => console.log("2 (Microtask - nextTick)"));

// Output:
// 1
// 2 (Microtask - nextTick)
// 3 (Microtask - Promise)*
// 4 (Microtask - queueMicrotask)*
// 5 (Macrotask)
// *Note: Promise.then and queueMicrotask share the same queue and run in order of registration
```

### Closures

A function that remembers variables from its outer scope, even after the outer function returns.

```javascript
function createCounter() {
  let count = 0; // "closed over" — survives after createCounter returns
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}
const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
```

**Interview use:** debounce, throttle, private variables, factory functions.

### `this` Binding (4 rules, in order)

1. **`new`** → `this` = new object
2. **`.call()/.apply()/.bind()`** → `this` = first argument
3. **Method call `obj.fn()`** → `this` = obj
4. **Default** → `this` = `undefined` (strict) or `globalThis`

⚠ **Arrow functions** don't have their own `this` — they inherit from enclosing scope.

### Prototypes & Classes

```javascript
// ES6 class = syntactic sugar over prototype chain
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  speak() { return `${this.name} barks`; }
}
// Under the hood: Dog.prototype.__proto__ === Animal.prototype
```

### Promise Methods

| Method | Resolves when | Rejects when |
|--------|--------------|-------------|
| `Promise.all` | All fulfill | Any one rejects |
| `Promise.allSettled` | All settle | Never |
| `Promise.any` | First fulfills | All reject |
| `Promise.race` | First settles | If first rejects |

### Destructuring, Spread, Rest

```javascript
const { name, ...rest } = user;           // object destructure + rest
const [first, ...others] = [1, 2, 3];     // array destructure + rest
const merged = { ...defaults, ...options }; // spread merge
```

### `==` vs `===`

- `===` strict (no type coercion) — **always use this**
- `==` loose (coerces types: `"1" == 1` is true)

---

## TypeScript Essentials

### Interfaces vs Types

| Feature | `interface` | `type` |
|---------|------------|--------|
| Extend | `extends` | `&` intersection |
| Merge declarations | ✅ yes | ❌ no |
| Unions | ❌ no | ✅ `string \| number` |
| Primitives/tuples | ❌ no | ✅ yes |

**Rule of thumb:** Use `interface` for object shapes, `type` for unions/primitives.

### Generics

```typescript
// Generic function — type flows from usage
function identity<T>(value: T): T { return value; }

// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}
```

### Utility Types (know these cold)

```typescript
Partial<T>       // all props optional
Required<T>      // all props required
Pick<T, K>       // select specific props
Omit<T, K>       // exclude specific props
Record<K, V>     // object with keys K and values V
Readonly<T>      // all props readonly
ReturnType<F>    // return type of function F
Parameters<F>    // parameter types as tuple
NonNullable<T>   // exclude null/undefined
```

### Type Guards & Narrowing

```typescript
// typeof
if (typeof value === "string") { /* value is string here */ }

// in operator
if ("email" in user) { /* user has email */ }

// Custom type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "id" in obj;
}

// Discriminated union
type Result = { status: "ok"; data: string } | { status: "error"; message: string };
function handle(r: Result) {
  if (r.status === "ok") console.log(r.data); // narrowed
}
```

### Modern TS Features (senior-level)

```typescript
// satisfies (TS 4.9) — validate without widening
const config = { port: 3000, host: "localhost" } satisfies Record<string, unknown>;
// config.port is number (not unknown) — literal type preserved

// as const — deep readonly + literal types
const ROLES = ["admin", "user", "guest"] as const;
type Role = typeof ROLES[number]; // "admin" | "user" | "guest"

// Template literal types
type EventName = `on${Capitalize<"click" | "focus">}`; // "onClick" | "onFocus"

// Conditional types with infer
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
```

### Enums vs Union Types

```typescript
// Prefer union types over enums (simpler, tree-shakeable)
type Status = "pending" | "approved" | "rejected"; // ✅
enum Status { Pending, Approved, Rejected }          // ❌ generates runtime code
```

---

## Key Patterns for JetBridge

1. **Result type** (no exceptions for control flow):
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

2. **Dependency Injection** (constructor injection, no decorators):
```typescript
class UserService {
  constructor(private repo: UserRepository, private logger: Logger) {}
}
```

3. **Builder pattern** for complex configs
4. **Factory functions** over classes when possible
5. **Zod** for runtime validation + type inference
