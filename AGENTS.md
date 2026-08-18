# Agent Instructions

This project was developed using Cursor with the following setup.

## Environment

- **Editor:** Cursor
- **Runtime:** Node.js 20+, TypeScript
- **Skills installed:** Cursor built-in skills (automate, canvas, create-hook, create-rule, create-skill, loop, review-bugbot, review-security, sdk, split-to-prs, statusline, update-cursor-settings)

## Coding Conventions

- TypeScript with strict mode enabled
- ESM modules (`"type": "module"`)
- Native `fetch` for HTTP (no external HTTP library)
- CLI outputs JSON to stdout, errors to stderr
- Keep modules small and focused (client, stats, types)

## Project Goals

Build a command-line REST client that:

1. Accepts the endpoint URL as a command-line argument
2. Fetches and processes user objects from NDJSON or JSON array responses
3. Computes required statistics and outputs JSON
4. Handles errors gracefully
