# Release Checklist

Use this checklist after the deterministic preflight and before declaring a release ready.

## 1. Scope and provenance

- Confirm the exact branch/commit being reviewed.
- Inspect the complete diff for the intended release scope.
- Confirm no unrelated or unexplained files are included.
- Record the commands actually executed; do not reuse results from another commit.

## 2. Deterministic quality gates

Run the repository's available scripts discovered from `package.json`.

Current expected gates include:
- `npm run type-check`
- `npm run lint`
- `npm run format:check`
- `npm run build`

A non-zero exit from an available mandatory gate is a `BLOCKER`.

If no dedicated automated test script exists, record `TEST_COVERAGE_NOT_AVAILABLE` as a warning. Never describe build/lint/type/format checks as automated test coverage.

## 3. Security-sensitive scope

If the diff touches any security boundary listed in `security-boundaries.md`:
- trace the affected request/data path;
- verify authentication and authorization server-side;
- inspect Appwrite/database/storage permission assumptions;
- inspect secret/environment handling;
- check whether private student/member information can be exposed or modified improperly;
- record the review evidence and unresolved risk.

A plausible release-blocking security flaw is a `BLOCKER`.

## 4. Documentation and deployment

- Confirm README/setup instructions still match repository reality.
- Confirm new required environment variables are documented without publishing secret values.
- Confirm migrations/setup scripts are explicit and do not silently mutate production data.
- Confirm release notes distinguish implemented behavior from planned work.

## 5. Decision

Use exactly one final decision:

- `READY` — all evaluated mandatory gates pass and no warnings remain.
- `READY_WITH_WARNINGS` — no blockers exist, but one or more non-blocking gaps remain.
- `BLOCKED` — at least one blocker exists.

Do not mark a release `READY` or `READY_WITH_WARNINGS` when any blocker is unresolved.
