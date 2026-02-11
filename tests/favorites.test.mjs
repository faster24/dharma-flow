process.env.TEST_BYPASS_AUTH = 'true';
process.env.TEST_NO_WRITE = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import Favorite from '../src/models/Favorite';
import Sutra from '../src/models/Sutra';
import User from '../src/models/User';

describe('Favorites routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/favorites/:id adds favorite', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'u1', uid: 'test-user' });
    vi.spyOn(Sutra, 'findById').mockResolvedValue({ _id: 's1' });
    vi.spyOn(Favorite, 'updateOne').mockResolvedValue({});

    const res = await request(app).post('/api/favorites/s1');

    expect(res.status).toBe(200);
    expect(Favorite.updateOne).toHaveBeenCalled();
  });

  it('GET /api/favorites lists favorites', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'u1', uid: 'test-user' });
    vi.spyOn(Favorite, 'aggregate').mockImplementation((pipe) => {
      if (pipe.some((p) => p.$count)) return Promise.resolve([{ total: 1 }]);
      return Promise.resolve([
        { favoritedAt: new Date(), sutra: { _id: 's1', title: 'Heart Sutra', type: 'text' } },
      ]);
    });

    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBe(1);
  });
});
