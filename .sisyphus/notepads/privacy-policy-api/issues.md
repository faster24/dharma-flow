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
