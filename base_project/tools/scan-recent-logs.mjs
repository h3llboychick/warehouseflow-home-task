#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const defaultComposeFile = path.join(projectDir, "docker-compose.yml");
const defaultOutputDir = path.join(projectDir, "reports", "log-scan");

function parseArgs(argv) {
  const options = {
    since: "15m",
    composeFile: defaultComposeFile,
    outputDir: defaultOutputDir,
    services: ["server", "mysql", "client"],
    titlePrefix: "[base_project] Log scan detected suspicious errors",
    createGithubIssue: false,
    issueLabels: ["log-scan", "triage"]
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const nextValue = argv[index + 1];

    if (token === "--since" && nextValue) {
      options.since = nextValue;
      index += 1;
      continue;
    }

    if (token === "--compose-file" && nextValue) {
      options.composeFile = path.resolve(nextValue);
      index += 1;
      continue;
    }

    if (token === "--output-dir" && nextValue) {
      options.outputDir = path.resolve(nextValue);
      index += 1;
      continue;
    }

    if (token === "--services" && nextValue) {
      options.services = nextValue.split(",").map((value) => value.trim()).filter(Boolean);
      index += 1;
      continue;
    }

    if (token === "--title-prefix" && nextValue) {
      options.titlePrefix = nextValue;
      index += 1;
      continue;
    }

    if (token === "--create-github-issue") {
      options.createGithubIssue = true;
      continue;
    }

    if (token === "--issue-labels" && nextValue) {
      options.issueLabels = nextValue.split(",").map((value) => value.trim()).filter(Boolean);
      index += 1;
    }
  }

  return options;
}

function readDockerLogs({ composeFile, service, since }) {
  try {
    return execFileSync(
      "podman",
      ["compose", "-f", composeFile, "logs", "--timestamps", "--no-color", "--since", since, service],
      { cwd: projectDir, encoding: "utf8" }
    );
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`Failed to read podman logs for ${service}: ${output || error.message}`);
  }
}

function parseStructuredLog(message) {
  if (!message.startsWith("{")) {
    return null;
  }

  try {
    return JSON.parse(message);
  } catch {
    return null;
  }
}

function stripDockerTimestampPrefix(message) {
  const firstSpaceIndex = message.indexOf(" ");
  if (firstSpaceIndex === -1) {
    return message;
  }

  const possibleTimestamp = message.slice(0, firstSpaceIndex);
  if (/^\d{4}-\d{2}-\d{2}T/.test(possibleTimestamp)) {
    return message.slice(firstSpaceIndex + 1).trimStart();
  }

  return message;
}

function classifyStructuredEntry(service, line, record) {
  const level = String(record.level || "").toLowerCase();
  const statusCode = Number(record.status_code);

  if (record.event === "http_request_failed" || record.event === "process_unhandled_rejection" || record.event === "process_uncaught_exception") {
    return {
      service,
      severity: "high",
      category: "application-error",
      summary: record.error?.message || record.event,
      evidence: line
    };
  }

  if (record.event === "http_request_completed" && statusCode >= 500) {
    return {
      service,
      severity: "medium",
      category: "http-5xx",
      summary: `${record.method} ${record.path} returned ${statusCode}`,
      evidence: line
    };
  }

  if (level === "error") {
    return {
      service,
      severity: "medium",
      category: "application-error",
      summary: record.event || "error log entry",
      evidence: line
    };
  }

  return null;
}

function classifyPlainEntry(service, line) {
  const patterns = [
    { regex: /\b(ERROR|Error|Exception|Unhandled|UnhandledPromiseRejection)\b/, severity: "high", category: "runtime-error" },
    { regex: /\b(ER_[A-Z_]+|SQLSTATE|deadlock|lock wait timeout|too many connections)\b/i, severity: "high", category: "database-error" },
    { regex: /\b(500|failed|failure|crash(ed)?|timeout)\b/i, severity: "medium", category: "service-failure" }
  ];

  const match = patterns.find((pattern) => pattern.regex.test(line));
  if (!match) {
    return null;
  }

  return {
    service,
    severity: match.severity,
    category: match.category,
    summary: line.trim().slice(0, 140),
    evidence: line
  };
}

function normalizeLogLine(rawLine, service) {
  const trimmed = rawLine.trim();
  if (!trimmed) {
    return null;
  }

  const servicePrefix = `${service}-1  | `;
  const unprefixed = trimmed.startsWith(servicePrefix) ? trimmed.slice(servicePrefix.length) : trimmed;
  const message = stripDockerTimestampPrefix(unprefixed);
  return { raw: trimmed, message };
}

function collectFindings({ service, output }) {
  const findings = [];

  for (const rawLine of output.split("\n")) {
    const normalized = normalizeLogLine(rawLine, service);
    if (!normalized) {
      continue;
    }

    const record = parseStructuredLog(normalized.message);
    const finding = record
      ? classifyStructuredEntry(service, normalized.raw, record)
      : classifyPlainEntry(service, normalized.raw);

    if (finding) {
      findings.push(finding);
    }
  }

  return findings;
}

function summarizeFindings(findings) {
  const grouped = new Map();

  for (const finding of findings) {
    const key = `${finding.service}|${finding.category}|${finding.summary}`;
    const bucket = grouped.get(key) || {
      service: finding.service,
      category: finding.category,
      severity: finding.severity,
      summary: finding.summary,
      evidence: []
    };

    if (finding.severity === "high") {
      bucket.severity = "high";
    }

    if (bucket.evidence.length < 3) {
      bucket.evidence.push(finding.evidence);
    }

    grouped.set(key, bucket);
  }

  return [...grouped.values()];
}

function fingerprintFindings(findings) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(findings.map((finding) => ({
      service: finding.service,
      category: finding.category,
      severity: finding.severity,
      summary: finding.summary
    }))))
    .digest("hex")
    .slice(0, 12);
}

function buildMarkdownReport({ since, incidents, fingerprint, issueTitle }) {
  if (incidents.length === 0) {
    return [
      "# Base Project Log Scan",
      "",
      `Window: last ${since}`,
      "",
      "No suspicious log events were detected."
    ].join("\n");
  }

  const lines = [
    "# Base Project Log Scan",
    "",
    `Window: last ${since}`,
    `Fingerprint: ${fingerprint}`,
    `Suggested issue title: ${issueTitle}`,
    "",
    "## Findings"
  ];

  for (const incident of incidents) {
    lines.push("");
    lines.push(`### ${incident.severity.toUpperCase()} ${incident.service} ${incident.category}`);
    lines.push(incident.summary);
    lines.push("");
    lines.push("```text");
    for (const evidenceLine of incident.evidence) {
      lines.push(evidenceLine);
    }
    lines.push("```");
  }

  return lines.join("\n");
}

function buildIssueBody({ since, incidents, fingerprint }) {
  const lines = [
    "## Automated log scan detected suspicious events",
    "",
    `- Scan window: last ${since}`,
    `- Fingerprint: ${fingerprint}`,
    "",
    "### Findings"
  ];

  if (incidents.length === 0) {
    lines.push("", "No suspicious events were detected.");
    return lines.join("\n");
  }

  for (const incident of incidents) {
    lines.push("");
    lines.push(`- [${incident.severity}] ${incident.service}: ${incident.summary}`);
    for (const evidenceLine of incident.evidence) {
      lines.push(`  - \`${evidenceLine}\``);
    }
  }

  lines.push("");
  lines.push("### Suggested next steps");
  lines.push("1. Reproduce the issue against `application_fixing/base_project`.");
  lines.push("2. Inspect the matching service logs with `podman compose logs --since 30m <service>`.");
  lines.push("3. Add a failing test before patching if this is a code defect.");

  return lines.join("\n");
}

function ensureOutputDir(outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function writeOutputs({ outputDir, reportMarkdown, issueMarkdown, summary }) {
  ensureOutputDir(outputDir);

  fs.writeFileSync(path.join(outputDir, "latest-report.md"), reportMarkdown);
  fs.writeFileSync(path.join(outputDir, "latest-issue.md"), issueMarkdown);
  fs.writeFileSync(path.join(outputDir, "latest-summary.json"), JSON.stringify(summary, null, 2));
}

function createGithubIssue({ outputDir, issueTitle, fingerprint, labels }) {
  const issueBodyFile = path.join(outputDir, "latest-issue.md");
  const searchQuery = `"Fingerprint: ${fingerprint}" in:body is:issue is:open`;

  let existingIssues;
  try {
    existingIssues = execFileSync(
      "gh",
      ["issue", "list", "--state", "open", "--search", searchQuery, "--json", "number,title,url"],
      { cwd: projectDir, encoding: "utf8" }
    );
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`Failed to query GitHub issues with gh: ${output || error.message}`);
  }

  const parsedIssues = JSON.parse(existingIssues);
  if (parsedIssues.length > 0) {
    return {
      created: false,
      reason: "duplicate-fingerprint",
      issue: parsedIssues[0]
    };
  }

  const labelArgs = labels.flatMap((label) => ["--label", label]);

  let createdIssueUrl;
  try {
    createdIssueUrl = execFileSync(
      "gh",
      ["issue", "create", "--title", issueTitle, "--body-file", issueBodyFile, ...labelArgs],
      { cwd: projectDir, encoding: "utf8" }
    ).trim();
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`Failed to create GitHub issue with gh: ${output || error.message}`);
  }

  return {
    created: true,
    issue: {
      url: createdIssueUrl
    }
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const findings = [];

  for (const service of options.services) {
    const output = readDockerLogs({
      composeFile: options.composeFile,
      service,
      since: options.since
    });
    findings.push(...collectFindings({ service, output }));
  }

  const incidents = summarizeFindings(findings);
  const fingerprint = fingerprintFindings(incidents);
  const issueTitle = `${options.titlePrefix} (${fingerprint})`;
  const reportMarkdown = buildMarkdownReport({
    since: options.since,
    incidents,
    fingerprint,
    issueTitle
  });
  const issueMarkdown = buildIssueBody({
    since: options.since,
    incidents,
    fingerprint
  });

  writeOutputs({
    outputDir: options.outputDir,
    reportMarkdown,
    issueMarkdown,
    summary: {
      since: options.since,
      issue_title: issueTitle,
      fingerprint,
      incidents
    }
  });

  if (options.createGithubIssue && incidents.length > 0) {
    const issueResult = createGithubIssue({
      outputDir: options.outputDir,
      issueTitle,
      fingerprint,
      labels: options.issueLabels
    });

    if (issueResult.created) {
      process.stdout.write(`\nGitHub issue created: ${issueResult.issue.url}\n`);
    } else {
      process.stdout.write(`\nGitHub issue already exists for fingerprint ${fingerprint}: ${issueResult.issue.url}\n`);
    }
  }

  process.stdout.write(`${reportMarkdown}\n`);
  process.exitCode = incidents.length > 0 ? 2 : 0;
}

main();
