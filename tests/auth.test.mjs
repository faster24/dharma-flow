process.env.TEST_BYPASS_AUTH = 'true';
process.env.TEST_FAKE_AUTH = 'true';
process.env.FIREBASE_WEB_API_KEY = 'test-key';

import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../src/app';

describe('Auth routes', () => {
  it('POST /api/v1/auth/register requires email, password and username', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/);
  });

  it('POST /api/v1/auth/register proxies to firebase signUp with username/birthday', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'secret123', username: 'tester', birthday: '2000-01-01' });

    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('test-user');
    expect(res.body.username).toBe('tester');
    expect(res.body.birthday).toBe('2000-01-01T00:00:00.000Z');
  });

  it('POST /api/v1/auth/login proxies to firebase signIn', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('test-user');
    expect(res.body).not.toHaveProperty('username');
    expect(res.body).not.toHaveProperty('birthday');
    expect(res.body).toEqual({
      uid: 'test-user',
      idToken: 'fake-token',
      refreshToken: 'fake-refresh',
      email: 'test@example.com',
    });
  });

  it('POST /api/v1/auth/login requires email and password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/);
  });
});
