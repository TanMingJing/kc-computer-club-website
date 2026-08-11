---
name: oss-maintainer-gate
description: Evidence-first maintainer and release-readiness workflow for this repository. Use when Codex is asked to review a pull request or change, prepare a release, validate repository readiness, inspect maintainer/security risk, or produce a release decision with reproducible evidence.
---

# OSS Maintainer Gate

Use this workflow to produce a fail-closed maintainer decision from repository evidence.

## Workflow

1. Establish scope before judging readiness.
   - Inspect the current branch, working tree, and relevant diff.
   - Identify which product and security boundaries changed.
   - Do not trust prior PASS/READY claims as evidence.

2. Read the repository-specific boundaries when relevant.
   - Read `references/security-boundaries.md` for authentication, authorization, Appwrite/API, uploads, secrets, and privileged-write surfaces.
   - Read `references/release-checklist.md` before a release decision.

3. Run deterministic preflight checks.
   - Execute `node .agents/skills/oss-maintainer-gate/scripts/preflight.mjs` from the repository root.
   - Let the script discover available package scripts from `package.json`; do not invent checks that do not exist.
   - Treat a failing available mandatory check as a `BLOCKER`.
   - If no automated test script exists, report `TEST_COVERAGE_NOT_AVAILABLE`; never convert missing coverage into PASS.

4. Review security-sensitive changes explicitly.
   - Trace authentication and session handling when auth code changes.
   - Verify server-side authorization for admin or privileged writes.
   - Review Appwrite/API permission assumptions, environment-secret handling, and upload/storage boundaries when touched.
   - Do not expose credentials, student data, or production secrets while gathering evidence.

5. Classify findings.
   - `BLOCKER`: mandatory check failure, broken build/type/lint/format gate, or a release-blocking correctness/security issue.
   - `WARNING`: incomplete coverage, missing hardening, security-sensitive change requiring human review, or non-blocking maintainability risk.
   - `PASS`: an explicitly checked condition succeeded.

6. Produce the final maintainer report with:
   - scope and changed areas;
   - commands executed and exit statuses;
   - blockers and warnings;
   - known coverage gaps;
   - release decision: `READY`, `READY_WITH_WARNINGS`, or `BLOCKED`.

## Hard rules

- Never report `READY` when a `BLOCKER` exists.
- Never infer test coverage from build, lint, formatting, or type checking.
- Never weaken a production security control merely to make the gate pass.
- Never modify production data or secrets as part of review.
- Keep remediation outside the review unless the user explicitly authorizes fixes.
