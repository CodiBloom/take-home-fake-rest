import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  average,
  collectAllFriendHobbies,
  computeStats,
  findMostCommon,
  findMostCommonHobby,
  findUserWithMostFriends,
  groupUsersByCity,
  roundToOneDecimal,
} from "../src/stats.js";
import type { Friend, User } from "../src/types.js";

function makeFriends(count: number): Friend[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Friend ${index + 1}`,
    hobbies: [],
  }));
}

function makeUserWithFriends(
  id: number,
  city: string,
  friends: Friend[],
  name?: string,
): User {
  return {
    id,
    name: name ?? `User ${id}`,
    age: 30,
    city,
    friends,
  };
}

function makeUser(
  id: number,
  city: string,
  friendCount = 0,
  name?: string,
): User {
  return makeUserWithFriends(id, city, makeFriends(friendCount), name);
}

describe("collectAllFriendHobbies", () => {
  test("returns an empty array for an empty user list", () => {
    assert.deepEqual(collectAllFriendHobbies([]), []);
  });

  test("returns an empty array when users have no friends", () => {
    const users = [makeUser(1, "Austin"), makeUser(2, "Boston")];

    assert.deepEqual(collectAllFriendHobbies(users), []);
  });

  test("collects hobbies from all friends across all users", () => {
    const users = [
      makeUserWithFriends(1, "Austin", [
        { name: "Bob", hobbies: ["Music", "Running"] },
        { name: "Carol", hobbies: ["Gardening"] },
      ]),
      makeUserWithFriends(2, "Boston", [
        { name: "Dan", hobbies: ["Music", "Yoga"] },
      ]),
    ];

    assert.deepEqual(collectAllFriendHobbies(users), [
      "Music",
      "Running",
      "Gardening",
      "Music",
      "Yoga",
    ]);
  });

  test("preserves encounter order across users and friends", () => {
    const users = [
      makeUserWithFriends(1, "Austin", [
        { name: "Bob", hobbies: ["A"] },
      ]),
      makeUserWithFriends(2, "Boston", [
        { name: "Carol", hobbies: ["B", "C"] },
        { name: "Dan", hobbies: [] },
      ]),
    ];

    assert.deepEqual(collectAllFriendHobbies(users), ["A", "B", "C"]);
  });
});

describe("findMostCommon", () => {
  test("returns an empty result for an empty list", () => {
    assert.deepEqual(findMostCommon([]), { name: "", count: 0 });
  });

  test("returns the only value when there is one", () => {
    assert.deepEqual(findMostCommon(["Alice"]), { name: "Alice", count: 1 });
  });

  test("returns the most frequent value", () => {
    assert.deepEqual(findMostCommon(["Bob", "Alice", "Bob", "Carol"]), {
      name: "Bob",
      count: 2,
    });
  });

  test("breaks ties alphabetically", () => {
    assert.deepEqual(findMostCommon(["Zoe", "Amy", "Zoe", "Amy"]), {
      name: "Amy",
      count: 2,
    });
  });
});

describe("findMostCommonHobby", () => {
  test("returns an empty result for an empty list", () => {
    assert.deepEqual(findMostCommonHobby([]), { hobby: "", count: 0 });
  });

  test("returns the most frequent hobby", () => {
    assert.deepEqual(
      findMostCommonHobby(["Music", "Yoga", "Music", "Running"]),
      { hobby: "Music", count: 2 },
    );
  });

  test("breaks ties alphabetically", () => {
    assert.deepEqual(
      findMostCommonHobby(["Yoga", "Gardening", "Yoga", "Gardening"]),
      { hobby: "Gardening", count: 2 },
    );
  });
});

describe("groupUsersByCity", () => {
  test("returns an empty map for an empty user list", () => {
    const grouped = groupUsersByCity([]);

    assert.equal(grouped.size, 0);
  });

  test("groups a single user under their city", () => {
    const user = makeUser(1, "Austin");
    const grouped = groupUsersByCity([user]);

    assert.equal(grouped.size, 1);
    assert.deepEqual(grouped.get("Austin"), [user]);
  });

  test("groups multiple users in the same city together", () => {
    const first = makeUser(1, "Boston");
    const second = makeUser(2, "Boston");
    const grouped = groupUsersByCity([first, second]);

    assert.equal(grouped.size, 1);
    assert.deepEqual(grouped.get("Boston"), [first, second]);
  });

  test("separates users by city", () => {
    const austinUser = makeUser(1, "Austin");
    const bostonUser = makeUser(2, "Boston");
    const grouped = groupUsersByCity([austinUser, bostonUser]);

    assert.equal(grouped.size, 2);
    assert.deepEqual(grouped.get("Austin"), [austinUser]);
    assert.deepEqual(grouped.get("Boston"), [bostonUser]);
  });

  test("preserves encounter order within each city", () => {
    const first = makeUser(1, "Denver");
    const second = makeUser(2, "Chicago");
    const third = makeUser(3, "Denver");
    const grouped = groupUsersByCity([first, second, third]);

    assert.deepEqual(grouped.get("Denver"), [first, third]);
    assert.deepEqual(grouped.get("Chicago"), [second]);
  });
});

describe("findUserWithMostFriends", () => {
  test("returns the only user in a city", () => {
    const user = makeUser(1, "Austin", 2, "Alice");

    assert.deepEqual(findUserWithMostFriends([user]), {
      id: 1,
      name: "Alice",
      friendCount: 2,
    });
  });

  test("returns the user with the most friends", () => {
    const users = [
      makeUser(1, "Boston", 1, "Alice"),
      makeUser(2, "Boston", 3, "Bob"),
      makeUser(3, "Boston", 2, "Carol"),
    ];

    assert.deepEqual(findUserWithMostFriends(users), {
      id: 2,
      name: "Bob",
      friendCount: 3,
    });
  });

  test("breaks ties using the lowest id", () => {
    const users = [
      makeUser(3, "Chicago", 2, "Carol"),
      makeUser(1, "Chicago", 2, "Alice"),
      makeUser(2, "Chicago", 2, "Bob"),
    ];

    assert.deepEqual(findUserWithMostFriends(users), {
      id: 1,
      name: "Alice",
      friendCount: 2,
    });
  });

  test("handles users with no friends", () => {
    const users = [
      makeUser(2, "Denver", 0, "Bob"),
      makeUser(1, "Denver", 0, "Alice"),
    ];

    assert.deepEqual(findUserWithMostFriends(users), {
      id: 1,
      name: "Alice",
      friendCount: 0,
    });
  });
});

describe("roundToOneDecimal", () => {
  test("rounds to one decimal place", () => {
    assert.equal(roundToOneDecimal(33.55), 33.6);
    assert.equal(roundToOneDecimal(33.54), 33.5);
    assert.equal(roundToOneDecimal(1.24), 1.2);
    assert.equal(roundToOneDecimal(1.25), 1.3);
  });

  test("leaves whole numbers unchanged", () => {
    assert.equal(roundToOneDecimal(30), 30);
    assert.equal(roundToOneDecimal(0), 0);
  });

  test("leaves values already at one decimal unchanged", () => {
    assert.equal(roundToOneDecimal(33.5), 33.5);
    assert.equal(roundToOneDecimal(2.0), 2);
  });
});

describe("average", () => {
  test("returns 0 for an empty array", () => {
    assert.equal(average([]), 0);
  });

  test("returns the value for a single-item array", () => {
    assert.equal(average([42]), 42);
    assert.equal(average([33.55]), 33.6);
  });

  test("returns the mean rounded to one decimal place", () => {
    assert.equal(average([33, 34]), 33.5);
    assert.equal(average([1, 2, 3]), 2);
    assert.equal(average([2, 2, 5]), 3);
  });
});

describe("computeStats", () => {
  test("returns empty aggregates for an empty user list", () => {
    assert.deepEqual(computeStats([]), {
      averageAgePerCity: {},
      averageFriendsPerCity: {},
      mostFriendsPerCity: {},
      mostCommonFirstName: { name: "", count: 0 },
      mostCommonHobby: { hobby: "", count: 0 },
    });
  });

  test("computes all statistics across multiple cities", () => {
    const users = [
      makeUserWithFriends(1, "Austin", [
        { name: "Friend A", hobbies: ["Music", "Running"] },
        { name: "Friend B", hobbies: ["Music"] },
      ], "Alice"),
      makeUserWithFriends(2, "Austin", [
        { name: "Friend C", hobbies: ["Gardening"] },
      ], "Bob"),
      makeUserWithFriends(3, "Boston", [
        { name: "Friend D", hobbies: ["Yoga", "Yoga"] },
        { name: "Friend E", hobbies: ["Gardening"] },
        { name: "Friend F", hobbies: ["Music"] },
      ], "Alice"),
      makeUserWithFriends(4, "Boston", [
        { name: "Friend G", hobbies: ["Music", "Gardening"] },
        { name: "Friend H", hobbies: ["Music"] },
        { name: "Friend I", hobbies: ["Running"] },
      ], "Carol"),
    ];

    users[0].age = 30;
    users[1].age = 40;
    users[2].age = 50;
    users[3].age = 70;

    assert.deepEqual(computeStats(users), {
      averageAgePerCity: {
        Austin: 35,
        Boston: 60,
      },
      averageFriendsPerCity: {
        Austin: 1.5,
        Boston: 3,
      },
      mostFriendsPerCity: {
        Austin: {
          id: 1,
          name: "Alice",
          friendCount: 2,
        },
        Boston: {
          id: 3,
          name: "Alice",
          friendCount: 3,
        },
      },
      mostCommonFirstName: {
        name: "Alice",
        count: 2,
      },
      mostCommonHobby: {
        hobby: "Music",
        count: 5,
      },
    });
  });
});
