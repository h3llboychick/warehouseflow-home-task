# Log Scanning And GitHub Issues

This repo does not need a separate log engine to support automated recent-log scanning. The smallest working setup is:

1. emit structured logs from `base_project/server`
2. scan `podman compose logs --since <window>`
3. write an issue-ready Markdown report
4. create a GitHub issue only when the scan finds a new fingerprint

## What Was Added

- Structured JSON logs for request completion and request failures in [server/src/index.js](server/src/index.js)
- Log scanner script in [tools/scan-recent-logs.mjs](tools/scan-recent-logs.mjs)
- Issue workflow in [.github/workflows/base-project-log-scan.yml](../.github/workflows/base-project-log-scan.yml)
- Optional issue template in [.github/ISSUE_TEMPLATE/base-project-log-scan.md](../.github/ISSUE_TEMPLATE/base-project-log-scan.md)

## Local Flow

1. Start the app:

   ```bash
   cd ../application_fixing/base_project
   podman compose up --build -d
   ```

2. Exercise the app enough to produce logs:

   ```bash
   curl -s http://127.0.0.1:3301/api/health
   curl -s -X POST http://127.0.0.1:3301/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"admin","password":"admin123"}'
   ```

3. Run the scanner:

   ```bash
   node tools/scan-recent-logs.mjs --since 15m
   ```

4. If you want the scanner to publish directly to GitHub, use:

   ```bash
   node tools/scan-recent-logs.mjs --since 15m --create-github-issue
   ```

5. The script will:

   - write the local report files
   - search for an existing open issue with the same fingerprint
   - create a new issue only if that fingerprint is not already open

6. If you prefer manual issue creation, use the generated files:

   ```bash
   gh issue create \
     --title "$(node -e 'const fs=require(\"fs\"); const data=JSON.parse(fs.readFileSync(\"reports/log-scan/latest-summary.json\",\"utf8\")); process.stdout.write(data.issue_title);')" \
     --body-file reports/log-scan/latest-issue.md \
     --label log-scan \
     --label triage
   ```

## GitHub Actions Options

### Option 1: Manual Or Scheduled Workflow In GitHub

Use [.github/workflows/base-project-log-scan.yml](../.github/workflows/base-project-log-scan.yml).

This is the quickest way to wire log scanning into issues. It works best for:

- smoke checks
- regressions that appear during workflow-generated traffic
- validating the scanner itself

It is weaker for real monitoring because GitHub-hosted runners do not retain prior logs between runs.

### Option 2: Self-Hosted Runner Or Staging Host

This is the more rational production-like setup:

1. run `base_project` continuously on a staging box
2. register a self-hosted GitHub runner on that same box
3. schedule the workflow there
4. let the scanner read the actual recent container logs from that machine
5. open GitHub issues only for new fingerprints

That gives you a durable environment, which makes “recent logs” mean something real.

## Recommended GitHub Labels

Create these labels once in the repository:

- `log-scan`
- `triage`
- `agent-ready`

The first two classify scanner findings. The third works with the existing [.github/workflows/agent-from-issue.yml](../.github/workflows/agent-from-issue.yml) if you want an agent to pick up a confirmed issue and prepare a patch.

## Suggested Operational Flow

1. scanner opens issue
2. human confirms it is not transient noise
3. human adds context or reproduction notes
4. human applies the `agent-ready` label
5. existing issue-to-agent workflow prepares a candidate fix PR

That split is deliberate. Logs are strong enough for detection and triage, but usually not strong enough to justify blind auto-fixes.
