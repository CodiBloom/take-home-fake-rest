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

**Context:** Backfill this file with all prompts from both sessions through Prompt 16.

### Prompt 17

> Updated file looks good. Commit and push to remote.

**Context:** Committed and pushed `update-prompts-md` with the full prompt history.

### Prompt 18

> I missed a **REDACTED** reference in Prompt 1 of PROMPTS.md. Squash the previous commit, add a new commit with my change and push to remote

**Context:** Amended the `update-prompts-md` commit to redact Prompt 1 and force-pushed the branch.

### Prompt 19

> We need to add test coverage. Let's start by focusing on covering the functions parseUsers and fetchUsers.

**Context:** Added `test/client.test.ts` with Node's built-in test runner, exported `parseUsers`, and added `npm test`.

### Prompt 20

> Before we move on to other coverage, move existing tests into it's own directory (i.e. it shouldn't live in ./src) and we also need to create a new branch: add-test-coverage

**Context:** Moved tests to `test/`, created the `add-test-coverage` branch, and updated `tsconfig.json` / `npm test`.

### Prompt 21

> For the next bit of coverage, let's add testing for roundToOneDecimal and average from stats.ts

**Context:** Exported helpers and added unit tests in `test/stats.test.ts`.

### Prompt 22

> Add coverage for groupUsersByCity.

**Context:** Exported `groupUsersByCity` and added grouping tests.

### Prompt 23

> New tests look fine. Now add coverage for findUserWithMostFriends

**Context:** Exported `findUserWithMostFriends` and added per-city tie-breaking tests.

### Prompt 24

> New tests look good. Now add coverage for collectAllFriendHobbies

**Context:** Exported `collectAllFriendHobbies` and added hobby-collection tests.

### Prompt 25

> Looks good. Let's finish off coverage for stats.ts by adding tests for findMostCommon and findMostCommonHobby

**Context:** Exported both helpers and added frequency/tie-breaking tests.

### Prompt 26

> And finally add coverage for computeStats

**Context:** Added integration tests covering all five CLI output fields, including empty-input behavior.

### Prompt 27

> Now let's finish up with coverage for index.ts

**Context:** Exported `main`/`printUsage`, added injectable CLI dependencies, and added `test/index.test.ts`.

### Prompt 28

> Test coverage looks good. Update PROMPTS.md with all prompts that have processed since the last update.

**Context:** Backfill this file with prompts from Prompt 17 through Prompt 28.
