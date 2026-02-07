# DharmaFlow Backend API

Express API with MongoDB Atlas, Firebase Admin auth, OpenAPI docs, pnpm tooling, and basic routes (`/api/health`, `/api/echo`, `/api/profile`).

## Firebase configuration

- **Backend (required for auth):** Provide a Firebase Admin service account JSON and set `FIREBASE_CREDENTIALS_PATH` to its location (default example: `dharma-flow-firebase-adminsdk-fbsvc-5b2a510c72.json`). If no file is found, fallback env vars are used: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (with `\n` escapes).
- **Frontend (public client config):** For your web/mobile client, use the Firebase JS SDK config below (do **not** use this for the backend Admin SDK):

```js
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgdDiGTUPqM1hb9Ehmvt0AmU9oXWTgTk4",
  authDomain: "dharma-flow.firebaseapp.com",
  projectId: "dharma-flow",
  storageBucket: "dharma-flow.firebasestorage.app",
  messagingSenderId: "407370490332",
  appId: "1:407370490332:web:048975c76031d1c9382f19",
  measurementId: "G-1C8Y7J7RBJ",
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
- `vercel.json` rewrites `/` and `/api/*` to the serverless handler (Vercel’s default Node runtime is used; no custom runtime needed).
- Configure environment variables in Vercel project settings (match `.env`, and set `FIREBASE_CREDENTIALS_PATH` if you upload the service account file as a secret or bundle it). Do **not** commit real secrets.
- Deploy via `vercel --prod` (or connect the GitHub repo and let Vercel auto-deploy on push).

## API docs

- Swagger UI: `/api/docs`
- OpenAPI spec: `/api/openapi.json`

## Quick cURL smoke tests

Register (requires valid Firebase Web API key and service account credentials):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secret123!","username":"userexample","birthday":"2000-01-01"}'
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secret123!"}'
```

Profile (replace `<ID_TOKEN>` from login/register response):

```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <ID_TOKEN>"
```

Update profile (JSON only):

```bash
curl -X PATCH http://localhost:3000/api/profile \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newname","birthday":"1999-12-31"}'
```

Update profile with image upload (<=2MB jpeg/png/webp, resized to 800px):

```bash
curl -X PATCH http://localhost:3000/api/profile \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -F "username=newname" \
  -F "birthday=1999-12-31" \
  -F "image=@/path/to/photo.jpg"
```
