# Prompts

All prompts used with AI assistance during this assignment.

## Session 1 — 2026-08-17

### Prompt 1

> Review **REDACTED**-coding-test.pdf to understand the context of this assignment.

**Context:** Initial review of the assignment spec. The PDF is generated from `README.md` via the Makefile.

### Prompt 2

> Let's go ahead and start with the boilerplate for the repo.

**Context:** Scaffold TypeScript CLI project with fetch client, stats module, and submission files.

### Prompt 3

> Invoking the function results in hitting the catch block in client.ts, line 23. Take a look at the response being received and try to spot the issue.

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

**Context:** Backfill this file with prompts from Session 1.

### Prompt 7

> Execute the selected diff-tab commit-and-push action.

**Context:** Staged project files and created the initial commit (`5b3149f`). Push was blocked pending approval; GPG signing also failed.

### Prompt 8

> Commit without signing into repo https://github.com/CodiBloom/**REDACTED**-Fake-REST.git

**Context:** Committed without GPG signing. Push to the named repo was skipped when the approval prompt appeared.

### Prompt 9

> Okay, let's commit and push into https://github.com/CodiBloom/take-home-fake-rest.git -- this is the initial commit so pushing into main is fine.

**Context:** Committed cleanup (removed template files) and pushed two commits to the submission repo.

### Prompt 10

> We need to squash the commits so that the **REDACTED** template files do not show up in the commit history at all.

**Context:** Rewrote history as a single orphan commit containing only the final project files; force-pushed to `main`.

### Prompt 11

> We need to remove every mention of **REDACTED** from the project. It mentions **REDACTED** in the README.md, scan and ensure no other mention of **REDACTED** occurs. Once all instances are located, change them to something like "Fake REST Client", again squash the previous commit to remove mention of this being a client for **REDACTED** take-home assignment, and then force push into the repo so that the history there is also cleansed.

**Context:** Renamed package/CLI to `fake-rest-client` / `fake-rest-stats`, replaced example URLs, scrubbed all **REDACTED** references, and force-pushed a cleansed single-commit history.

### Prompt 12

> Start a new branch: most-common-hobby

**Context:** Created the `most-common-hobby` branch for calculation #5 work.

### Prompt 13

> Add functionality for calculation #5 - the most common hobby of all friends of users in all cities

**Context:** Added `mostCommonHobby` to stats output by collecting all friend hobbies globally and reusing `findMostCommon()`.

### Prompt 14

> Changes look good, commit and push the branch.

**Context:** Committed and pushed `most-common-hobby` (`a90c60d`) to GitHub.

### Prompt 15

> Start a new branch: update-prompts-md

**Context:** Created the `update-prompts-md` branch.

### Prompt 16

> Now update PROMPTS.md with all missing prompts up to this point

**Context:** Backfill this file with all prompts from both sessions through Prompt 18.
