/**
 * Tests for validation utilities and InMemoryRepository
 * Framework: Vitest
 */

import { describe, it, expect, vi } from "vitest";
import {
  required,
  minLength,
  maxLength,
  email,
  pattern,
  range,
  unique,
  validateValue,
  createObjectValidator,
  InMemoryRepository,
} from "../src/utils/validation";

// --- Validator Tests ---

describe("Validators", () => {
  describe("required", () => {
    const validate = required();

    it("should fail for null", () => {
      expect(validate(null)).toBe("This field is required");
    });

    it("should fail for undefined", () => {
      expect(validate(undefined)).toBe("This field is required");
    });

    it("should fail for empty string", () => {
      expect(validate("")).toBe("This field is required");
    });

    it("should pass for non-empty value", () => {
      expect(validate("hello")).toBeNull();
    });

    it("should pass for zero", () => {
      expect(validate(0)).toBeNull();
    });

    it("should accept custom message", () => {
      const v = required("Name is required");
      expect(v(null)).toBe("Name is required");
    });
  });

  describe("minLength", () => {
    const validate = minLength(3);

    it("should fail for short string", () => {
      expect(validate("ab")).toBe("Must be at least 3 characters");
    });

    it("should pass for exact length", () => {
      expect(validate("abc")).toBeNull();
    });

    it("should pass for longer string", () => {
      expect(validate("abcdef")).toBeNull();
    });
  });

  describe("maxLength", () => {
    const validate = maxLength(5);

    it("should fail for long string", () => {
      expect(validate("abcdef")).toBe("Must be at most 5 characters");
    });

    it("should pass for exact length", () => {
      expect(validate("abcde")).toBeNull();
    });
  });

  describe("email", () => {
    const validate = email();

    it("should fail for invalid email", () => {
      expect(validate("not-email")).toBe("Invalid email");
    });

    it("should fail for missing @", () => {
      expect(validate("testexample.com")).toBe("Invalid email");
    });

    it("should pass for valid email", () => {
      expect(validate("test@example.com")).toBeNull();
    });
  });

  describe("pattern", () => {
    const validate = pattern(/^\d{3}-\d{4}$/, "Invalid phone format");

    it("should fail for non-matching pattern", () => {
      expect(validate("1234567")).toBe("Invalid phone format");
    });

    it("should pass for matching pattern", () => {
      expect(validate("123-4567")).toBeNull();
    });
  });

  describe("range", () => {
    const validate = range(1, 100);

    it("should fail for value below range", () => {
      expect(validate(0)).toBe("Must be between 1 and 100");
    });

    it("should fail for value above range", () => {
      expect(validate(101)).toBe("Must be between 1 and 100");
    });

    it("should pass for value in range", () => {
      expect(validate(50)).toBeNull();
    });

    it("should pass for boundary values", () => {
      expect(validate(1)).toBeNull();
      expect(validate(100)).toBeNull();
    });
  });

  describe("unique (async)", () => {
    it("should fail when value exists", async () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      const validate = unique(checkFn, "Email taken");
      expect(await validate("taken@test.com")).toBe("Email taken");
    });

    it("should pass when value is unique", async () => {
      const checkFn = vi.fn().mockResolvedValue(false);
      const validate = unique(checkFn);
      expect(await validate("new@test.com")).toBeNull();
    });
  });
});

// --- validateValue Tests ---

describe("validateValue", () => {
  it("should return valid for passing validators", async () => {
    const result = await validateValue("hello@test.com", [
      required(),
      email(),
    ]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should collect all errors", async () => {
    const result = await validateValue("", [required(), minLength(3)]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle async validators", async () => {
    const asyncCheck = unique(
      vi.fn().mockResolvedValue(true),
      "Already exists"
    );
    const result = await validateValue("test", [asyncCheck]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Already exists");
  });
});

// --- createObjectValidator Tests ---

describe("createObjectValidator", () => {
  interface UserInput {
    name: string;
    email: string;
    age: number;
  }

  const validateUser = createObjectValidator<UserInput>([
    { field: "name", validators: [required(), minLength(2)] },
    { field: "email", validators: [required(), email()] },
    { field: "age", validators: [range(18, 120)] },
  ]);

  it("should return empty errors for valid input", async () => {
    const errors = await validateUser({
      name: "Jane",
      email: "jane@test.com",
      age: 25,
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("should return errors for invalid fields", async () => {
    const errors = await validateUser({
      name: "",
      email: "bad",
      age: 10,
    });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.age).toBeDefined();
  });

  it("should only return errors for invalid fields", async () => {
    const errors = await validateUser({
      name: "Jane",
      email: "bad",
      age: 25,
    });
    expect(errors.name).toBeUndefined();
    expect(errors.email).toBeDefined();
    expect(errors.age).toBeUndefined();
  });
});

// --- InMemoryRepository Tests ---

describe("InMemoryRepository", () => {
  interface TestEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    status: "active" | "inactive";
  }

  let repo: InMemoryRepository<TestEntity>;

  beforeEach(() => {
    repo = new InMemoryRepository<TestEntity>();
  });

  it("should create and find entity", async () => {
    const created = await repo.create({ name: "Test", status: "active" });
    expect(created.id).toBeDefined();
    expect(created.name).toBe("Test");

    const found = await repo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Test");
  });

  it("should return null for non-existent entity", async () => {
    const found = await repo.findById("nonexistent");
    expect(found).toBeNull();
  });

  it("should update entity", async () => {
    const created = await repo.create({ name: "Original", status: "active" });
    const updated = await repo.update(created.id, { name: "Updated" });

    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Updated");
    expect(updated!.status).toBe("active"); // unchanged field preserved
    expect(updated!.updatedAt.getTime()).toBeGreaterThan(
      created.updatedAt.getTime()
    );
  });

  it("should delete entity", async () => {
    const created = await repo.create({ name: "ToDelete", status: "active" });
    const deleted = await repo.delete(created.id);
    expect(deleted).toBe(true);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it("should filter with where clause", async () => {
    await repo.create({ name: "Active1", status: "active" });
    await repo.create({ name: "Active2", status: "active" });
    await repo.create({ name: "Inactive", status: "inactive" });

    const active = await repo.findMany({ where: { status: "active" } });
    expect(active).toHaveLength(2);
  });

  it("should sort results", async () => {
    await repo.create({ name: "B", status: "active" });
    await repo.create({ name: "A", status: "active" });
    await repo.create({ name: "C", status: "active" });

    const sorted = await repo.findMany({
      orderBy: { field: "name", direction: "asc" },
    });
    expect(sorted.map((e) => e.name)).toEqual(["A", "B", "C"]);
  });

  it("should paginate results", async () => {
    for (let i = 0; i < 10; i++) {
      await repo.create({ name: `Item${i}`, status: "active" });
    }

    const page1 = await repo.findMany({ limit: 3, offset: 0 });
    expect(page1).toHaveLength(3);

    const page2 = await repo.findMany({ limit: 3, offset: 3 });
    expect(page2).toHaveLength(3);
  });

  it("should count entities", async () => {
    await repo.create({ name: "A", status: "active" });
    await repo.create({ name: "B", status: "inactive" });

    expect(await repo.count()).toBe(2);
    expect(await repo.count({ status: "active" })).toBe(1);
  });
});
