import assert from "node:assert/strict";
import { afterEach, describe, mock, test } from "node:test";

import { fetchUsers, parseUsers } from "../src/client.js";
import type { User } from "../src/types.js";

const sampleUser: User = {
  id: 1,
  name: "Alice",
  age: 30,
  city: "Austin",
  friends: [{ name: "Bob", hobbies: ["Music"] }],
};

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
