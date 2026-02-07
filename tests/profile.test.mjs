process.env.TEST_BYPASS_AUTH = 'true';
process.env.TEST_FAKE_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import User from '../src/models/User';

describe('Profile routes', () => {
  beforeEach(() => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);
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
});
