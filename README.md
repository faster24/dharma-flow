# DharmaFlow Backend API

Express API with MongoDB Atlas, Firebase Admin auth, OpenAPI docs, pnpm tooling, and basic routes (`/api/v1/health`, `/api/v1/echo`, `/api/v1/profile`).

## Firebase configuration

- **Backend (required for auth):** Provide a Firebase Admin service account JSON and set `FIREBASE_CREDENTIALS_PATH` to its location (default example: `dharma-flow-firebase-adminsdk-fbsvc-5b2a510c72.json`). If no file is found, fallback env vars are used: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (with `\n` escapes).
- **Frontend (public client config):** For your web/mobile client, use the Firebase JS SDK config from **your own** Firebase project settings (do **not** use this for the backend Admin SDK). Example placeholder:

```js
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "<your-web-api-key>",
  authDomain: "<your-app>.firebaseapp.com",
  projectId: "<your-project-id>",
  storageBucket: "<your-app>.appspot.com",
  messagingSenderId: "<your-sender-id>",
  appId: "<your-app-id>",
  measurementId: "<your-measurement-id>",
};
```

## Environment

Copy `.env` and fill:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/dharmaflow?retryWrites=true&w=majority"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@example.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nREPLACE_WITH_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CREDENTIALS_PATH="dharma-flow-firebase-adminsdk-fbsvc-5b2a510c72.json" # path to your service account file
FIREBASE_WEB_API_KEY="<public-web-api-key>" # needed for auth register/login proxy
```

File uploads:
- Profile images are stored under `public/storage/user-images`. Ensure this path is writable in your deploy target, or adjust as needed.

## Scripts

- `pnpm run dev` — start with nodemon
- `pnpm start` — start
- `pnpm test -- --runInBand` — vitest + supertest routes

## Deploying to Vercel

- Serverless entrypoint at `api/index.js` initializes MongoDB and Firebase once per cold start and reuses connections.
- `vercel.json` rewrites `/` and `/api/v1/*` to the serverless handler (Vercel’s default Node runtime is used; no custom runtime needed).
- Configure environment variables in Vercel project settings (match `.env`, and set `FIREBASE_CREDENTIALS_PATH` if you upload the service account file as a secret or bundle it). Do **not** commit real secrets.
- Deploy via `vercel --prod` (or connect the GitHub repo and let Vercel auto-deploy on push).

## API docs

- Swagger UI: `/api/v1/docs`
- OpenAPI spec: `/api/v1/openapi.json`

### Policy endpoints

- Privacy policy: `GET /api/v1/policies/privacy`
- Terms of service: `GET /api/v1/policies/terms`
- Optional locale: `?locale=<bcp47>` (exact match under `locales`, otherwise deterministic fallback to `en-US`)
- Intended use: treat these URLs as the canonical policy links for app-store submissions

## Docker (app + nginx)

- Build & run: `docker-compose up --build`
- App: http://localhost:3000 (from app container)
- Nginx (proxy + static storage): http://localhost:8080
- Static storage served at `/storage/...` via nginx, shared from `public/storage`.
