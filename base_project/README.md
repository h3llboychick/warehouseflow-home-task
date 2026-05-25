# WarehouseFlow Base Project

`base_project` mimics a production-like warehouse application with five known bugs.

It is intentionally larger than the prototype repos so you can practice:

- isolating the relevant code path
- copying only the needed files into a prototype
- reproducing and fixing the issue outside the main codebase
- copying the tested fix back

## Stack

- React client
- Node.js / Express API
- MySQL 8

## Run

```bash
cd base_project
podman compose up --build
```

Endpoints:

- client: `http://localhost:4300`
- api: `http://localhost:3301`
- mysql: `localhost:3311`

## Recent Log Scanning

The base project now emits structured JSON log lines for request completion, request failures, and process-level crashes. That gives you enough signal to run a lightweight scanner without adding Loki, ELK, or another log engine.

Start the stack first:

```bash
cd base_project
podman compose up --build -d
```

Scan the last 15 minutes of `server`, `mysql`, and `client` logs:

```bash
node tools/scan-recent-logs.mjs --since 15m
```

Create a GitHub issue directly when findings exist:

```bash
node tools/scan-recent-logs.mjs --since 15m --create-github-issue
```

Outputs are written to:

- `reports/log-scan/latest-report.md`
- `reports/log-scan/latest-issue.md`
- `reports/log-scan/latest-summary.json`

Exit codes:

- `0`: no suspicious events found
- `2`: suspicious events found and an issue-ready report was written

If `--create-github-issue` is used, the script:

- checks for an open issue with the same fingerprint
- creates a new GitHub issue only when no matching open issue exists
- prints the created issue URL or the existing matching issue URL

GitHub Actions automation is in `.github/workflows/base-project-log-scan.yml`. It can:

- start the stack
- generate light traffic
- scan recent logs
- open an issue when the scanner finds a new fingerprint

Use the scheduled workflow on a self-hosted runner or a long-lived staging host if you want truly recent logs from a durable environment. GitHub-hosted runners are ephemeral, so scheduled runs there only see logs generated during that workflow run.

## Authentication

The base project now uses token-based authentication with role checks.

Default users:

- `admin` / `admin123` (role: `admin`)
- `operator` / `operator123` (role: `operator`)

`admin` can access the `User Admin` page and create users.

## Known Bugs

1. Allocation ignores `reserved_quantity`
   Base files:
   `server/src/services/shipmentService.js`
   `server/src/repositories/shipmentRepository.js`
   Prototype:
   `../prototype_for_bug_1`

2. Shipment dashboard ignores timezone
   Base files:
   `server/src/services/shipmentService.js`
   `server/src/repositories/shipmentRepository.js`
   Prototype:
   `../prototype_for_bug_2`

3. Inventory search breaks on blank aisle filter
   Base files:
   `server/src/services/inventoryService.js`
   Prototype:
   `../prototype_for_bug_3`

4. Cycle count review UI keeps the open-review summary stale after one review is approved
   Base files:
   `client/src/lib/cycleCountState.js`
   `client/src/App.jsx`
   Prototype:
   `../prototype_for_bug_4`

5. Reorder report paginates before grouping, so one vendor can be split across pages
   Base files:
   `server/src/services/reorderService.js`
   `server/src/repositories/reorderRepository.js`
   Prototype:
   `../prototype_for_bug_5`
