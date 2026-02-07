process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import app from '../src/app';
import User from '../src/models/User';

describe('API routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('POST /api/echo echoes payload', async () => {
    const payload = { hello: 'world' };
    const res = await request(app).post('/api/echo').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(payload);
    expect(res.body.message).toBe('echo');
  });

  it('GET /api/profile returns user info when authorized', async () => {
    const stubUser = {
      uid: 'test-user',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/avatar.png',
    };

    vi.spyOn(User, 'findOne').mockResolvedValue(null);
    vi.spyOn(User, 'create').mockResolvedValue(stubUser);

    const res = await request(app).get('/api/profile');

    expect(res.status).toBe(200);
    expect(res.body.authUser.uid).toBe('test-user');
    expect(res.body.user.uid).toBe('test-user');
    expect(User.findOne).toHaveBeenCalledWith({ uid: 'test-user' });
    expect(User.create).toHaveBeenCalled();
  });
});
