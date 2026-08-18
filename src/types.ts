export interface Friend {
  name: string;
  hobbies: string[];
}

export interface User {
  id: number;
  name: string;
  age: number;
  city: string;
  friends: Friend[];
}

export interface StatsResult {
  averageAgePerCity: Record<string, number>;
  averageFriendsPerCity: Record<string, number>;
  mostFriendsPerCity: Record<string, MostFriendsUser>;
  mostCommonFirstName: MostCommonName;
}

export interface MostCommonName {
  name: string;
  count: number;
}

export interface MostFriendsUser {
  id: number;
  name: string;
  friendCount: number;
}
