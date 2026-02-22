# Privacy + Terms Policy API

## TL;DR
> **Summary**: Add public policy APIs for Privacy Policy and Terms of Service using static repo-managed content, with clear compliance context fields aligned to app store expectations.
> **Deliverables**:
> - `GET /api/policies/privacy` and `GET /api/policies/terms`
> - Static policy content source + loader/service
> - OpenAPI documentation updates for both endpoints
> - Automated route tests + OpenAPI contract checks
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: Task 1 -> Task 2 -> Task 3 -> Task 4 -> Task 5

## Context
### Original Request
- Add API for privacy/policy that fits Google Play and Apple App Store policy expectations, and explain context clearly.

### Interview Summary
- Scope selected: Privacy Policy + Terms of Service.
- Content source selected: static repo-managed content file.
- Test strategy selected: tests-after.
- Decision defaults: single locale (`en-US`) for v1, deterministic fallback to `en-US` for unknown locale query.

### Metis Review (gaps addressed)
- Corrected prior assumption: tests already exist in `tests/*.test.mjs`.
- Added guardrail to prevent scope creep into consent logging/account deletion flows.
- Added explicit acceptance checks for OpenAPI JSON validity and policy endpoint path presence.
- Added resilience requirement for missing/invalid static policy content.

## Work Objectives
### Core Objective
- Deliver production-ready, publicly accessible policy endpoints with clear compliance metadata and documentation, following existing route/controller conventions.

### Deliverables
- New policy content source file at `src/content/policies.json` with keys: `privacy`, `terms`.
- New controller `src/controllers/policyController.js`.
- New router `src/routes/policies.js` mounted under `/api/policies` in `src/routes/index.js`.
- OpenAPI path and schema definitions in `src/docs/openapi.json`.
- New tests in `tests/policies.test.mjs` and OpenAPI contract check in `tests/openapi.policies.test.mjs`.

### Definition of Done (verifiable conditions with commands)
- `pnpm vitest tests/policies.test.mjs tests/openapi.policies.test.mjs` exits 0.
- `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('./src/docs/openapi.json','utf8')); console.log('valid-json')"` outputs `valid-json`.
- `node -e "const s=require('./src/docs/openapi.json'); if(!s.paths['/api/policies/privacy']||!s.paths['/api/policies/terms']) process.exit(1); console.log('ok')"` outputs `ok`.

### Must Have
- Public GET endpoints: `/api/policies/privacy`, `/api/policies/terms`.
- Treat these API URLs as canonical policy URLs for current store submission scope.
- Response contract includes context fields:
  - `type`, `title`, `version`, `effectiveDate`, `lastUpdated`, `locale`
  - `contentFormat`, `content`, `summary`
  - `contactEmail`, `contactUrl`, `dataDeletionUrl`
  - `platformCompliance.googlePlay`, `platformCompliance.appleAppStore`
- Query support: optional `locale`; fallback behavior always returns `en-US` content when unsupported.
- Error contract:
  - 404 for unknown policy type with `{ message }`
  - 500 for malformed/missing policy source with `{ message, error }`

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No database model/migration for policies in this scope.
- No auth middleware changes.
- No account deletion workflow implementation.
- No policy-acceptance tracking/audit trail.
- No localization framework beyond `en-US` fallback behavior.
- No unrelated endpoint refactors.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after with Vitest + Supertest.
- QA policy: Every task includes happy + failure scenario commands.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`.

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave.

Wave 1: contract/source/controller/routing/docs/test implementation (Tasks 1-5)
- Task 1 (foundation source contract) then Task 2.
- Tasks 3 and 4 after Task 2 (Task 4 can proceed once endpoint contracts are fixed).
- Task 5 after Tasks 3 and 4.

Wave 2: quality gates + docs polish + integrated validation (Tasks 6-8)
- Tasks 6 and 7 in parallel.
- Task 8 after Tasks 5, 6, and 7.

### Dependency Matrix (full, all tasks)
- Task 1: Blocked By none | Blocks 2, 6
- Task 2: Blocked By 1 | Blocks 3, 4
- Task 3: Blocked By 2 | Blocks 5
- Task 4: Blocked By 2 | Blocks 5, 6
- Task 5: Blocked By 3, 4 | Blocks 8
- Task 6: Blocked By 1, 4 | Blocks 8
- Task 7: Blocked By 3, 4 | Blocks 8
- Task 8: Blocked By 5, 6, 7 | Blocks final verification wave

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 5 tasks -> `quick`(4), `writing`(1)
- Wave 2 -> 3 tasks -> `quick`(2), `unspecified-low`(1)
- Final verification -> 4 tasks -> `oracle`, `unspecified-high`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task includes Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Create static policy source contract

  **What to do**: Create `src/content/policies.json` with two top-level keys (`privacy`, `terms`) using this exact nested structure per key: `title`, `version`, `effectiveDate`, `lastUpdated`, `locale` (`en-US`), `summary`, `contentFormat` (`markdown`), `content`, `contactEmail`, `contactUrl`, `dataDeletionUrl`, `platformCompliance` (`googlePlay`, `appleAppStore`). Ensure both policy entries are non-empty and store-facing.
  **Must NOT do**: Do not add DB models or environment-variable dependence for policy text.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: Content quality and clarity are compliance-facing.
  - Skills: `[]` - No specialized coding skill required.
  - Omitted: `["django-expert"]` - Not a Django stack.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 6 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/controllers/testController.js:8` - Existing lightweight JSON response style.
  - Pattern: `src/controllers/categoryController.js:15` - Error envelope with `message` and optional `error`.
  - API/Type: `src/docs/openapi.json:3` - API info language and tone baseline.
  - External: `https://support.google.com/googleplay/android-developer/answer/10144311` - Google Play privacy policy expectation baseline.
  - External: `https://developer.apple.com/app-store/review/guidelines/` - Apple review guideline baseline.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `node -e "const p=require('./src/content/policies.json'); const req=['title','version','effectiveDate','lastUpdated','locale','summary','contentFormat','content','contactEmail','contactUrl','dataDeletionUrl','platformCompliance']; for (const k of ['privacy','terms']) { if(!p[k]) process.exit(1); for (const f of req){ if(!p[k][f]) process.exit(1);} } console.log('ok')"` prints `ok`.
  - [ ] `node -e "const p=require('./src/content/policies.json'); if(p.privacy.locale!=='en-US'||p.terms.locale!=='en-US') process.exit(1); console.log('ok')"` prints `ok`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - source contract valid
    Tool: Bash
    Steps: Run node contract validation command for required keys in src/content/policies.json.
    Expected: Command exits 0 and prints "ok".
    Evidence: .sisyphus/evidence/task-1-policy-source.log

  Scenario: Failure/edge case - missing mandatory key detection
    Tool: Bash
    Steps: Run `node -e "const p=require('./src/content/policies.json'); delete p.privacy.version; const req=['title','version']; for (const f of req){ if(!p.privacy[f]) { console.log('missing'); process.exit(2);} }"`.
    Expected: Command exits non-zero and prints "missing".
    Evidence: .sisyphus/evidence/task-1-policy-source-error.log
  ```

  **Commit**: NO | Message: `feat(policy): add static policy content contract` | Files: `src/content/policies.json`

- [x] 2. Implement policy controller with deterministic locale fallback

  **What to do**: Create `src/controllers/policyController.js` exporting `getPrivacyPolicy` and `getTermsPolicy` handlers. Load `src/content/policies.json` safely, map selected policy to response payload, accept optional `locale` query, and always fallback to `en-US` while returning resolved `locale` in response. Return 500 with `{ message, error }` if content source cannot be loaded/parsed.
  **Must NOT do**: Do not add auth requirements or mutate policy content at runtime.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Single controller module with deterministic logic.
  - Skills: `[]` - Existing Express patterns are sufficient.
  - Omitted: `["test-driven-development"]` - Selected strategy is tests-after.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/controllers/homeController.js:3` - Async controller shape.
  - Pattern: `src/controllers/categoryController.js:15` - 500 error response envelope.
  - Pattern: `src/controllers/testController.js:4` - Simple success JSON response.
  - API/Type: `src/middleware/auth.js:17` - Common message-centric error style.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `node -e "const c=require('./src/controllers/policyController'); if(typeof c.getPrivacyPolicy!=='function'||typeof c.getTermsPolicy!=='function') process.exit(1); console.log('ok')"` prints `ok`.
  - [ ] Controller contains explicit fallback logic to `en-US` for unsupported locale (verified by tests in Task 5).

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - handlers exported
    Tool: Bash
    Steps: Run node export-check command for getPrivacyPolicy/getTermsPolicy.
    Expected: Command exits 0 and prints "ok".
    Evidence: .sisyphus/evidence/task-2-controller.log

  Scenario: Failure/edge case - malformed source handling
    Tool: Bash
    Steps: Run `node -e "const fs=require('fs'); const raw=fs.readFileSync('./src/content/policies.json','utf8'); try { JSON.parse(raw.slice(0,10)); } catch { console.log('parse-error'); process.exit(2);} "`.
    Expected: Command exits non-zero with parse error signal; downstream tests assert API returns 500 for load/parse failure.
    Evidence: .sisyphus/evidence/task-2-controller-error.log
  ```

  **Commit**: NO | Message: `feat(policy): add policy controller with fallback` | Files: `src/controllers/policyController.js`

- [x] 3. Add public policy routes and mount in API registry

  **What to do**: Create `src/routes/policies.js` with `GET /privacy` -> `getPrivacyPolicy`, `GET /terms` -> `getTermsPolicy`; register router in `src/routes/index.js` as `router.use('/policies', policyRoutes)`.
  **Must NOT do**: Do not add auth middleware on these endpoints.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Small route wiring task following existing conventions.
  - Skills: `[]` - Straightforward Express route composition.
  - Omitted: `["frontend-ui-ux"]` - No UI work.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 7 | Blocked By: 2

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/routes/categories.js:13` - Public GET routes without auth.
  - Pattern: `src/routes/sutras.js:14` - Route module structure and exports.
  - Pattern: `src/routes/index.js:16` - Route hub and mounting style.
  - API/Type: `src/app.js:45` - `/api` prefix mount behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `node -e "const r=require('./src/routes/policies'); if(!r) process.exit(1); console.log('ok')"` prints `ok`.
  - [ ] `GET /api/policies/privacy` and `GET /api/policies/terms` return non-404 in supertest (validated in Task 5).

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - routes mounted
    Tool: Bash
    Steps: Run `pnpm vitest tests/policies.test.mjs -t "GET /api/policies/privacy returns policy payload"`.
    Expected: Test passes and endpoint responds 200.
    Evidence: .sisyphus/evidence/task-3-routes.log

  Scenario: Failure/edge case - unknown path still 404
    Tool: Bash
    Steps: Run `pnpm vitest tests/policies.test.mjs -t "GET /api/policies/unknown returns 404"`.
    Expected: Test passes with status 404 and `{ message }` response.
    Evidence: .sisyphus/evidence/task-3-routes-error.log
  ```

  **Commit**: NO | Message: `feat(policy): wire public policy routes` | Files: `src/routes/policies.js`, `src/routes/index.js`

- [x] 4. Document policy APIs in OpenAPI spec

  **What to do**: Update `src/docs/openapi.json` with two new paths (`/api/policies/privacy`, `/api/policies/terms`), response schema references, and schema definitions for `PolicyDocument` and `PolicyComplianceContext`. Include query parameter `locale` and document fallback behavior in descriptions.
  **Must NOT do**: Do not remove or alter unrelated endpoint schemas.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Structured JSON spec update with bounded blast radius.
  - Skills: `[]` - Existing OpenAPI file is manual JSON.
  - Omitted: `["playwright"]` - Not a browser task.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6, 7 | Blocked By: 2

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/docs/openapi.json:15` - Path declaration style and response wiring.
  - Pattern: `src/docs/openapi.json:62` - Security annotation usage (do not add for public policy routes).
  - Pattern: `src/docs/openapi.json:420` - Components schema section location/style.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('./src/docs/openapi.json','utf8')); console.log('valid-json')"` prints `valid-json`.
  - [ ] `node -e "const s=require('./src/docs/openapi.json'); if(!s.paths['/api/policies/privacy']||!s.paths['/api/policies/terms']) process.exit(1); console.log('ok')"` prints `ok`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - OpenAPI paths present
    Tool: Bash
    Steps: Run OpenAPI path assertion command for /api/policies/privacy and /api/policies/terms.
    Expected: Command exits 0 and prints "ok".
    Evidence: .sisyphus/evidence/task-4-openapi.log

  Scenario: Failure/edge case - invalid JSON detected
    Tool: Bash
    Steps: Run JSON parse validation command against src/docs/openapi.json.
    Expected: Command would fail immediately if malformed; passing run prints "valid-json".
    Evidence: .sisyphus/evidence/task-4-openapi-error.log
  ```

  **Commit**: NO | Message: `docs(api): add policy endpoints to openapi` | Files: `src/docs/openapi.json`

- [x] 5. Add policy route tests (happy + failure)

  **What to do**: Create `tests/policies.test.mjs` using Vitest + Supertest. Add tests for: privacy returns 200 with required keys, terms returns 200 with required keys, unsupported locale falls back to `en-US`, unknown policy path returns 404 with `{ message }`.
  **Must NOT do**: Do not use live network calls or external services.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Existing test patterns are already in repo.
  - Skills: `[]` - Supertest/Vitest baseline already established.
  - Omitted: `["test-driven-development"]` - Strategy selected is tests-after.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 8 | Blocked By: 3, 4

  **References** (executor has NO interview context - be exhaustive):
  - Test: `tests/routes.test.mjs:17` - Basic endpoint assertion style.
  - Test: `tests/categories.test.mjs:15` - Request + status + body assertions.
  - Test: `tests/sutras.test.mjs:15` - Route behavior validation pattern.
  - API/Type: `src/app.js:49` - Global 404 `{ message: 'Not found' }` behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `pnpm vitest tests/policies.test.mjs` exits 0.
  - [ ] Test cases explicitly assert required response keys and locale fallback behavior.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - both policy endpoints valid
    Tool: Bash
    Steps: Run `pnpm vitest tests/policies.test.mjs -t "returns policy payload"`.
    Expected: Tests pass with status 200 and required context fields present.
    Evidence: .sisyphus/evidence/task-5-policy-tests.log

  Scenario: Failure/edge case - unknown policy route
    Tool: Bash
    Steps: Run `pnpm vitest tests/policies.test.mjs -t "unknown returns 404"`.
    Expected: Test passes verifying 404 and `{ message: 'Not found' }`.
    Evidence: .sisyphus/evidence/task-5-policy-tests-error.log
  ```

  **Commit**: NO | Message: `test(policy): add privacy and terms route tests` | Files: `tests/policies.test.mjs`

- [x] 6. Add OpenAPI contract regression test

  **What to do**: Create `tests/openapi.policies.test.mjs` to assert `src/docs/openapi.json` parses and contains both policy paths plus `PolicyDocument` schema keys expected by route tests.
  **Must NOT do**: Do not rely on manual visual inspection of Swagger UI.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Small deterministic test file.
  - Skills: `[]` - Standard Vitest assertions only.
  - Omitted: `["playwright"]` - Non-UI validation.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 1, 4

  **References** (executor has NO interview context - be exhaustive):
  - Test: `tests/routes.test.mjs:4` - Vitest import/style conventions.
  - API/Type: `src/docs/openapi.json:14` - `paths` object location.
  - API/Type: `src/docs/openapi.json:420` - `components.schemas` section location.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `pnpm vitest tests/openapi.policies.test.mjs` exits 0.
  - [ ] Test fails if either policy path is missing or schema contract is incomplete.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - OpenAPI contract stays complete
    Tool: Bash
    Steps: Run `pnpm vitest tests/openapi.policies.test.mjs`.
    Expected: Test suite passes, confirming parse + path/schema assertions.
    Evidence: .sisyphus/evidence/task-6-openapi-test.log

  Scenario: Failure/edge case - missing path should fail
    Tool: Bash
    Steps: Execute `node -e "const s=require('./src/docs/openapi.json'); if(!s.paths['/api/policies/privacy']) process.exit(2);"` as strict precondition check.
    Expected: Command exits non-zero if path missing; serves as binary guard.
    Evidence: .sisyphus/evidence/task-6-openapi-test-error.log
  ```

  **Commit**: NO | Message: `test(openapi): add policy path contract checks` | Files: `tests/openapi.policies.test.mjs`

- [x] 7. Add developer-facing policy API usage notes

  **What to do**: Update `README.md` with a short `Policy endpoints` section documenting endpoint URLs, locale query behavior, and intended use for app store submission links. Keep instructions concise and concrete.
  **Must NOT do**: Do not add marketing language or unverifiable compliance guarantees.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: Documentation clarity and submission-readiness context.
  - Skills: `[]` - No specialized code skill required.
  - Omitted: `["django-expert"]` - Irrelevant tech stack.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 3, 4

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `README.md:54` - Existing API docs section style.
  - API/Type: `src/app.js:46` - Documentation endpoints currently exposed.
  - External: `https://support.google.com/googleplay/android-developer/answer/10144311` - Policy URL expectation context.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `grep -n "Policy endpoints" README.md` finds one section.
  - [ ] Section includes both `/api/policies/privacy` and `/api/policies/terms` plus locale fallback statement.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - README includes policy section
    Tool: Bash
    Steps: Run `grep -n "Policy endpoints" README.md` and `grep -n "/api/policies/privacy" README.md`.
    Expected: Both commands return matches.
    Evidence: .sisyphus/evidence/task-7-readme.log

  Scenario: Failure/edge case - missing endpoint docs
    Tool: Bash
    Steps: Run `grep -n "/api/policies/terms" README.md`.
    Expected: Command fails if terms endpoint is undocumented.
    Evidence: .sisyphus/evidence/task-7-readme-error.log
  ```

  **Commit**: NO | Message: `docs(readme): document policy endpoints and locale behavior` | Files: `README.md`

- [x] 8. Run integrated verification and capture evidence

  **What to do**: Run targeted and full tests: `pnpm vitest tests/policies.test.mjs tests/openapi.policies.test.mjs` then `pnpm test -- --runInBand`. Capture outputs into `.sisyphus/evidence/` files and verify all acceptance commands from prior tasks pass.
  **Must NOT do**: Do not bypass failing tests; do not use `--no-verify` shortcuts.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` - Reason: Execution/verification orchestration.
  - Skills: `[]` - Standard test command execution.
  - Omitted: `["git-master"]` - No git history operation needed.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final verification wave | Blocked By: 5, 6, 7

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `README.md:45` - canonical test command note.
  - Test: `tests/routes.test.mjs:1` - test bypass auth convention.
  - API/Type: `package.json:9` - primary test script.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `pnpm vitest tests/policies.test.mjs tests/openapi.policies.test.mjs` exits 0.
  - [ ] `pnpm test -- --runInBand` exits 0.
  - [ ] Evidence files exist for all task QA runs under `.sisyphus/evidence/`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```bash
  Scenario: Happy path - full regression remains green
    Tool: Bash
    Steps: Run `pnpm test -- --runInBand`.
    Expected: Exit code 0 and no failing suites.
    Evidence: .sisyphus/evidence/task-8-regression.log

  Scenario: Failure/edge case - command-level guard catches breaks
    Tool: Bash
    Steps: Run OpenAPI path assertion command and policy-targeted test command sequentially.
    Expected: Any missing path/contract fails fast with non-zero exit.
    Evidence: .sisyphus/evidence/task-8-regression-error.log
  ```

  **Commit**: NO | Message: `chore(qa): verify policy api and openapi contracts` | Files: `.sisyphus/evidence/*`

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [x] F1. Plan Compliance Audit - oracle
- [x] F2. Code Quality Review - unspecified-high
- [x] F3. Real Manual QA - unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check - deep

## Commit Strategy
- Single final commit after Task 8 and final verification approvals.
- Commit message: `feat(policy): add privacy and terms policy APIs with openapi and tests`.
- Include only files listed in Tasks 1-7 (plus generated evidence artifacts if repo policy allows tracking them).

## Success Criteria
- Privacy and Terms endpoints are public, stable, and documented.
- Endpoint payloads clearly communicate compliance context for store review.
- Tests verify happy path, fallback behavior, and failure contracts.
- OpenAPI contract remains valid and includes new policy paths/schemas.
- Scope boundaries remain intact (no consent tracking, no deletion workflow implementation).
