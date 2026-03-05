# Learnings

- Added initial static policy contract at src/content/policies.json with top-level privacy and terms entries.
- Policy objects are strict: all required fields must be non-empty strings, except platformCompliance which is an object with googlePlay and appleAppStore strings.
- contentFormat is markdown and content is stored as a single JSON string with embedded \n newlines.
- Route convention for new public module: create `src/routes/policies.js`, export router, and mount from `src/routes/index.js` using `router.use('/policies', policyRoutes)`.
- Existing response envelopes are message-centric (`{ message }` on errors) with list shape `{ items, total, page, limit }`.
- Static JSON loading pattern uses `fs.existsSync` + `readFileSync` + `JSON.parse` + required-field validation (see `src/config/firebase.js`).
- Implemented `src/controllers/policyController.js` with CommonJS exports `getPrivacyPolicy` and `getTermsPolicy` only, using file-safe loading via `existsSync` + `readFileSync` + `JSON.parse`.
- Locale handling is deterministic: `?locale=` is accepted, exact locale variant is used only when present under `locales`, and fallback always resolves to `en-US`.
- Policy responses include resolved locale in payload shape `{ locale, policy }`, and 500 errors follow repo envelope `{ message, error }` for source load/parse failures.
- OpenAPI now documents public `GET /api/policies/privacy` and `GET /api/policies/terms` with optional `locale` query and response shape `{ locale, policy }` referencing `PolicyDocument`.
- Added `PolicyDocument` and `PolicyComplianceContext` schemas to match `src/content/policies.json` compliance fields and dates/URLs/email formats.
- Added public policy route module at `src/routes/policies.js` with `GET /privacy` and `GET /terms` bound to `policyController` handlers.
- Mounted policy routes in API registry via `router.use('/policies', policyRoutes)` in `src/routes/index.js` with no auth middleware.
- Added `tests/policies.test.mjs` using Vitest + Supertest with parity to existing route test style (`TEST_BYPASS_AUTH`, import ordering, describe/it/expect structure).
- Policy route tests verify required contract fields for both `/api/policies/privacy` and `/api/policies/terms`, including `platformCompliance.googlePlay` and `platformCompliance.appleAppStore`.
- Locale fallback behavior is covered via unsupported `?locale=fr-FR`, asserting deterministic fallback to `en-US` on both payload `locale` and `policy.locale`.
- Unknown policy route coverage confirms Express fallback envelope remains `{ message }` with 404 status at `/api/policies/unknown`.
- Added `tests/openapi.policies.test.mjs` to lock OpenAPI policy contract by parsing `src/docs/openapi.json`, asserting both policy paths exist, and verifying `components.schemas.PolicyDocument.required` contains all policy document keys.

- README now documents the public policy endpoints and notes they can be used as canonical app-store submission links.
- Task 8 integrated verification evidence is recorded under `.sisyphus/evidence/` with deterministic logs: `task-8-policy-openapi-targeted.log`, `task-8-regression.log`, and `task-8-openapi-assert.log`.
- Verification gate signals are now explicit in logs via trailing `RESULT: PASS|FAIL` and `EXIT_CODE: <n>` markers for easier audit parsing.
- Remediation fix: policy runtime contract now includes deterministic `policy.type` values (`privacy` and `terms`) from `src/content/policies.json`, and route contract tests assert them.
- OpenAPI `PolicyDocument` now declares `type` in both `properties` and `required`, with enum `['privacy', 'terms']` to keep docs aligned with runtime payloads.
- 2026-02-22: Policy contract alignment is consistent for `type` across content (`policies.json`), runtime payload (`policyController`), OpenAPI schema, and tests.
- 2026-02-22: Combined API + OpenAPI tests catch drift on required policy keys and route availability.
- 2026-03-05: Task 1 acceptance verification commands in plan lines 125-126 both print 'ok' and exit 0; edge QA command prints 'missing' and exits 2; evidence captured in .sisyphus/evidence/task-1-policy-source.log and .sisyphus/evidence/task-1-policy-source-error.log.
- 2026-03-05: Task 2 acceptance verification confirms controller export command prints `ok` with exit 0, fallback test evidence includes `GET /api/policies/privacy?locale=fr-FR 200`, and malformed parse edge command prints `parse-error` with exit 2.
- 2026-03-05: Evidence logs for Task 2 are standardized with `RESULT`, `EXIT_CODE`, and `PASS` markers in `.sisyphus/evidence/task-2-controller.log` and `.sisyphus/evidence/task-2-controller-error.log`.
- 2026-03-05: Task 4 acceptance verification commands from plan lines 241-242 executed exactly and succeeded (`valid-json`, `ok`, both exit 0), with deterministic evidence markers captured in `.sisyphus/evidence/task-4-openapi-error.log` and `.sisyphus/evidence/task-4-openapi.log`.
- 2026-03-05: Task 3 acceptance verification (plan lines 203-204) passed: route module import check printed `ok` with `EXIT_CODE:0`; targeted supertest coverage proved non-404 for `/api/policies/privacy` and `/api/policies/terms`, plus unknown path 404 behavior for `/api/policies/unknown`.
- 2026-03-05: Task 3 evidence captured in `.sisyphus/evidence/task-3-routes.log` (import + non-404 tests) and `.sisyphus/evidence/task-3-routes-error.log` (unknown 404 test), each with command, snippet, and exit code markers.
- 2026-03-05: Task 6 acceptance verification (plan lines 318, 319, 331) passed in `/home/nyiyenaing/Work/DharmaFlow-wt-privacy-policy-api`: strict precondition command from line 331 executed exactly and logged with `exit_code: 0` in `.sisyphus/evidence/task-6-openapi-test-error.log`; `pnpm vitest tests/openapi.policies.test.mjs` logged with `3 tests`, `1 passed`, and `exit_code: 0` in `.sisyphus/evidence/task-6-openapi-test.log`; assertion presence confirmed from `tests/openapi.policies.test.mjs` (`parses` JSON test, `/api/policies/privacy` + `/api/policies/terms` path checks, and `PolicyDocument.required` key containment loop).

- 2026-03-05: Task 7 acceptance verification (plan lines 356-357) passed: `grep -n "Policy endpoints" README.md` returned a single match; README policy section includes `/api/policies/privacy`, `/api/policies/terms`, and explicit locale fallback statement (`?locale=<bcp47>` with deterministic fallback to `en-US`). Evidence captured in `.sisyphus/evidence/task-7-readme.log` and `.sisyphus/evidence/task-7-readme-error.log` with exit codes.
- 2026-03-05: Task 5 acceptance verification (plan lines 280-281) passed with `pnpm vitest tests/policies.test.mjs` exit 0; verbose run confirmed policy contract assertions for privacy/terms and explicit unsupported-locale fallback to `en-US`; evidence stored in `.sisyphus/evidence/task-5-policy-tests.log` with key markers and required response key list.
- 2026-03-05: Task 8 acceptance re-verification for remaining checklist lines 394-396 passed in `/home/nyiyenaing/Work/DharmaFlow-wt-privacy-policy-api`: `pnpm vitest tests/policies.test.mjs tests/openapi.policies.test.mjs` and `pnpm test -- --runInBand` both exited 0, and required artifacts now include `.sisyphus/evidence/task-8-policy-openapi-targeted.log`, `.sisyphus/evidence/task-8-regression.log`, and `.sisyphus/evidence/task-8-regression-error.log`.
