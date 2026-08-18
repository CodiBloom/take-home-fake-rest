#!/usr/bin/env node

import { fetchUsers } from "./client.js";
import { computeStats } from "./stats.js";

function printUsage(): void {
  console.error("Usage: fake-rest-stats <endpoint-url>");
  console.error("Example: fake-rest-stats http://localhost:3000");
}

async function main(): Promise<void> {
  const endpoint = process.argv[2];

  if (!endpoint) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    new URL(endpoint);
  } catch {
    console.error(`Invalid URL: ${endpoint}`);
    process.exitCode = 1;
    return;
  }

  try {
    const users = await fetchUsers(endpoint);
    const stats = computeStats(users);
    console.log(JSON.stringify(stats, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

main();
