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
