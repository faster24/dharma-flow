# Draft: Calendar date user_id attachment

## Objective (unconfirmed)
- Review existing Calendar model + API.
- Ensure each calendar date can be associated with a `user_id` (likely optional/nullable), and API returns/filters accordingly.

## Current Understanding (needs confirmation)
- There is a calendar/date table/model already.
- Some dates should be “owned” or “assigned” to a specific user; others might remain unassigned.

## Requirements (confirmed)
- **Ownership model**: Per-user date rows; enforce uniqueness on `(user_id, date)`.

## Research Findings (repo scan)
- There is no separate `Calendar` / `CalendarDate` model; calendar data is stored as per-user entries in `ChantingLog` (Mongo/Mongoose).
- Model: `/home/nyiyenaing/Work/DharmaFlow/src/models/ChantingLog.js`
  - Fields: `user` (ObjectId ref `User`, required, indexed), `date` (String `YYYY-MM-DD`, required, indexed)
  - Constraint: unique composite index on `{ user: 1, date: 1 }` (already enforces “one row per user per date”).
- User model: `/home/nyiyenaing/Work/DharmaFlow/src/models/User.js` (has `uid` unique; controller maps auth uid -> User._id).
- API routes: `/home/nyiyenaing/Work/DharmaFlow/src/routes/calendar.js`
  - `GET /api/calendar` (month view)
  - `POST /api/calendar/chant` (upsert/record date)
  - `GET /api/calendar/streak` (streak stats)
- Controller: `/home/nyiyenaing/Work/DharmaFlow/src/controllers/calendarController.js`
  - Uses `req.user.uid` (from auth middleware) -> `User.findOne({ uid })` -> reads/writes `ChantingLog` by `user._id`.
- Auth gate: `/home/nyiyenaing/Work/DharmaFlow/src/middleware/auth.js` protects all calendar endpoints.
- OpenAPI: `/home/nyiyenaing/Work/DharmaFlow/src/docs/openapi.json` documents the calendar endpoints; bearerAuth required.

## Test Infrastructure
- Framework: Vitest (from `/home/nyiyenaing/Work/DharmaFlow/package.json`).
- Calendar coverage: `/home/nyiyenaing/Work/DharmaFlow/tests/calendar.test.mjs` covers `POST /api/calendar/chant`, `GET /api/calendar`, `GET /api/calendar/streak`.
- Likely test command: `pnpm test -- --runInBand` (project uses Vitest).

## Implication
- The DB already “attaches each calendar date” to a user via `ChantingLog.user`.
- If something still feels missing, it’s likely about API payload shape (e.g., exposing `user_id`) or about which user identifier is desired (`User._id` vs `User.uid`).

## Open Questions
- API behavior: should list endpoints filter by current user, or return all with user_id included?
- Migration/backfill: what should happen to existing rows?
- Which identifier should be considered `user_id` in API contracts: Mongo `User._id` or Firebase/External `User.uid`?

## Test Strategy (pending discovery)
- Need to check whether test infrastructure exists and what framework is used.
