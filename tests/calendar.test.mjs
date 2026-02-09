process.env.TEST_BYPASS_AUTH = 'true';
process.env.TEST_NO_WRITE = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import ChantingLog from '../src/models/ChantingLog';
import User from '../src/models/User';

describe('Calendar routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/calendar/chant records a date', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'u1', uid: 'test-user' });
    vi.spyOn(ChantingLog, 'updateOne').mockResolvedValue({});

    const res = await request(app)
      .post('/api/calendar/chant')
      .send({ date: '2026-02-08' });

    expect(res.status).toBe(200);
    expect(res.body.recorded).toBe(true);
  });

  it('GET /api/calendar returns month days', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'u1', uid: 'test-user' });
    vi.spyOn(ChantingLog, 'find').mockReturnValue({ select: () => Promise.resolve([{ date: '2026-02-02' }]) });

    const res = await request(app)
      .get('/api/calendar')
      .query({ month: '2026-02' });

    expect(res.status).toBe(200);
    expect(res.body.month).toBe('2026-02');
    expect(res.body.days.some((d) => d.date === '2026-02-02' && d.marked)).toBe(true);
  });

  it('GET /api/calendar/streak returns summary', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'u1', uid: 'test-user' });
    vi.spyOn(ChantingLog, 'find').mockReturnValue({ select: () => Promise.resolve([{ date: '2026-02-07' }, { date: '2026-02-08' }]) });

    const res = await request(app).get('/api/calendar/streak');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('currentStreak');
    expect(res.body).toHaveProperty('longestStreak');
  });
});
