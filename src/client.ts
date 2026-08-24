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

async function detectFormat(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  initialBuffer: string,
): Promise<{ format: "array" | "ndjson"; buffer: string }> {
  let buffer = initialBuffer;

  while (true) {
    const leadingWhitespaceLength = buffer.match(/^\s*/)?.[0].length ?? 0;
    const firstCharIndex = leadingWhitespaceLength;

    if (firstCharIndex < buffer.length) {
      const firstChar = buffer[firstCharIndex];

      if (firstChar === "[") {
        return {
          format: "array",
          buffer: buffer.slice(firstCharIndex),
        };
      }

      return {
        format: "ndjson",
        buffer: buffer.slice(firstCharIndex),
      };
    }

    const { done, value } = await reader.read();

    if (done) {
      throw new Error("Response body is empty");
    }

    buffer += decoder.decode(value, { stream: true });
  }
}

async function readEntireBody(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  initialBuffer: string,
): Promise<string> {
  let buffer = initialBuffer;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
  }

  return buffer + decoder.decode();
}

async function* streamNdjsonUsers(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  initialBuffer: string,
): AsyncGenerator<User> {
  let lineBuffer = initialBuffer;
  let physicalLineNumber = 0;
  let userCount = 0;

  const processPhysicalLine = (line: string): User | null => {
    physicalLineNumber += 1;
    const row = line.trim();

    if (row.length === 0) {
      return null;
    }

    try {
      return JSON.parse(row) as User;
    } catch {
      throw new Error(`Invalid JSON on line ${physicalLineNumber}`);
    }
  };

  while (true) {
    const newlineIndex = lineBuffer.indexOf("\n");

    if (newlineIndex !== -1) {
      const line = lineBuffer.slice(0, newlineIndex);
      lineBuffer = lineBuffer.slice(newlineIndex + 1);
      const user = processPhysicalLine(line);

      if (user) {
        userCount += 1;
        yield user;
      }

      continue;
    }

    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    lineBuffer += decoder.decode(value, { stream: true });
  }

  lineBuffer += decoder.decode();

  if (lineBuffer.length > 0) {
    const trailingUser = processPhysicalLine(lineBuffer);

    if (trailingUser) {
      userCount += 1;
      yield trailingUser;
    }
  }

  if (userCount === 0) {
    throw new Error("Response body contains no user objects");
  }
}

export async function* streamUsersFromBody(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<User> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const { format, buffer } = await detectFormat(reader, decoder, "");

  if (format === "array") {
    const payload = await readEntireBody(reader, decoder, buffer);
    const users = parseUsers(payload);

    for (const user of users) {
      yield user;
    }

    return;
  }

  yield* streamNdjsonUsers(reader, decoder, buffer);
}

export async function* streamUsers(endpoint: string): AsyncGenerator<User> {
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

  if (response.body === null) {
    throw new Error("Response body is empty");
  }

  try {
    yield* streamUsersFromBody(response.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message);
  }
}

export async function fetchUsers(endpoint: string): Promise<User[]> {
  const users: User[] = [];

  for await (const user of streamUsers(endpoint)) {
    users.push(user);
  }

  return users;
}
