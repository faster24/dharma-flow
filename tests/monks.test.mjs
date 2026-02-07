process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import Monk from '../src/models/Monk';
import DharmaTalk from '../src/models/DharmaTalk';

describe('Monk routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/monks creates monk', async () => {
    vi.spyOn(Monk, 'findOne').mockResolvedValue(null);
    vi.spyOn(Monk, 'create').mockResolvedValue({ _id: 'monk1', name: 'Ajahn A' });

    const res = await request(app).post('/api/monks').send({ name: 'Ajahn A' });

    expect(res.status).toBe(201);
    expect(res.body.monk.name).toBe('Ajahn A');
  });

  it('DELETE /api/monks soft-deletes when talks exist', async () => {
    const save = vi.fn();
    vi.spyOn(Monk, 'findById').mockResolvedValue({ _id: 'monk1', name: 'Ajahn A', isDeleted: false, save });
    vi.spyOn(DharmaTalk, 'countDocuments').mockResolvedValue(2);

    const res = await request(app).delete('/api/monks/monk1');

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
    expect(res.body.message).toMatch(/soft-deleted/i);
  });
});
