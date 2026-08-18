import type { User } from "./types.js";

export function parseUsers(body: string): User[] {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    throw new Error("Response body is empty");
  }

  if (trimmed.startsWith("[")) {
    const data: unknown = JSON.parse(trimmed);

    if (!Array.isArray(data)) {
      throw new Error("Expected a JSON array of user objects");
    }

    return data as User[];
  }

  const users: User[] = [];

  for (const [index, line] of trimmed.split("\n").entries()) {
    const row = line.trim();

    if (row.length === 0) {
      continue;
    }

    try {
      users.push(JSON.parse(row) as User);
    } catch {
      throw new Error(`Invalid JSON on line ${index + 1}`);
    }
  }

  if (users.length === 0) {
    throw new Error("Response body contains no user objects");
  }

  return users;
}

export async function fetchUsers(endpoint: string): Promise<User[]> {
  let response: Response;

  try {
    response = await fetch(endpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to reach endpoint: ${message}`);
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
  }

  let body: string;

  try {
    body = await response.text();
  } catch {
    throw new Error("Failed to read response body");
  }

  try {
    return parseUsers(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message);
  }
}
