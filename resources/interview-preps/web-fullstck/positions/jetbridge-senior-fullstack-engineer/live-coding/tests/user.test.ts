/**
 * Tests for userService — Lambda + DynamoDB CRUD
 * Framework: Vitest (compatible with Jest API)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUser, getUserById, updateUser, deleteUser } from "../src/api/userService";

// Mock DynamoDB DocumentClient
const mockSend = vi.fn();
vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: () => ({ send: mockSend }),
  },
  GetCommand: vi.fn().mockImplementation((input) => ({ input })),
  PutCommand: vi.fn().mockImplementation((input) => ({ input })),
  UpdateCommand: vi.fn().mockImplementation((input) => ({ input })),
  DeleteCommand: vi.fn().mockImplementation((input) => ({ input })),
  QueryCommand: vi.fn().mockImplementation((input) => ({ input })),
}));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: vi.fn(),
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user with valid input", async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await createUser({
        email: "jane@example.com",
        name: "Jane Doe",
        role: "user",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("jane@example.com");
        expect(result.data.name).toBe("Jane Doe");
        expect(result.data.id).toBeDefined();
        expect(result.data.createdAt).toBeDefined();
      }
    });

    it("should reject invalid email", async () => {
      const result = await createUser({
        email: "not-an-email",
        name: "Jane",
        role: "user",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION");
      }
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should reject empty name", async () => {
      const result = await createUser({
        email: "jane@example.com",
        name: "",
        role: "user",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION");
      }
    });

    it("should handle duplicate user (ConditionalCheckFailedException)", async () => {
      const error = new Error("Condition not met");
      error.name = "ConditionalCheckFailedException";
      mockSend.mockRejectedValueOnce(error);

      const result = await createUser({
        email: "jane@example.com",
        name: "Jane Doe",
        role: "user",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("CONFLICT");
      }
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "123",
        email: "jane@example.com",
        name: "Jane Doe",
        role: "user",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      mockSend.mockResolvedValueOnce({ Item: mockUser });

      const result = await getUserById("123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("123");
        expect(result.data.email).toBe("jane@example.com");
      }
    });

    it("should return NOT_FOUND when user doesn't exist", async () => {
      mockSend.mockResolvedValueOnce({ Item: undefined });

      const result = await getUserById("nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should validate id is provided", async () => {
      const result = await getUserById("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION");
      }
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update user fields", async () => {
      const updatedUser = {
        id: "123",
        email: "jane@example.com",
        name: "Jane Updated",
        role: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-06-01T00:00:00Z",
      };
      mockSend.mockResolvedValueOnce({ Attributes: updatedUser });

      const result = await updateUser("123", { name: "Jane Updated", role: "admin" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Jane Updated");
      }
    });

    it("should reject empty update", async () => {
      const result = await updateUser("123", {});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION");
      }
    });

    it("should return NOT_FOUND for non-existent user", async () => {
      const error = new Error("Condition not met");
      error.name = "ConditionalCheckFailedException";
      mockSend.mockRejectedValueOnce(error);

      const result = await updateUser("nonexistent", { name: "Test" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("deleteUser", () => {
    it("should delete existing user", async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await deleteUser("123");

      expect(result.success).toBe(true);
    });

    it("should return NOT_FOUND for non-existent user", async () => {
      const error = new Error("Condition not met");
      error.name = "ConditionalCheckFailedException";
      mockSend.mockRejectedValueOnce(error);

      const result = await deleteUser("nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });
  });
});
