process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import Sutra from '../src/models/Sutra';
import DharmaTalk from '../src/models/DharmaTalk';

const chainResult = (data) => ({
  sort: () => ({
    limit: () => Promise.resolve(data),
  }),
});

describe('Search routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/search returns sutras and dharma talks', async () => {
    vi.spyOn(Sutra, 'find').mockReturnValue(chainResult([
      { _id: 's1', title: 'Heart Sutra', thumbnailUrl: '/t/s1.jpg', createdAt: new Date('2024-01-02') },
    ]));
    vi.spyOn(Sutra, 'countDocuments').mockResolvedValue(1);

    vi.spyOn(DharmaTalk, 'find').mockReturnValue({
      sort: () => ({
        limit: () => ({
          populate: () => Promise.resolve([
            { _id: 'd1', title: 'Dharma Audio', thumbnailUrl: '/t/d1.jpg', duration: 300, createdAt: new Date('2024-01-03'), monk: { name: 'Ajahn A' } },
          ]),
        }),
      }),
    });
    vi.spyOn(DharmaTalk, 'countDocuments').mockResolvedValue(1);

    const res = await request(app).get('/api/search').query({ q: 'dharma', page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    const types = res.body.items.map((i) => i.type).sort();
    expect(types).toEqual(['dharma', 'sutra']);
  });

  it('GET /api/search 400 without q', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
  });
});
