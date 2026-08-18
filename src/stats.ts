import type { MostCommonName, MostFriendsUser, StatsResult, User } from "./types.js";

function groupUsersByCity(users: User[]): Map<string, User[]> {
  const byCity = new Map<string, User[]>();

  for (const user of users) {
    const cityUsers = byCity.get(user.city);

    if (cityUsers) {
      cityUsers.push(user);
    } else {
      byCity.set(user.city, [user]);
    }
  }

  return byCity;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return roundToOneDecimal(sum / values.length);
}

function findMostCommon(values: string[]): MostCommonName {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let topName = "";
  let topCount = 0;

  for (const [name, count] of counts) {
    if (
      count > topCount ||
      (count === topCount && name.localeCompare(topName) < 0)
    ) {
      topName = name;
      topCount = count;
    }
  }

  return { name: topName, count: topCount };
}

function findUserWithMostFriends(cityUsers: User[]): MostFriendsUser {
  let topUser = cityUsers[0];

  for (const user of cityUsers.slice(1)) {
    const userFriendCount = user.friends.length;
    const topFriendCount = topUser.friends.length;

    if (
      userFriendCount > topFriendCount ||
      (userFriendCount === topFriendCount && user.id < topUser.id)
    ) {
      topUser = user;
    }
  }

  return {
    id: topUser.id,
    name: topUser.name,
    friendCount: topUser.friends.length,
  };
}

export function computeStats(users: User[]): StatsResult {
  const byCity = groupUsersByCity(users);

  const averageAgePerCity: Record<string, number> = {};
  const averageFriendsPerCity: Record<string, number> = {};
  const mostFriendsPerCity: Record<string, MostFriendsUser> = {};

  for (const [city, cityUsers] of byCity) {
    averageAgePerCity[city] = average(cityUsers.map((user) => user.age));
    averageFriendsPerCity[city] = average(cityUsers.map((user) => user.friends.length));
    mostFriendsPerCity[city] = findUserWithMostFriends(cityUsers);
  }

  return {
    averageAgePerCity,
    averageFriendsPerCity,
    mostFriendsPerCity,
    mostCommonFirstName: findMostCommon(users.map((user) => user.name)),
  };
}
