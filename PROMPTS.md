# Prompts

All prompts used with AI assistance during this assignment.

## Session 1 — 2026-08-17

### Prompt 1

> Review the assignment PDF to understand the context of this project.

**Context:** Initial review of the assignment spec.

### Prompt 2

> Let's go ahead and start with the boilerplate for the repo.

**Context:** Scaffold TypeScript CLI project with fetch client, stats module, and submission files.

### Prompt 3

> Fair assessment, I agree. Invoking the function results in hitting the catch block in client.ts, line 23. Take a look at the response being received and try to spot the issue.

**Context:** Debug JSON parsing failure. Discovered the API returns NDJSON (one object per line) rather than a wrapped JSON array; fixed `client.ts` to parse both formats.

### Prompt 4

> Now let's do a couple enhancements:
> 1) Limit response values to a single decimal place.
> 2) Add functionality to handle calculation #3 from ASSIGNMENT.md - the user with the most friends per city

**Context:** Added `roundToOneDecimal()` for averages and `mostFriendsPerCity` output with lowest-`id` tie-breaking.

### Prompt 5

> Let's now move on to calculation #4: the most common first name in all cities.

**Context:** Added `mostCommonFirstName` with name/count output and alphabetical tie-breaking via a reusable `findMostCommon()` helper.

## Session 2 — 2026-08-18

### Prompt 6

> Update PROMPTS.md to include all missing prompts up to this point.

**Context:** Backfill this file with all prompts from both sessions.
