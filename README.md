# WarehouseFlow — Home Task

**WarehouseFlow** is a small warehouse management system built with React, Node.js, and MySQL.

The codebase has **5 deliberate bugs**. Your task is to run the application, find every bug, fix it, and document what you did.

---

## Prerequisites

- [Podman](https://podman.io/) — container engine (replaces Docker)
- `podman-compose` — `pip install podman-compose`
- Node.js 20+ — for running tests outside containers
- A terminal and a browser

> **macOS only:** run `podman machine init && podman machine start` once to set up the VM before your first `podman compose` command.

---

## Running the Application

```bash
cd base_project
podman compose up --build -d
```

| Service | URL |
|---|---|
| UI | http://localhost:4300 |
| API | http://localhost:3301 |
| MySQL | localhost:3311 |

Log in with **admin / admin123**.

Click **Reset Demo State** in the header to restore the original data before testing each bug.

### Stop

```bash
podman compose down
```

---

## The Task

### Step 1 — Run and explore

Start the app and click through every page. Use `ISSUE_REPRODUCTION_GUIDE.md` to reproduce each of the 5 bugs in the browser before touching the code.

### Step 2 — Fix all 5 bugs

Apply the minimal code change that corrects the behaviour. Do not refactor or improve code that is unrelated to the bug.

The server restarts automatically inside the container when you change a JS file **only if** you add a file watcher. The simplest approach is to stop and restart the stack after each fix:

```bash
podman compose down && podman compose up --build -d
```

### Step 3 — Write at least one test per bug

Run server tests:

```bash
cd base_project/server
npm test
```

Run client tests:

```bash
cd base_project/client
npm test
```

Existing tests live in:
- `base_project/server/test/`
- `base_project/client/src/lib/`

Add your new tests there.

### Step 4 — Write a short solution summary

Create a file called `SOLUTION.md` in the `base_project` folder. For each bug, write:

```
## Bug N — <one-line title>

**What was wrong:** ...
**Root cause:** file path, what the code did instead of what it should do
**Fix:** the change you made
**Test:** what your test covers
```

---

## Submitting Your Solution

1. Create a **public repository** on GitHub or GitLab.
2. Push your solution to `main`.
3. Send the following to your contact at Luminor:
   - Repository URL
   - Your `SOLUTION.md` (can be a copy-paste or a link to the file in the repo)
   - Approximate time spent

---

## Evaluation Criteria

| Area | What we look at |
|---|---|
| Bug identification | Did you find and correctly describe all 5 bugs? |
| Fix quality | Is the fix minimal and correct? Does it break nothing else? |
| Test quality | Does the test actually fail before the fix and pass after? |
| Communication | Is `SOLUTION.md` clear and concise? |
| Git hygiene | Logical commits with readable messages |

---

## Hints

- The application layer follows a strict pattern: `controller → service → repository`. Most server-side bugs live in one of those layers.
- One bug is purely in React client-side state. The server returns the correct data.
- One bug is in SQL query construction.
- One bug involves date/time handling across timezones.
- After `Reset Demo State`, the data is always restored to the same known state — use this freely.
