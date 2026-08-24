import assert from "node:assert/strict";
import { afterEach, describe, mock, test } from "node:test";

import { fetchUsers, parseUsers, streamUsers, streamUsersFromBody } from "../src/client.js";
import type { User } from "../src/types.js";

const sampleUser: User = {
  id: 1,
  name: "Alice",
  age: 30,
  city: "Austin",
  friends: [{ name: "Bob", hobbies: ["Music"] }],
};

function createChunkedStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }

      controller.enqueue(encoder.encode(chunks[index]));
      index += 1;
    },
  });
}

async function collectUsers(users: AsyncIterable<User>): Promise<User[]> {
  const collected: User[] = [];

  for await (const user of users) {
    collected.push(user);
  }

  return collected;
}

describe("parseUsers", () => {
  test("parses newline-delimited JSON", () => {
    const body = [
      JSON.stringify(sampleUser),
      JSON.stringify({ ...sampleUser, id: 2, name: "Noah" }),
    ].join("\n");

    const users = parseUsers(body);

    assert.equal(users.length, 2);
    assert.equal(users[0].name, "Alice");
    assert.equal(users[1].id, 2);
  });

  test("parses a JSON array", () => {
    const users = parseUsers(JSON.stringify([sampleUser]));

    assert.deepEqual(users, [sampleUser]);
  });

  test("skips blank lines in NDJSON payloads", () => {
    const body = `${JSON.stringify(sampleUser)}\n\n${JSON.stringify({ ...sampleUser, id: 2 })}`;

    const users = parseUsers(body);

    assert.equal(users.length, 2);
  });

  test("throws when the body is empty", () => {
    assert.throws(() => parseUsers(""), /Response body is empty/);
    assert.throws(() => parseUsers("   \n  "), /Response body is empty/);
  });

  test("throws when NDJSON contains only blank lines", () => {
    assert.throws(() => parseUsers("\n\n"), /Response body is empty/);
  });

  test("throws when a JSON array payload is invalid", () => {
    assert.throws(() => parseUsers("[not-json"), /Unexpected token/);
  });

  test("throws when an NDJSON line is invalid JSON", () => {
    assert.throws(
      () => parseUsers(`${JSON.stringify(sampleUser)}\nnot-json`),
      /Invalid JSON on line 2/,
    );
  });
});

describe("streamUsersFromBody", () => {
  test("streams NDJSON users from chunked input", async () => {
    const body = [
      JSON.stringify(sampleUser),
      JSON.stringify({ ...sampleUser, id: 2, name: "Noah" }),
    ].join("\n");
    const stream = createChunkedStream([body.slice(0, 8), body.slice(8)]);

    const users = await collectUsers(streamUsersFromBody(stream));

    assert.equal(users.length, 2);
    assert.equal(users[0]?.name, "Alice");
    assert.equal(users[1]?.id, 2);
  });

  test("streams NDJSON users when the first byte arrives in a later chunk", async () => {
    const body = `${JSON.stringify(sampleUser)}\n${JSON.stringify({ ...sampleUser, id: 2 })}`;
    const stream = createChunkedStream(["   ", body]);

    const users = await collectUsers(streamUsersFromBody(stream));

    assert.equal(users.length, 2);
  });

  test("buffers and parses JSON array responses", async () => {
    const stream = createChunkedStream([
      "  [",
      JSON.stringify(sampleUser).slice(0, 4),
      `${JSON.stringify(sampleUser).slice(4)}]`,
    ]);

    const users = await collectUsers(streamUsersFromBody(stream));

    assert.deepEqual(users, [sampleUser]);
  });

  test("throws when a streamed NDJSON line is invalid JSON", async () => {
    const stream = createChunkedStream([
      `${JSON.stringify(sampleUser)}\nnot`,
      "-json",
    ]);

    await assert.rejects(
      () => collectUsers(streamUsersFromBody(stream)),
      /Invalid JSON on line 2/,
    );
  });

  test("throws when the streamed body is empty", async () => {
    const stream = createChunkedStream(["", "   "]);

    await assert.rejects(
      () => collectUsers(streamUsersFromBody(stream)),
      /Response body is empty/,
    );
  });
});

describe("streamUsers", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("streams users from an NDJSON response", async () => {
    mock.method(globalThis, "fetch", async () => {
      return new Response(`${JSON.stringify(sampleUser)}\n`, { status: 200 });
    });

    const users = await collectUsers(streamUsers("http://example.com/users"));

    assert.deepEqual(users, [sampleUser]);
  });

  test("streams users from a JSON array response", async () => {
    mock.method(globalThis, "fetch", async () => {
      return new Response(JSON.stringify([sampleUser]), { status: 200 });
    });

    const users = await collectUsers(streamUsers("http://example.com/users"));

    assert.deepEqual(users, [sampleUser]);
  });
});

describe("fetchUsers", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("fetches and parses an NDJSON response", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => {
      return new Response(JSON.stringify(sampleUser), { status: 200 });
    });

    const users = await fetchUsers("http://example.com/users");

    assert.deepEqual(users, [sampleUser]);
    assert.equal(fetchMock.mock.callCount(), 1);
    assert.equal(fetchMock.mock.calls[0].arguments[0], "http://example.com/users");
  });

  test("fetches and parses a JSON array response", async () => {
    mock.method(globalThis, "fetch", async () => {
      return new Response(JSON.stringify([sampleUser]), { status: 200 });
    });

    const users = await fetchUsers("http://example.com/users");

    assert.deepEqual(users, [sampleUser]);
  });

  test("throws when the network request fails", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new Error("connection refused");
    });

    await assert.rejects(
      () => fetchUsers("http://example.com/users"),
      /Failed to reach endpoint: connection refused/,
    );
  });

  test("throws when the response status is not ok", async () => {
    mock.method(globalThis, "fetch", async () => {
      return new Response("not found", { status: 404, statusText: "Not Found" });
    });

    await assert.rejects(
      () => fetchUsers("http://example.com/users"),
      /Request failed with status 404 Not Found/,
    );
  });

  test("throws when the response body fails parsing", async () => {
    mock.method(globalThis, "fetch", async () => {
      return new Response("not-json", { status: 200 });
    });

    await assert.rejects(
      () => fetchUsers("http://example.com/users"),
      /Invalid JSON on line 1/,
    );
  });
});
