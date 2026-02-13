process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import Sutra from '../src/models/Sutra';

describe('Home route', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/home returns latest text sutra and two audio sutras', async () => {
    const latestText = { _id: 't1', title: 'Latest Text', type: 'text' };
    const audioSutras = [
      { _id: 'a1', title: 'Audio 1', type: 'audio' },
      { _id: 'a2', title: 'Audio 2', type: 'audio' },
    ];

    vi.spyOn(Sutra, 'findOne').mockReturnValue({
      sort: vi.fn().mockResolvedValue(latestText),
    });
    vi.spyOn(Sutra, 'aggregate').mockResolvedValue(audioSutras);

    const res = await request(app).get('/api/home');

    expect(res.status).toBe(200);
    expect(res.body.featuredTextSutra).toEqual(latestText);
    expect(res.body.audioSutras).toEqual(audioSutras);
  });
});
