import type { MostCommonHobby, MostCommonName, MostFriendsUser, StatsResult, User } from "./types.js";

interface CityAccumulator {
  ageSum: number;
  count: number;
  friendsSum: number;
  mostFriends: MostFriendsUser;
}

export interface StatsAccumulator {
  cities: Map<string, CityAccumulator>;
  nameCounts: Map<string, number>;
  hobbyCounts: Map<string, number>;
}

export function groupUsersByCity(users: User[]): Map<string, User[]> {
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

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return roundToOneDecimal(sum / values.length);
}

export function findMostCommon(values: string[]): MostCommonName {
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

export function findMostCommonFromCounts(counts: Map<string, number>): MostCommonName {
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

export function findMostCommonHobby(hobbies: string[]): MostCommonHobby {
  const result = findMostCommon(hobbies);

  return {
    hobby: result.name,
    count: result.count,
  };
}

export function collectAllFriendHobbies(users: User[]): string[] {
  const hobbies: string[] = [];

  for (const user of users) {
    for (const friend of user.friends) {
      hobbies.push(...friend.hobbies);
    }
  }

  return hobbies;
}

export function findUserWithMostFriends(cityUsers: User[]): MostFriendsUser {
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

function shouldReplaceMostFriends(
  current: MostFriendsUser,
  candidate: User,
): boolean {
  const candidateFriendCount = candidate.friends.length;

  return (
    candidateFriendCount > current.friendCount ||
    (candidateFriendCount === current.friendCount && candidate.id < current.id)
  );
}

export function createStatsAccumulator(): StatsAccumulator {
  return {
    cities: new Map(),
    nameCounts: new Map(),
    hobbyCounts: new Map(),
  };
}

export function addUserToStats(accumulator: StatsAccumulator, user: User): void {
  const cityAccumulator = accumulator.cities.get(user.city);

  if (cityAccumulator) {
    cityAccumulator.ageSum += user.age;
    cityAccumulator.count += 1;
    cityAccumulator.friendsSum += user.friends.length;

    if (shouldReplaceMostFriends(cityAccumulator.mostFriends, user)) {
      cityAccumulator.mostFriends = {
        id: user.id,
        name: user.name,
        friendCount: user.friends.length,
      };
    }
  } else {
    accumulator.cities.set(user.city, {
      ageSum: user.age,
      count: 1,
      friendsSum: user.friends.length,
      mostFriends: {
        id: user.id,
        name: user.name,
        friendCount: user.friends.length,
      },
    });
  }

  accumulator.nameCounts.set(
    user.name,
    (accumulator.nameCounts.get(user.name) ?? 0) + 1,
  );

  for (const friend of user.friends) {
    for (const hobby of friend.hobbies) {
      accumulator.hobbyCounts.set(
        hobby,
        (accumulator.hobbyCounts.get(hobby) ?? 0) + 1,
      );
    }
  }
}

export function finalizeStats(accumulator: StatsAccumulator): StatsResult {
  const averageAgePerCity: Record<string, number> = {};
  const averageFriendsPerCity: Record<string, number> = {};
  const mostFriendsPerCity: Record<string, MostFriendsUser> = {};

  for (const [city, cityAccumulator] of accumulator.cities) {
    averageAgePerCity[city] = roundToOneDecimal(
      cityAccumulator.ageSum / cityAccumulator.count,
    );
    averageFriendsPerCity[city] = roundToOneDecimal(
      cityAccumulator.friendsSum / cityAccumulator.count,
    );
    mostFriendsPerCity[city] = cityAccumulator.mostFriends;
  }

  const mostCommonFirstName = findMostCommonFromCounts(accumulator.nameCounts);
  const mostCommonHobbyResult = findMostCommonFromCounts(accumulator.hobbyCounts);

  return {
    averageAgePerCity,
    averageFriendsPerCity,
    mostFriendsPerCity,
    mostCommonFirstName,
    mostCommonHobby: {
      hobby: mostCommonHobbyResult.name,
      count: mostCommonHobbyResult.count,
    },
  };
}

export async function computeStatsFromStream(
  users: AsyncIterable<User>,
): Promise<StatsResult> {
  const accumulator = createStatsAccumulator();

  for await (const user of users) {
    addUserToStats(accumulator, user);
  }

  return finalizeStats(accumulator);
}

export function computeStats(users: User[]): StatsResult {
  const accumulator = createStatsAccumulator();

  for (const user of users) {
    addUserToStats(accumulator, user);
  }

  return finalizeStats(accumulator);
}
