# Live Coding Scenarios — JetBridge Senior Fullstack Engineer Interview

> **Prep notes:** Mischa Spiegelmock (tech lead) will likely give you a prompt and watch you code in VS Code.
> Have TypeScript, Node.js, and git ready. Think aloud — explain your choices.

---

## Scenario 1: AWS-Integrated CRUD API (Most Likely)

**Prompt:** "Build a user management API with CRUD operations backed by DynamoDB, deployed via Lambda."

### Step-by-Step

1. **Clarify requirements** (~1 min)
   - "Should I use DynamoDB single-table design or separate tables?"
   - "Do we need authentication or is this a bare API?"
   - "REST or tRPC?"

2. **Scaffold** (~2 min)
   - Create `src/handlers/api.ts` with Lambda handler
   - Create `src/services/userService.ts` for business logic
   - Separate handler (HTTP concerns) from service (domain logic)

3. **Implement service layer** (~5 min)
   - See → [src/api/userService.ts](src/api/userService.ts)
   - Key decisions: Result type for error handling, UUID generation, type-safe DynamoDB operations

4. **Wire handler** (~3 min)
   - Route by `httpMethod + resource`
   - Parse body with validation (Zod or manual)
   - Return proper status codes

5. **Edge cases to mention:**
   - Idempotency for POST (use client-generated UUID)
   - Conditional updates (`ConditionExpression`) to prevent race conditions
   - Input validation before DB call
   - Pagination with `LastEvaluatedKey`

6. **If time:** Add tests → [tests/user.test.ts](tests/user.test.ts)

---

## Scenario 2: TypeScript Utility — Async Validation Pipeline

**Prompt:** "Build a generic validation pipeline that supports async validators and composes them."

### Step-by-Step

1. **Define types** (~2 min)
   ```typescript
   type Validator<T> = (value: T) => Promise<string | null>;
   type ValidationResult = { valid: boolean; errors: string[] };
   ```

2. **Implement** (~5 min)
   - See → [src/utils/validation.ts](src/utils/validation.ts)
   - Build `createValidator` that composes multiple validators
   - Support both sync and async validators
   - Run validators in parallel with `Promise.allSettled`

3. **Add built-in validators** (~3 min)
   - `required()`, `minLength()`, `pattern()`, `unique()` (async — DB check)

4. **Edge cases:**
   - Short-circuit on first error vs collect all errors
   - Timeout for async validators (DB might hang)
   - Type safety — validator input type matches field type

5. **If time:** Add tests → [tests/validation.test.ts](tests/validation.test.ts)

---

## Scenario 3: React Enterprise Table Component

**Prompt:** "Build a data table component with sorting, filtering, pagination, and row selection."

### Step-by-Step

1. **Define component API** (~2 min)
   ```tsx
   <EnterpriseTable
     data={users}
     columns={columns}
     onSort={handleSort}
     pageSize={20}
     selectable
   />
   ```

2. **Implement** (~8 min)
   - See → [src/components/EnterpriseTable.tsx](src/components/EnterpriseTable.tsx)
   - Custom hooks: `useSort`, `useFilter`, `usePagination`, `useSelection`
   - Generic `<T>` — table works with any data shape
   - Memoize expensive operations (`useMemo` for filtering/sorting)

3. **Key decisions to explain:**
   - Server-side vs client-side pagination (mention tradeoffs)
   - Controlled vs uncontrolled: let parent control sort/filter state
   - Accessibility: `role="grid"`, `aria-sort`, keyboard navigation

4. **Edge cases:**
   - Empty state rendering
   - Loading state (skeleton rows)
   - Column resize / virtual scrolling (mention, don't implement)

5. **If time:** Add tests → [tests/EnterpriseTable.test.tsx](tests/EnterpriseTable.test.tsx)

---

## Scenario 4: Generic Repository Pattern (Likely Follow-up)

**Prompt:** "Abstract our database access into a generic repository that works with any entity."

### Step-by-Step

1. **Define base entity + interface** (~2 min)
   - `BaseEntity` with `id`, `createdAt`, `updatedAt`
   - `Repository<T>` with `findById`, `findMany`, `create`, `update`, `delete`

2. **Already covered in:** Technical Q5 — reference that pattern

3. **Key talking points:**
   - `Omit<T, 'id' | 'createdAt' | 'updatedAt'>` for create input
   - `Partial<...>` for update input
   - Query builder with type-safe where clauses
   - Transaction support

---

## Scenario 5: Quick Algorithm / Data Structure (Possible Warm-up)

**Prompt:** "Implement a debounce function with proper TypeScript types" or "Build a simple LRU cache."

### Debounce (~3 min)
```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

### LRU Cache (~5 min)
```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value); // move to end (most recent)
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.capacity) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest!);
    }
    this.cache.set(key, value);
  }
}
```

---

## General Interview Tips

- **Think aloud:** "I'm choosing X because Y" — Mischa wants to see your reasoning
- **Start with types:** Define interfaces/types before implementation
- **Error handling first:** Show you think about failure modes
- **Ask questions:** Don't assume requirements — senior engineers clarify scope
- **Name things well:** `getUserById` not `get`, `ValidationError` not `err`
- **Test mindset:** Say "I'd test this by..." even if you don't write tests
- **Commit messages:** If asked to commit, use conventional commits: `feat: add user CRUD API`
- **Don't over-engineer:** Start simple, mention extensions ("if this needed caching, I'd add...")
