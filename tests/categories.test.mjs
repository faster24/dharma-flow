process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import app from '../src/app';
import Category from '../src/models/Category';
import Sutra from '../src/models/Sutra';

describe('Category routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/categories creates category', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue(null);
    vi.spyOn(Category, 'create').mockResolvedValue({ _id: 'cat1', name: 'Zen' });

    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Zen' });

    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe('Zen');
  });

  it('DELETE /api/categories soft-deletes when sutras exist', async () => {
    vi.spyOn(Category, 'findById').mockResolvedValue({ _id: 'cat1', name: 'Zen', isDeleted: false, save: vi.fn() });
    vi.spyOn(Sutra, 'countDocuments').mockResolvedValue(2);

    const res = await request(app).delete('/api/categories/cat1');

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/soft-deleted/i);
  });
});
