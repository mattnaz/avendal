# Claude Code Todo

A tiny to-do list app (Express + vanilla JS) built as a sandbox for learning [Claude Code](https://claude.com/claude-code).

## Run it

```
npm install
npm start
```

Then open http://localhost:3000

## Run tests

```
npm test
```

## Structure

- `src/server.js` — Express app and routes
- `src/todoStore.js` — in-memory data layer (todos live only in memory, reset on restart)
- `public/` — frontend (HTML/CSS/JS, no build step)
- `tests/todoStore.test.js` — unit tests using Node's built-in test runner

## Exercises to try with Claude Code

These are small, safe tasks meant to exercise common Claude Code workflows:

1. **Read & explain** — ask Claude to explain how a request flows from `public/app.js` through `src/server.js` to `src/todoStore.js`.
2. **Add a feature** — ask Claude to add an "edit todo text" feature (new API route + UI).
3. **Add persistence** — ask Claude to swap the in-memory store for a JSON file or SQLite database.
4. **Write more tests** — ask Claude to add tests for the Express routes (e.g. with `supertest`).
5. **Refactor** — ask Claude to add due dates or priority levels to todos, updating the store, API, and UI together.
6. **Debug** — intentionally break something (e.g. rename a field) and ask Claude to find and fix it.
7. **Git workflow** — ask Claude to commit changes after each exercise, and review a diff before committing.
