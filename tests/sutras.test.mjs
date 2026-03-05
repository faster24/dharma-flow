process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../src/app';
import Category from '../src/models/Category';
import Sutra from '../src/models/Sutra';

const validPngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

describe('Sutra routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/sutras requires category to exist', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/sutras')
      .send({ category: 'cat1', title: 'Heart Sutra', content: 'Form is emptiness', type: 'text' });

    expect(res.status).toBe(400);
  });

  it('POST /api/v1/sutras creates sutra when category exists', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue({ _id: 'cat1', isDeleted: false });
    vi.spyOn(Sutra, 'create').mockResolvedValue({ _id: 'sutra1', title: 'Heart Sutra', type: 'text' });

    const res = await request(app)
      .post('/api/v1/sutras')
      .send({ category: 'cat1', title: 'Heart Sutra', content: 'Form is emptiness', type: 'text' });

    expect(res.status).toBe(201);
    expect(res.body.sutra.title).toBe('Heart Sutra');
  });

  it('POST /api/v1/sutras creates audio sutra and sets audioUrl', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue({ _id: 'cat1', isDeleted: false });
    vi.spyOn(Sutra, 'create').mockResolvedValue({ _id: 'sutra2', title: 'Audio Sutra', type: 'audio', audioUrl: '/storage/sutra-audio/file.mp3' });

    const res = await request(app)
      .post('/api/v1/sutras')
      .field('category', 'cat1')
      .field('title', 'Audio Sutra')
      .field('content', 'Audio body')
      .field('type', 'audio');

    expect(res.status).toBe(201);
    expect(Sutra.create).toHaveBeenCalled();
  });

  it('POST /api/v1/sutras preserves thumbnailUrl key and uploaded extension', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue({ _id: 'cat1', isDeleted: false });
    vi.spyOn(Sutra, 'create').mockImplementation(async (payload) => ({ _id: 'sutra3', ...payload }));

    const res = await request(app)
      .post('/api/v1/sutras')
      .field('category', 'cat1')
      .field('title', 'Visual Sutra')
      .field('content', 'Body')
      .field('type', 'text')
      .attach('thumbnail', validPngBytes, {
        filename: 'sutra-thumb.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    expect(res.body.sutra).toHaveProperty('thumbnailUrl');
    expect(res.body.sutra.thumbnailUrl).toMatch(/^\/storage\/sutra-thumbs\/.+\.png$/);
  });

  it('POST /api/v1/sutras rejects spoofed thumbnail MIME with invalid bytes', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue({ _id: 'cat1', isDeleted: false });
    vi.spyOn(Sutra, 'create').mockResolvedValue({ _id: 'sutra-invalid' });

    const res = await request(app)
      .post('/api/v1/sutras')
      .field('category', 'cat1')
      .field('title', 'Blocked Sutra')
      .field('content', 'Body')
      .field('type', 'text')
      .attach('thumbnail', Buffer.from('not-image-data'), {
        filename: 'sutra-thumb.webp',
        contentType: 'image/webp',
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Failed to create sutra');
    expect(res.body.error).toBe('Invalid image content');
    expect(Sutra.create).not.toHaveBeenCalled();
  });
});
