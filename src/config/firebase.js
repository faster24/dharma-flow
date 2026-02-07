const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const normalizeKey = (key) => key.replace(/\n/g, '\n').trim();

const loadCredentials = () => {
  const defaultPath = path.resolve(process.cwd(), 'firebase-service-account.json');
  const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH
    ? path.resolve(process.cwd(), process.env.FIREBASE_CREDENTIALS_PATH)
    : defaultPath;

  if (fs.existsSync(credentialsPath)) {
    const raw = fs.readFileSync(credentialsPath, 'utf8');
    const parsed = JSON.parse(raw);
    const { project_id, client_email, private_key } = parsed;

    if (!project_id || !client_email || !private_key) {
      throw new Error('Firebase service account JSON is missing required fields');
    }

    return {
      projectId: project_id,
      clientEmail: client_email,
      privateKey: normalizeKey(private_key),
      source: credentialsPath,
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase service account credentials are missing (file or env)');
  }

  return {
    projectId,
    clientEmail,
    privateKey: normalizeKey(privateKey),
    source: 'env',
  };
};

const initFirebase = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const { projectId, clientEmail, privateKey, source } = loadCredentials();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  console.log(`✅ Firebase Admin initialized (source: ${source})`);
  return admin.app();
};

module.exports = initFirebase;
