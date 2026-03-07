import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.resolve(__dirname, '../src/docs/openapi.json');

describe('OpenAPI auth contract', () => {
  it('documents auth endpoints with endpoint-specific request and response schemas', () => {
    const spec = JSON.parse(readFileSync(openApiPath, 'utf8'));

    const registerPost = spec.paths['/api/v1/auth/register']?.post;
    const loginPost = spec.paths['/api/v1/auth/login']?.post;

    expect(registerPost).toBeDefined();
    expect(loginPost).toBeDefined();
    expect(registerPost.requestBody.content['application/json'].schema.$ref).toBe('#/components/schemas/RegisterAuthRequest');
    expect(registerPost.responses['200'].content['application/json'].schema.$ref).toBe('#/components/schemas/RegisterAuthResponse');
    expect(loginPost.requestBody.content['application/json'].schema.$ref).toBe('#/components/schemas/LoginAuthRequest');
    expect(loginPost.responses['200'].content['application/json'].schema.$ref).toBe('#/components/schemas/LoginAuthResponse');
  });

  it('requires username for register request and forbids requiring username for login request', () => {
    const spec = JSON.parse(readFileSync(openApiPath, 'utf8'));

    const registerRequired = spec.components.schemas.RegisterAuthRequest.required;
    const loginRequired = spec.components.schemas.LoginAuthRequest.required;

    expect(registerRequired).toContain('username');
    expect(loginRequired).toEqual(expect.arrayContaining(['email', 'password']));
    expect(loginRequired).not.toContain('username');
  });

  it('keeps login response free of profile fields', () => {
    const spec = JSON.parse(readFileSync(openApiPath, 'utf8'));
    const loginResponseProperties = spec.components.schemas.LoginAuthResponse.properties;

    expect(loginResponseProperties).toMatchObject({
      uid: expect.any(Object),
      idToken: expect.any(Object),
      refreshToken: expect.any(Object),
      email: expect.any(Object),
    });
    expect(loginResponseProperties).not.toHaveProperty('username');
    expect(loginResponseProperties).not.toHaveProperty('birthday');
  });
});
