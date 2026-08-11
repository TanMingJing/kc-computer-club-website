#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const jsonOutIndex = args.indexOf('--json-out');
const jsonOut = jsonOutIndex >= 0 ? args[jsonOutIndex + 1] : null;

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.capture === false ? 'inherit' : 'pipe',
    env: process.env,
  });

  return {
    command: [command, ...commandArgs].join(' '),
    status: typeof result.status === 'number' ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error ? String(result.error.message || result.error) : null,
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function unique(values) {
  return [...new Set(values)].filter(Boolean);
}

const findings = [];
const checks = [];
let pkg = null;

try {
  pkg = readJson('package.json');
} catch (error) {
  findings.push({
    severity: 'BLOCKER',
    code: 'PACKAGE_JSON_UNREADABLE',
    message: `package.json could not be read: ${error.message}`,
  });
}

function gitAvailable() {
  const result = run('git', ['rev-parse', '--is-inside-work-tree']);
  return result.status === 0 && result.stdout.trim() === 'true';
}

function gitLines(commandArgs) {
  const result = run('git', commandArgs);
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

let changedFiles = [];
let diffBase = process.env.MAINTAINER_GATE_BASE || '';

if (gitAvailable()) {
  if (diffBase) {
    const diff = run('git', ['diff', '--name-only', `${diffBase}...HEAD`]);
    if (diff.status === 0) {
      changedFiles.push(...diff.stdout.split(/\r?\n/).filter(Boolean));
    } else {
      findings.push({
        severity: 'WARNING',
        code: 'DIFF_BASE_UNAVAILABLE',
        message: `Could not compare ${diffBase}...HEAD; falling back to local/latest-commit scope.`,
      });
      diffBase = '';
    }
  }

  if (!diffBase) {
    changedFiles.push(...gitLines(['diff', '--name-only']));
    changedFiles.push(...gitLines(['diff', '--cached', '--name-only']));

    if (changedFiles.length === 0) {
      const parent = run('git', ['rev-parse', 'HEAD^']);
      if (parent.status === 0) {
        diffBase = parent.stdout.trim();
        changedFiles.push(...gitLines(['diff', '--name-only', `${diffBase}...HEAD`]));
      }
    }
  }
}

changedFiles = unique(changedFiles).sort();

const areaRules = [
  {
    name: 'authentication-and-sessions',
    matches: (file) =>
      file.startsWith('src/app/api/auth/') ||
      file.startsWith('src/app/auth/') ||
      file === 'src/lib/admin-session.ts',
  },
  {
    name: 'admin-and-privileged-ui',
    matches: (file) => file.startsWith('src/app/admin/'),
  },
  {
    name: 'server-api-and-appwrite',
    matches: (file) =>
      file.startsWith('src/app/api/') ||
      file.startsWith('src/services/') ||
      file.startsWith('scripts/'),
  },
  {
    name: 'uploads-and-storage',
    matches: (file) => /(^|\/)(upload|uploads)(\/|\.|$)/i.test(file) || /storage/i.test(file),
  },
  {
    name: 'configuration-and-secrets',
    matches: (file) =>
      /^\.env(\.|$)/.test(file) ||
      /config/i.test(file) ||
      file === 'src/lib/admin-session.ts',
  },
  {
    name: 'student-operational-data',
    matches: (file) =>
      /(attendance|student|project|homework|signup|activity|activities)/i.test(file),
  },
];

const affectedAreas = areaRules
  .filter((rule) => changedFiles.some((file) => rule.matches(file)))
  .map((rule) => rule.name);

if (affectedAreas.length > 0) {
  findings.push({
    severity: 'WARNING',
    code: 'SECURITY_REVIEW_REQUIRED',
    message: `Security-sensitive boundaries changed: ${affectedAreas.join(', ')}. Perform targeted human/Codex review before release.`,
  });
}

for (const file of changedFiles) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) continue;
  try {
    const text = fs.readFileSync(absolute, 'utf8');
    if (/process\.env\.|APPWRITE_API_KEY|ADMIN_SESSION_SECRET/.test(text)) {
      if (!affectedAreas.includes('configuration-and-secrets')) {
        affectedAreas.push('configuration-and-secrets');
      }
    }
  } catch {
    // Ignore binary or unreadable changed files; other checks remain authoritative.
  }
}

if (!fs.existsSync(path.join(root, '.env.example'))) {
  findings.push({
    severity: 'WARNING',
    code: 'ENV_EXAMPLE_MISSING',
    message: 'README setup instructions reference .env.example, but the file is not present in the repository.',
  });
}

if (pkg?.scripts) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const mandatory = ['type-check', 'lint', 'format:check', 'build'];

  for (const script of mandatory) {
    if (!pkg.scripts[script]) {
      checks.push({ name: script, command: null, status: 'NOT_AVAILABLE', exitCode: null });
      findings.push({
        severity: 'WARNING',
        code: `CHECK_NOT_AVAILABLE_${script.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
        message: `npm script '${script}' is not available; this quality signal could not be evaluated.`,
      });
      continue;
    }

    process.stdout.write(`\n[maintainer-gate] running npm run ${script}\n`);
    const result = run(npm, ['run', script], { capture: false });
    const passed = result.status === 0;
    checks.push({
      name: script,
      command: `npm run ${script}`,
      status: passed ? 'PASS' : 'FAIL',
      exitCode: result.status,
    });

    if (!passed) {
      findings.push({
        severity: 'BLOCKER',
        code: `CHECK_FAILED_${script.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
        message: `Mandatory available check failed: npm run ${script} (exit ${result.status}).`,
      });
    }
  }

  const testCandidates = ['test', 'test:ci', 'test:unit'];
  const testScript = testCandidates.find((name) => pkg.scripts[name]);

  if (testScript) {
    process.stdout.write(`\n[maintainer-gate] running npm run ${testScript}\n`);
    const result = run(npm, ['run', testScript], { capture: false });
    const passed = result.status === 0;
    checks.push({
      name: testScript,
      command: `npm run ${testScript}`,
      status: passed ? 'PASS' : 'FAIL',
      exitCode: result.status,
    });

    if (!passed) {
      findings.push({
        severity: 'BLOCKER',
        code: 'AUTOMATED_TESTS_FAILED',
        message: `Automated test script failed: npm run ${testScript} (exit ${result.status}).`,
      });
    }
  } else {
    checks.push({ name: 'automated-tests', command: null, status: 'NOT_AVAILABLE', exitCode: null });
    findings.push({
      severity: 'WARNING',
      code: 'TEST_COVERAGE_NOT_AVAILABLE',
      message: 'No dedicated automated test script is present in package.json. Build/lint/type/format success must not be treated as test coverage.',
    });
  }
}

const blockerCount = findings.filter((finding) => finding.severity === 'BLOCKER').length;
const warningCount = findings.filter((finding) => finding.severity === 'WARNING').length;
const decision = blockerCount > 0 ? 'BLOCKED' : warningCount > 0 ? 'READY_WITH_WARNINGS' : 'READY';

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  scope: {
    diffBase: diffBase || null,
    changedFiles,
    affectedAreas: unique(affectedAreas).sort(),
  },
  checks,
  findings,
  summary: {
    blockers: blockerCount,
    warnings: warningCount,
    decision,
  },
};

process.stdout.write('\n=== OSS MAINTAINER GATE ===\n');
process.stdout.write(`DECISION: ${decision}\n`);
process.stdout.write(`BLOCKERS: ${blockerCount}\n`);
process.stdout.write(`WARNINGS: ${warningCount}\n`);
process.stdout.write(`CHANGED_FILES: ${changedFiles.length}\n`);
process.stdout.write(`AFFECTED_AREAS: ${report.scope.affectedAreas.join(', ') || 'none detected'}\n`);

for (const check of checks) {
  process.stdout.write(`CHECK ${check.status}: ${check.command || check.name}\n`);
}
for (const finding of findings) {
  process.stdout.write(`${finding.severity} ${finding.code}: ${finding.message}\n`);
}

if (jsonOut) {
  const target = path.resolve(root, jsonOut);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`REPORT: ${path.relative(root, target) || target}\n`);
}

process.exitCode = blockerCount > 0 ? 1 : 0;
