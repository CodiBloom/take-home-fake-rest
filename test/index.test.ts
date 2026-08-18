import assert from "node:assert/strict";
import { afterEach, describe, mock, test } from "node:test";

import type { StatsResult, User } from "../src/types.js";

const sampleUser: User = {
  id: 1,
  name: "Alice",
  age: 30,
  city: "Austin",
  friends: [{ name: "Bob", hobbies: ["Music"] }],
};

const sampleStats: StatsResult = {
  averageAgePerCity: { Austin: 30 },
  averageFriendsPerCity: { Austin: 1 },
  mostFriendsPerCity: {
    Austin: {
      id: 1,
      name: "Alice",
      friendCount: 1,
    },
  },
  mostCommonFirstName: {
    name: "Alice",
    count: 1,
  },
  mostCommonHobby: {
    hobby: "Music",
    count: 1,
  },
};

describe("printUsage", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("writes usage instructions to stderr", async () => {
    const stderr: string[] = [];
    mock.method(console, "error", (...args: unknown[]) => {
      stderr.push(args.map(String).join(" "));
    });

    const { printUsage } = await import("../src/index.js");
    printUsage();

    assert.deepEqual(stderr, [
      "Usage: fake-rest-stats <endpoint-url>",
      "Example: fake-rest-stats http://localhost:3000",
    ]);
  });
});

describe("main", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("returns 1 and prints usage when endpoint is missing", async () => {
    const stderr: string[] = [];
    mock.method(console, "error", (...args: unknown[]) => {
      stderr.push(args.map(String).join(" "));
    });

    const { main } = await import("../src/index.js");
    const exitCode = await main(["node", "fake-rest-stats"]);

    assert.equal(exitCode, 1);
    assert.match(stderr[0], /Usage: fake-rest-stats/);
  });

  test("returns 1 for an invalid URL", async () => {
    const stderr: string[] = [];
    mock.method(console, "error", (...args: unknown[]) => {
      stderr.push(args.map(String).join(" "));
    });

    const { main } = await import("../src/index.js");
    const exitCode = await main(["node", "fake-rest-stats", "not-a-url"]);

    assert.equal(exitCode, 1);
    assert.equal(stderr[0], "Invalid URL: not-a-url");
  });

  test("fetches users, computes stats, and prints JSON", async () => {
    const fetchUsers = mock.fn(async () => [sampleUser]);
    const computeStats = mock.fn(() => sampleStats);

    const stdout: string[] = [];
    mock.method(console, "log", (...args: unknown[]) => {
      stdout.push(args.map(String).join(" "));
    });

    const { main } = await import("../src/index.js");
    const exitCode = await main(
      ["node", "fake-rest-stats", "http://localhost:3000"],
      { fetchUsers, computeStats },
    );

    assert.equal(exitCode, 0);
    assert.equal(fetchUsers.mock.callCount(), 1);
    assert.equal(fetchUsers.mock.calls[0]?.arguments[0], "http://localhost:3000");
    assert.equal(computeStats.mock.callCount(), 1);
    assert.deepEqual(computeStats.mock.calls[0]?.arguments[0], [sampleUser]);
    assert.deepEqual(JSON.parse(stdout[0]!), sampleStats);
  });

  test("returns 1 and prints errors from fetchUsers", async () => {
    const stderr: string[] = [];
    mock.method(console, "error", (...args: unknown[]) => {
      stderr.push(args.map(String).join(" "));
    });

    const { main } = await import("../src/index.js");
    const exitCode = await main(
      ["node", "fake-rest-stats", "http://localhost:3000"],
      {
        fetchUsers: async () => {
          throw new Error("Request failed with status 500 Internal Server Error");
        },
        computeStats: () => sampleStats,
      },
    );

    assert.equal(exitCode, 1);
    assert.equal(stderr[0], "Request failed with status 500 Internal Server Error");
  });
});
