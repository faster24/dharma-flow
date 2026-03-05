process.env.TEST_BYPASS_AUTH = 'true';

import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../src/app';

const assertPolicyContract = (body, expectedType) => {
  expect(body).toHaveProperty('locale');
  expect(body).toHaveProperty('policy');

  expect(typeof body.locale).toBe('string');
  expect(typeof body.policy).toBe('object');

  expect(body.policy).toHaveProperty('type');
  expect(body.policy).toHaveProperty('title');
  expect(body.policy).toHaveProperty('version');
  expect(body.policy).toHaveProperty('effectiveDate');
  expect(body.policy).toHaveProperty('lastUpdated');
  expect(body.policy).toHaveProperty('locale');
  expect(body.policy).toHaveProperty('summary');
  expect(body.policy).toHaveProperty('contentFormat');
  expect(body.policy).toHaveProperty('content');
  expect(body.policy).toHaveProperty('contactEmail');
  expect(body.policy).toHaveProperty('contactUrl');
  expect(body.policy).toHaveProperty('dataDeletionUrl');
  expect(body.policy).toHaveProperty('platformCompliance');

  expect(typeof body.policy.type).toBe('string');
  expect(typeof body.policy.title).toBe('string');
  expect(typeof body.policy.version).toBe('string');
  expect(typeof body.policy.effectiveDate).toBe('string');
  expect(typeof body.policy.lastUpdated).toBe('string');
  expect(typeof body.policy.locale).toBe('string');
  expect(typeof body.policy.summary).toBe('string');
  expect(typeof body.policy.contentFormat).toBe('string');
  expect(typeof body.policy.content).toBe('string');
  expect(typeof body.policy.contactEmail).toBe('string');
  expect(typeof body.policy.contactUrl).toBe('string');
  expect(typeof body.policy.dataDeletionUrl).toBe('string');
  expect(typeof body.policy.platformCompliance).toBe('object');

  expect(body.policy.type).toBe(expectedType);

  expect(body.policy.platformCompliance).toHaveProperty('googlePlay');
  expect(body.policy.platformCompliance).toHaveProperty('appleAppStore');
  expect(typeof body.policy.platformCompliance.googlePlay).toBe('string');
  expect(typeof body.policy.platformCompliance.appleAppStore).toBe('string');
};

describe('Policy routes', () => {
  it('GET /api/v1/policies/privacy returns 200 with policy contract', async () => {
    const res = await request(app).get('/api/v1/policies/privacy');

    expect(res.status).toBe(200);
    assertPolicyContract(res.body, 'privacy');
    expect(res.body.locale).toBe('en-US');
    expect(res.body.policy.title).toBe('Privacy Policy');
  });

  it('GET /api/v1/policies/terms returns 200 with policy contract', async () => {
    const res = await request(app).get('/api/v1/policies/terms');

    expect(res.status).toBe(200);
    assertPolicyContract(res.body, 'terms');
    expect(res.body.locale).toBe('en-US');
    expect(res.body.policy.title).toBe('Terms of Service');
  });

  it('GET /api/v1/policies/privacy falls back to en-US for unsupported locale', async () => {
    const res = await request(app).get('/api/v1/policies/privacy?locale=fr-FR');

    expect(res.status).toBe(200);
    expect(res.body.locale).toBe('en-US');
    expect(res.body.policy.locale).toBe('en-US');
  });

  it('GET /api/v1/policies/:unknown returns 404 with message', async () => {
    const res = await request(app).get('/api/v1/policies/unknown');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });
});
