/**
 * Async Validation Pipeline — Generic, composable, type-safe
 * Key patterns: generics, async composition, discriminated unions
 */

// --- Core Types ---

/** A validator returns null if valid, error message string if invalid */
type Validator<T> = (value: T) => Promise<string | null> | string | null;

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface FieldValidation<T> {
  field: keyof T & string;
  validators: Validator<unknown>[];
}

// --- Validator Factories ---

/** Field is required (not null, undefined, or empty string) */
export function required(message?: string): Validator<unknown> {
  return (value) => {
    if (value === null || value === undefined || value === "") {
      return message ?? "This field is required";
    }
    return null;
  };
}

/** Minimum string length */
export function minLength(min: number, message?: string): Validator<string> {
  return (value) => {
    if (typeof value === "string" && value.length < min) {
      return message ?? `Must be at least ${min} characters`;
    }
    return null;
  };
}

/** Maximum string length */
export function maxLength(max: number, message?: string): Validator<string> {
  return (value) => {
    if (typeof value === "string" && value.length > max) {
      return message ?? `Must be at most ${max} characters`;
    }
    return null;
  };
}

/** Regex pattern match */
export function pattern(regex: RegExp, message?: string): Validator<string> {
  return (value) => {
    if (typeof value === "string" && !regex.test(value)) {
      return message ?? `Must match pattern ${regex.source}`;
    }
    return null;
  };
}

/** Email format */
export function email(message?: string): Validator<string> {
  return pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message ?? "Invalid email");
}

/** Async uniqueness check (e.g., check database) */
export function unique<T>(
  checkFn: (value: T) => Promise<boolean>,
  message?: string
): Validator<T> {
  return async (value) => {
    const exists = await checkFn(value);
    if (exists) {
      return message ?? "Value already exists";
    }
    return null;
  };
}

/** Numeric range */
export function range(
  min: number,
  max: number,
  message?: string
): Validator<number> {
  return (value) => {
    if (typeof value === "number" && (value < min || value > max)) {
      return message ?? `Must be between ${min} and ${max}`;
    }
    return null;
  };
}

// --- Validation Engine ---

/**
 * Runs all validators for a single value, collecting all errors.
 * Validators run in parallel where possible.
 */
export async function validateValue<T>(
  value: T,
  validators: Validator<T>[]
): Promise<ValidationResult> {
  const results = await Promise.allSettled(
    validators.map((v) => Promise.resolve(v(value)))
  );

  const errors: string[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value !== null) {
      errors.push(result.value);
    } else if (result.status === "rejected") {
      errors.push(`Validation error: ${result.reason}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Creates a schema-based validator for an object.
 * Returns a function that validates all fields in parallel.
 */
export function createObjectValidator<T extends Record<string, unknown>>(
  schema: FieldValidation<T>[]
): (data: T) => Promise<Record<string, string[]>> {
  return async (data: T) => {
    const fieldResults = await Promise.all(
      schema.map(async ({ field, validators }) => {
        const value = data[field];
        const result = await validateValue(value, validators);
        return { field, errors: result.errors };
      })
    );

    const errorMap: Record<string, string[]> = {};
    for (const { field, errors } of fieldResults) {
      if (errors.length > 0) {
        errorMap[field] = errors;
      }
    }
    return errorMap;
  };
}

// --- Generic Repository Interface ---

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

type WhereClause<T> = Partial<{
  [K in keyof T]: T[K] | { $in: T[K][] } | { $gt: T[K] } | { $lt: T[K] };
}>;

interface QueryOptions<T> {
  where?: WhereClause<T>;
  orderBy?: { field: keyof T; direction: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findMany(options?: QueryOptions<T>): Promise<T[]>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(
    id: string,
    data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
  ): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(where?: WhereClause<T>): Promise<number>;
}

/**
 * In-memory repository — useful for testing and prototyping.
 * Same interface as a real DB repository.
 */
export class InMemoryRepository<T extends BaseEntity>
  implements Repository<T>
{
  private store = new Map<string, T>();

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) ?? null;
  }

  async findMany(options?: QueryOptions<T>): Promise<T[]> {
    let items = Array.from(this.store.values());

    // Filter
    if (options?.where) {
      items = items.filter((item) =>
        Object.entries(options.where!).every(([key, val]) => {
          const itemVal = item[key as keyof T];
          if (typeof val === "object" && val !== null && "$in" in (val as object)) {
            return ((val as { $in: unknown[] }).$in).includes(itemVal);
          }
          return itemVal === val;
        })
      );
    }

    // Sort
    if (options?.orderBy) {
      const { field, direction } = options.orderBy;
      items.sort((a, b) => {
        const aVal = a[field], bVal = b[field];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === "asc" ? cmp : -cmp;
      });
    }

    // Paginate
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return items.slice(offset, offset + limit);
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const now = new Date();
    const entity = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T;
    this.store.set(entity.id, entity);
    return entity;
  }

  async update(
    id: string,
    data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
  ): Promise<T | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() } as T;
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async count(where?: WhereClause<T>): Promise<number> {
    if (!where) return this.store.size;
    const items = await this.findMany({ where });
    return items.length;
  }
}
