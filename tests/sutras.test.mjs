process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import Category from '../src/models/Category';
import Sutra from '../src/models/Sutra';

describe('Sutra routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/sutras requires category to exist', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/sutras')
      .send({ category: 'cat1', title: 'Heart Sutra', content: 'Form is emptiness', type: 'text' });

    expect(res.status).toBe(400);
  });

  it('POST /api/sutras creates sutra when category exists', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue({ _id: 'cat1', isDeleted: false });
    vi.spyOn(Sutra, 'create').mockResolvedValue({ _id: 'sutra1', title: 'Heart Sutra', type: 'text' });

    const res = await request(app)
      .post('/api/sutras')
      .send({ category: 'cat1', title: 'Heart Sutra', content: 'Form is emptiness', type: 'text' });

    expect(res.status).toBe(201);
    expect(res.body.sutra.title).toBe('Heart Sutra');
  });

  it('POST /api/sutras creates audio sutra and sets audioUrl', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue({ _id: 'cat1', isDeleted: false });
    vi.spyOn(Sutra, 'create').mockResolvedValue({ _id: 'sutra2', title: 'Audio Sutra', type: 'audio', audioUrl: '/storage/sutra-audio/file.mp3' });

    const res = await request(app)
      .post('/api/sutras')
      .field('category', 'cat1')
      .field('title', 'Audio Sutra')
      .field('content', 'Audio body')
      .field('type', 'audio');

    expect(res.status).toBe(201);
    expect(Sutra.create).toHaveBeenCalled();
  });
});
