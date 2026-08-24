#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { streamUsers } from "./client.js";
import { computeStatsFromStream } from "./stats.js";
import type { StatsResult, User } from "./types.js";

export interface CliDependencies {
  streamUsers: (endpoint: string) => AsyncGenerator<User>;
  computeStatsFromStream: (users: AsyncIterable<User>) => Promise<StatsResult>;
}

const defaultDependencies: CliDependencies = {
  streamUsers,
  computeStatsFromStream,
};

export function printUsage(): void {
  console.error("Usage: fake-rest-stats <endpoint-url>");
  console.error("Example: fake-rest-stats http://localhost:3000");
}

export async function main(
  argv: readonly string[] = process.argv,
  dependencies: CliDependencies = defaultDependencies,
): Promise<number> {
  const endpoint = argv[2];

  if (!endpoint) {
    printUsage();
    return 1;
  }

  try {
    new URL(endpoint);
  } catch {
    console.error(`Invalid URL: ${endpoint}`);
    return 1;
  }

  try {
    const stats = await dependencies.computeStatsFromStream(
      dependencies.streamUsers(endpoint),
    );
    console.log(JSON.stringify(stats, null, 2));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return 1;
  }
}

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().then((code) => {
    process.exitCode = code;
  });
}
