# Repository Security Boundaries

Use this reference when a change touches authentication, authorization, student/member data, Appwrite/API access, uploads, environment variables, or privileged administration.

## Authentication and sessions

- `src/app/api/auth/` contains student/admin login and password-management routes.
- `src/lib/admin-session.ts` creates and verifies the `kc_admin_session` HMAC-signed cookie and exposes `requireAdminSession` for privileged server routes.
- Changes to session signing, cookie attributes, expiry, password reset, login, or account lookup require targeted review.

Review for:
- server-side authentication rather than client-only checks;
- correct expiry and signature validation;
- safe cookie settings;
- password/reset-token handling;
- account enumeration and brute-force exposure;
- session-secret separation and rotation assumptions.

## Admin and privileged writes

- `src/app/admin/` is the administrative UI surface.
- Server routes that create, update, delete, upload, moderate, or manage data must enforce authorization on the server.
- `requireAdminSession` is the current privileged-session gate used by protected API routes.

Review for:
- missing authorization on write methods;
- role confusion or privilege escalation;
- direct-object reference issues;
- trusting client-provided role/identity fields;
- inconsistent protection across GET/POST/PATCH/PUT/DELETE handlers.

## Appwrite and API access

- `src/app/api/` contains server API routes.
- `src/services/` contains Appwrite-backed service code.
- `scripts/` contains database/setup/maintenance utilities that may use privileged configuration.

Review for:
- public vs server-side Appwrite credentials;
- database/collection/bucket permission assumptions;
- unrestricted queries or mutations;
- privileged API keys crossing into browser bundles;
- validation before persistence;
- production-data mutations from maintenance scripts.

## Uploads and storage

- `src/app/api/upload/route.ts` is a privileged upload endpoint and currently calls `requireAdminSession` before accepting a file.
- `src/services/storage.service.ts` performs image MIME allow-listing and a 5 MB size limit before Appwrite storage upload.

Review for:
- authorization before parsing or persisting uploads;
- file type and size controls;
- dangerous content or extension/MIME mismatches;
- bucket permissions and public preview behavior;
- untrusted file names/metadata;
- deletion/listing endpoints that expose or modify other users' files.

## Student/member operational data

Treat changes involving attendance, students, projects, homework, activity signups, notices, comments, and profiles as privacy- and integrity-sensitive.

Review for:
- exposure of unnecessary student fields;
- unauthorized updates to another member's records;
- admin-only operations reachable by normal users;
- predictable identifiers combined with weak authorization;
- logs or error responses that disclose private data.

## Environment variables and secrets

The repository uses `process.env` and public `NEXT_PUBLIC_*` Appwrite configuration. `src/lib/admin-session.ts` currently reads `ADMIN_SESSION_SECRET` and falls back to `APPWRITE_API_KEY` if a dedicated session secret is absent.

Review for:
- secrets accidentally committed to Git;
- privileged values exposed through `NEXT_PUBLIC_*` variables;
- secret reuse across unrelated security purposes;
- missing required-production-secret validation;
- credentials printed in logs, errors, test fixtures, or generated reports.

## Release rule

Any change to one of these boundaries requires explicit security review evidence in addition to build/lint/type/format checks. A green build is not security evidence.
