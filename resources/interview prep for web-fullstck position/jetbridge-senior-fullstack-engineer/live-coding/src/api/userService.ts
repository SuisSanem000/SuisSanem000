/**
 * User Service — AWS Lambda + DynamoDB CRUD
 * Production-ready, type-safe, copy-paste ready for live coding
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// --- Types ---

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "viewer";
  createdAt: string;
  updatedAt: string;
}

type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
type UpdateUserInput = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

// Discriminated union for error handling — no thrown exceptions for control flow
type Result<T, E = ServiceError> =
  | { success: true; data: T }
  | { success: false; error: E };

type ServiceError =
  | { code: "NOT_FOUND"; message: string }
  | { code: "VALIDATION"; message: string; field: string }
  | { code: "CONFLICT"; message: string }
  | { code: "INTERNAL"; message: string };

// --- DynamoDB Client (initialized outside handler for connection reuse) ---

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.TABLE_NAME ?? "users";

// --- Service Functions ---

export async function createUser(
  input: CreateUserInput
): Promise<Result<User>> {
  // Validate
  if (!input.email || !/\S+@\S+\.\S+/.test(input.email)) {
    return {
      success: false,
      error: { code: "VALIDATION", message: "Invalid email", field: "email" },
    };
  }

  if (!input.name || input.name.trim().length < 2) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "Name must be at least 2 characters",
        field: "name",
      },
    };
  }

  const now = new Date().toISOString();
  const user: User = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await ddbClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${user.id}`,
          SK: "PROFILE",
          GSI1PK: `EMAIL#${user.email}`,
          GSI1SK: `USER#${user.id}`,
          ...user,
        },
        // Prevent duplicate IDs
        ConditionExpression: "attribute_not_exists(PK)",
      })
    );
    return { success: true, data: user };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.name === "ConditionalCheckFailedException"
    ) {
      return {
        success: false,
        error: { code: "CONFLICT", message: "User already exists" },
      };
    }
    console.error("createUser failed:", err);
    return {
      success: false,
      error: { code: "INTERNAL", message: "Failed to create user" },
    };
  }
}

export async function getUserById(id: string): Promise<Result<User>> {
  if (!id) {
    return {
      success: false,
      error: { code: "VALIDATION", message: "ID is required", field: "id" },
    };
  }

  try {
    const { Item } = await ddbClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${id}`, SK: "PROFILE" },
      })
    );

    if (!Item) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: `User ${id} not found` },
      };
    }

    return { success: true, data: itemToUser(Item) };
  } catch (err) {
    console.error("getUserById failed:", err);
    return {
      success: false,
      error: { code: "INTERNAL", message: "Failed to fetch user" },
    };
  }
}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<Result<User>> {
  const fields = Object.entries(input).filter(
    ([, v]) => v !== undefined
  );
  if (fields.length === 0) {
    return {
      success: false,
      error: {
        code: "VALIDATION",
        message: "No fields to update",
        field: "input",
      },
    };
  }

  // Build update expression dynamically
  const now = new Date().toISOString();
  const expressionParts: string[] = ["#updatedAt = :updatedAt"];
  const names: Record<string, string> = { "#updatedAt": "updatedAt" };
  const values: Record<string, unknown> = { ":updatedAt": now };

  fields.forEach(([key, val], i) => {
    expressionParts.push(`#f${i} = :v${i}`);
    names[`#f${i}`] = key;
    values[`:v${i}`] = val;
  });

  try {
    const { Attributes } = await ddbClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${id}`, SK: "PROFILE" },
        UpdateExpression: `SET ${expressionParts.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConditionExpression: "attribute_exists(PK)", // ensure exists
        ReturnValues: "ALL_NEW",
      })
    );

    return { success: true, data: itemToUser(Attributes!) };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.name === "ConditionalCheckFailedException"
    ) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: `User ${id} not found` },
      };
    }
    console.error("updateUser failed:", err);
    return {
      success: false,
      error: { code: "INTERNAL", message: "Failed to update user" },
    };
  }
}

export async function deleteUser(id: string): Promise<Result<void>> {
  try {
    await ddbClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${id}`, SK: "PROFILE" },
        ConditionExpression: "attribute_exists(PK)",
      })
    );
    return { success: true, data: undefined };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.name === "ConditionalCheckFailedException"
    ) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: `User ${id} not found` },
      };
    }
    console.error("deleteUser failed:", err);
    return {
      success: false,
      error: { code: "INTERNAL", message: "Failed to delete user" },
    };
  }
}

export async function listUsersByRole(
  role: User["role"],
  limit = 20
): Promise<Result<User[]>> {
  try {
    const { Items } = await ddbClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :role",
        ExpressionAttributeValues: { ":role": `ROLE#${role}` },
        Limit: limit,
      })
    );

    return {
      success: true,
      data: (Items ?? []).map(itemToUser),
    };
  } catch (err) {
    console.error("listUsersByRole failed:", err);
    return {
      success: false,
      error: { code: "INTERNAL", message: "Failed to list users" },
    };
  }
}

// --- Helpers ---

function itemToUser(item: Record<string, unknown>): User {
  return {
    id: item.id as string,
    email: item.email as string,
    name: item.name as string,
    role: item.role as User["role"],
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  };
}
