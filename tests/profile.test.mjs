process.env.TEST_BYPASS_AUTH = 'true';
process.env.TEST_FAKE_AUTH = 'true';

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../src/app';
import User from '../src/models/User';

const validJpegBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

describe('Profile routes', () => {
  beforeEach(() => {
    vi.spyOn(User, 'findOne')
      .mockResolvedValueOnce({
        uid: 'test-user',
        email: 'test@example.com',
        username: 'oldname',
        birthday: new Date('1990-01-01'),
      })
      .mockResolvedValueOnce(null);
    vi.spyOn(User, 'findOneAndUpdate').mockResolvedValue({
      uid: 'test-user',
      email: 'test@example.com',
      username: 'newname',
      birthday: new Date('2000-01-01'),
      photoURL: '/storage/user-images/fake.jpg',
    });
  });

  it('PATCH /api/profile updates username and birthday', async () => {
    const res = await request(app)
      .patch('/api/profile')
      .send({ username: 'newname', birthday: '2000-01-01' });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('newname');
    expect(User.findOneAndUpdate).toHaveBeenCalled();
  });

  it('PATCH /api/profile returns 404 when user missing', async () => {
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.findOneAndUpdate.mockClear();

    const res = await request(app)
      .patch('/api/profile')
      .send({ username: 'newname', birthday: '2000-01-01' });

    expect(res.status).toBe(404);
    expect(User.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('PATCH /api/profile preserves photoURL key and uploaded extension', async () => {
    User.findOne.mockReset();
    User.findOne
      .mockResolvedValueOnce({
        uid: 'test-user',
        email: 'test@example.com',
        username: 'oldname',
      })
      .mockResolvedValueOnce(null);

    User.findOneAndUpdate.mockReset();
    User.findOneAndUpdate.mockImplementation(async (_query, updates) => ({
      uid: 'test-user',
      email: 'test@example.com',
      username: 'oldname',
      ...updates,
    }));

    const res = await request(app)
      .patch('/api/profile')
      .attach('image', validJpegBytes, {
        filename: 'portrait.webp',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('photoURL');
    expect(res.body.user.photoURL).toMatch(/^\/storage\/user-images\/.+\.webp$/);
  });

  it('PATCH /api/profile rejects spoofed image MIME with invalid bytes', async () => {
    User.findOne.mockReset();
    User.findOne.mockResolvedValue({
      uid: 'test-user',
      email: 'test@example.com',
      username: 'oldname',
    });
    User.findOneAndUpdate.mockReset();

    const res = await request(app)
      .patch('/api/profile')
      .attach('image', Buffer.from('not-an-image'), {
        filename: 'portrait.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Failed to update profile');
    expect(res.body.error).toBe('Invalid image content');
    expect(User.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
