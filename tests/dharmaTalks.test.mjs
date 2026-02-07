process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import Monk from '../src/models/Monk';
import DharmaTalk from '../src/models/DharmaTalk';

describe('Dharma talk routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/dharma-talks requires audio file', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue({ _id: 'm1', isDeleted: false });

    const res = await request(app)
      .post('/api/dharma-talks')
      .field('monk', 'm1')
      .field('title', 'Talk')
      .field('duration', '300');

    expect(res.status).toBe(400);
  });

  it('POST /api/dharma-talks creates talk when valid', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue({ _id: 'm1', isDeleted: false });
    vi.spyOn(DharmaTalk, 'create').mockResolvedValue({ _id: 't1', title: 'Talk', audioUrl: '/storage/dharma-audio/x.mp3' });

    const res = await request(app)
      .post('/api/dharma-talks')
      .field('monk', 'm1')
      .field('title', 'Talk')
      .field('duration', '300')
      .field('type', 'audio')
      .attach('audio', Buffer.from('test'), { filename: 'test.mp3', contentType: 'audio/mpeg' });

    expect(res.status).toBe(201);
    expect(DharmaTalk.create).toHaveBeenCalled();
  });
});
