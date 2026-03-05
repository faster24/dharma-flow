# Issues

- Gotcha: JSON policy content must escape any quotes inside strings (for example, \"as is\"); LSP caught this quickly.
- Repository has no `build` script (`pnpm run build` fails with `ERR_PNPM_NO_SCRIPT`), so build verification is unavailable and test suite is used as regression gate.
- No blockers encountered while implementing Task 2; controller scope and policy contract were sufficient for deterministic locale fallback implementation.
- No blockers encountered while documenting Task 4; OpenAPI changes were additive and aligned with existing controller payload shape.
- No blockers encountered while implementing Task 3 route wiring; existing controller exports and route conventions were sufficient.
- No blockers encountered while implementing Task 5 policy route tests; existing route test conventions and deterministic policy payloads were sufficient.
- No blockers encountered while implementing Task 6 OpenAPI contract regression test; spec assertions were deterministic and required no runtime app boot.

- No blockers encountered while adding README policy endpoint usage notes; change is documentation-only.
- Task 8 execution note: initial evidence capture script used `status` variable name, which is read-only in zsh; switched to `rc` and reran all required commands to produce complete evidence logs.
- No blockers for Task 8 after rerun; targeted policy tests, full regression suite, and OpenAPI path assertion all exited successfully (`EXIT_CODE: 0`).
- No blockers encountered during remediation for missing `policy.type`; existing controller spread behavior already preserved new fields once added to policy source JSON.
- 2026-02-22: Controller returns raw `err.message` in 500 responses (`src/controllers/policyController.js`), which may expose internal error details.
- 2026-03-05: No blockers during Task 1 acceptance verification; expected non-zero edge exit (2) was observed and logged as PASS in task-1-policy-source-error.log.
- 2026-03-05: No blockers during Task 2 acceptance verification; all required commands completed with expected signals (`ok`, fallback evidence, `parse-error`, non-zero exit).
- 2026-03-05: Vitest selector command `pnpm test -- tests/policies.test.mjs -t "falls back to en-US for unsupported locale"` still executed all test files in this repo configuration; fallback proof was still observable in output and captured in evidence log.
- 2026-03-05: No blockers during Task 4 acceptance verification; exact OpenAPI JSON parse and policy-path assertion commands both passed and produced expected markers (`RESULT`, `EXIT_CODE: 0`, `PASS: yes`).
- 2026-03-05: No blockers during Task 3 acceptance verification; exact route import command succeeded and targeted Vitest invocations for policy non-404 + unknown 404 scenarios each exited 0.
- 2026-03-05: Reminder for this repo: targeted Vitest `-t` runs can show skipped tests in same file; capture route status lines and exit codes in evidence logs to avoid ambiguity.
- 2026-03-05: Edge selector `pnpm test -- --run -t "unsupported|invalid image"` is non-applicable for Task 5 policy-only edge intent because it matches image-validation patterns and runs broad suites; command still executed and was captured (exit 0) in `.sisyphus/evidence/task-5-policy-tests-error.log`.
- 2026-03-05: No blockers during Task 8 acceptance re-verification for lines 394-396; command-level guard sequence (`node -e` OpenAPI precondition + targeted policy/openapi tests) stayed green and was logged with explicit PASS/EXIT markers in `.sisyphus/evidence/task-8-regression-error.log`.
