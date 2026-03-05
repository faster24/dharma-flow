process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../src/app';
import DharmaTalk from '../src/models/DharmaTalk';
import Monk from '../src/models/Monk';

const validWebpBytes = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

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

  it('POST /api/dharma-talks preserves thumbnailUrl key and uploaded extension', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue({ _id: 'm1', isDeleted: false });
    vi.spyOn(DharmaTalk, 'create').mockImplementation(async (payload) => ({ _id: 't2', ...payload }));

    const res = await request(app)
      .post('/api/dharma-talks')
      .field('monk', 'm1')
      .field('title', 'Extension Talk')
      .field('duration', '300')
      .field('type', 'audio')
      .attach('thumbnail', validWebpBytes, {
        filename: 'talk-thumb.webp',
        contentType: 'image/webp',
      })
      .attach('audio', Buffer.from('audio-bytes'), {
        filename: 'talk.mp3',
        contentType: 'audio/mpeg',
      });

    expect(res.status).toBe(201);
    expect(res.body.talk).toHaveProperty('thumbnailUrl');
    expect(res.body.talk.thumbnailUrl).toMatch(/^\/storage\/dharma-thumbs\/.+\.webp$/);
  });

  it('POST /api/dharma-talks rejects spoofed thumbnail MIME with invalid bytes', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue({ _id: 'm1', isDeleted: false });
    vi.spyOn(DharmaTalk, 'create').mockResolvedValue({ _id: 't-invalid' });

    const res = await request(app)
      .post('/api/dharma-talks')
      .field('monk', 'm1')
      .field('title', 'Blocked Talk')
      .field('duration', '300')
      .field('type', 'audio')
      .attach('thumbnail', Buffer.from('not-image-data'), {
        filename: 'thumb.webp',
        contentType: 'image/webp',
      })
      .attach('audio', Buffer.from('audio-bytes'), {
        filename: 'talk.mp3',
        contentType: 'audio/mpeg',
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Failed to create dharma talk');
    expect(res.body.error).toBe('Invalid image content');
    expect(DharmaTalk.create).not.toHaveBeenCalled();
  });
});
