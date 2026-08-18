# Fake REST Client

A command-line tool that fetches user data from a JSON REST endpoint and computes per-city statistics.

## Requirements

- Node.js 18 or later

## Setup

```bash
npm install
npm run build
```

## Usage

```bash
# Development (no build step)
npm run dev -- http://localhost:3000

# Production
npm start -- http://localhost:3000

# Pipe into jq
npm start -- http://localhost:3000 | jq '.averageAgePerCity'
```

The endpoint URL is passed as the first command-line argument. Results are written as JSON to stdout; errors go to stderr.

## Output

The tool computes the following metrics:

1. **Average age per city** — `averageAgePerCity`
2. **Average number of friends per city** — `averageFriendsPerCity`
3. **User with the most friends per city** — `mostFriendsPerCity`
4. **Most common first name across all cities** — `mostCommonFirstName`

All average values are rounded to one decimal place. When multiple users in a city share the highest friend count, the user with the lowest `id` is chosen. When multiple first names tie for the highest count, the name that comes first alphabetically is chosen.

Example output:

```json
{
  "averageAgePerCity": {
    "Orlando": 62.3,
    "Miami Beach": 71.0
  },
  "averageFriendsPerCity": {
    "Orlando": 2.0,
    "Miami Beach": 2.5
  },
  "mostFriendsPerCity": {
    "Orlando": {
      "id": 200004,
      "name": "Sophie",
      "friendCount": 5
    },
    "Miami Beach": {
      "id": 200002,
      "name": "Daniel",
      "friendCount": 2
    }
  },
  "mostCommonFirstName": {
    "name": "Michael",
    "count": 842
  }
}
```

## API Data Format

The endpoint returns user data as **newline-delimited JSON** (NDJSON/JSONL): one user object per line, not a wrapped JSON array. Example:

```
{"id":0,"name":"Elijah","city":"Austin","age":78,"friends":[...]}
{"id":1,"name":"Noah","city":"Boston","age":97,"friends":[...]}
```

Each object has the following shape:

| Field     | Type     | Description                          |
|-----------|----------|--------------------------------------|
| `id`      | number   | Unique user identifier               |
| `name`    | string   | User's first name                    |
| `age`     | number   | User's age in years                  |
| `city`    | string   | City the user lives in               |
| `friends` | array    | List of friend objects (may be empty)|

Each friend object:

| Field     | Type     | Description                    |
|-----------|----------|--------------------------------|
| `name`    | string   | Friend's first name            |
| `hobbies` | string[] | List of hobby name strings     |

The dataset changes on every request. There is no pagination or authentication.

## Project Structure

```
src/
  index.ts    CLI entry point
  client.ts   HTTP fetch and response validation
  stats.ts    Statistical calculations
  types.ts    TypeScript type definitions
```

## Security Notes

- The tool accepts any URL via the command line. Only pass trusted endpoints.
- No credentials or secrets are stored. The test API serves public mock data.
- Response parsing validates NDJSON or JSON array payloads before processing.
- Network errors and non-2xx HTTP responses are reported and exit with a non-zero code.

## AI Usage

See [PROMPTS.md](./PROMPTS.md) for the prompts used during development.
See [AGENTS.md](./AGENTS.md) for the Cursor agent configuration.
