process.env.TEST_BYPASS_AUTH = 'true';
process.env.TEST_FAKE_AUTH = 'true';
process.env.FIREBASE_WEB_API_KEY = 'test-key';

import request from 'supertest';
import { describe, it, expect } from 'vitest';

import app from '../src/app';

describe('Auth routes', () => {

  it('POST /api/auth/register requires email and password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/);
  });

  it('POST /api/auth/register proxies to firebase signUp with username/birthday', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'secret123', username: 'tester', birthday: '2000-01-01' });

    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('test-user');
    expect(res.body.username).toBe('tester');
    expect(res.body.birthday).toBe('2000-01-01T00:00:00.000Z');
  });

  it('POST /api/auth/login proxies to firebase signIn', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'secret123', username: 'tester', birthday: '2000-01-01' });

    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('test-user');
    expect(res.body.username).toBe('tester');
  });
});
