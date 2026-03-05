process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../src/app';
import DharmaTalk from '../src/models/DharmaTalk';
import Monk from '../src/models/Monk';

const validPngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

describe('Monk routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/monks creates monk', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue(null);
    vi.spyOn(Monk, 'create').mockResolvedValue({ _id: 'monk1', name: 'Ajahn A' });

    const res = await request(app).post('/api/v1/monks').send({ name: 'Ajahn A' });

    expect(res.status).toBe(201);
    expect(res.body.monk.name).toBe('Ajahn A');
  });

  it('DELETE /api/v1/monks soft-deletes when talks exist', async () => {
    const save = vi.fn();
    vi.spyOn(Monk, 'findById').mockResolvedValue({ _id: 'monk1', name: 'Ajahn A', isDeleted: false, save });
    vi.spyOn(DharmaTalk, 'countDocuments').mockResolvedValue(2);

    const res = await request(app).delete('/api/v1/monks/monk1');

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
    expect(res.body.message).toMatch(/soft-deleted/i);
  });

  it('POST /api/v1/monks preserves avatarUrl key and uploaded extension', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue(null);
    vi.spyOn(Monk, 'create').mockImplementation(async (payload) => ({ _id: 'monk1', ...payload }));

    const res = await request(app)
      .post('/api/v1/monks')
      .field('name', 'Ajahn B')
      .attach('avatar', validPngBytes, {
        filename: 'ajahn-b.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    expect(res.body.monk).toHaveProperty('avatarUrl');
    expect(res.body.monk.avatarUrl).toMatch(/^\/storage\/dharma-thumbs\/.+\.png$/);
  });

  it('POST /api/v1/monks rejects spoofed image MIME with invalid bytes', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue(null);
    vi.spyOn(Monk, 'create').mockResolvedValue({ _id: 'monk-invalid' });

    const res = await request(app)
      .post('/api/v1/monks')
      .field('name', 'Ajahn C')
      .attach('avatar', Buffer.from('malicious-content'), {
        filename: 'ajahn-c.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Failed to create monk');
    expect(res.body.error).toBe('Invalid image content');
    expect(Monk.create).not.toHaveBeenCalled();
  });
});
