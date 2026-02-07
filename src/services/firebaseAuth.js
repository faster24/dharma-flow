const API_ROOT = 'https://identitytoolkit.googleapis.com/v1';

const getApiKey = () => {
  const key = process.env.FIREBASE_WEB_API_KEY;
  if (!key) {
    throw new Error('FIREBASE_WEB_API_KEY is not set');
  }
  return key;
};

const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
};

const signUp = async (email, password) => {
  const key = getApiKey();
  const url = `${API_ROOT}/accounts:signUp?key=${key}`;
  return postJson(url, { email, password, returnSecureToken: true });
};

const signIn = async (email, password) => {
  const key = getApiKey();
  const url = `${API_ROOT}/accounts:signInWithPassword?key=${key}`;
  return postJson(url, { email, password, returnSecureToken: true });
};

module.exports = {
  signUp,
  signIn,
};
