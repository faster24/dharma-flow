import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.resolve(__dirname, '../src/docs/openapi.json');

const policyDocumentRequiredKeys = [
  'type',
  'title',
  'version',
  'effectiveDate',
  'lastUpdated',
  'locale',
  'summary',
  'contentFormat',
  'content',
  'contactEmail',
  'contactUrl',
  'dataDeletionUrl',
  'platformCompliance',
];

describe('OpenAPI policy contract', () => {
  it('parses src/docs/openapi.json as valid JSON', () => {
    const rawSpec = readFileSync(openApiPath, 'utf8');

    expect(() => JSON.parse(rawSpec)).not.toThrow();
  });

  it('contains policy endpoints in documented paths', () => {
    const spec = JSON.parse(readFileSync(openApiPath, 'utf8'));

    expect(spec.paths).toHaveProperty('/api/policies/privacy');
    expect(spec.paths).toHaveProperty('/api/policies/terms');
  });

  it('keeps PolicyDocument required keys aligned with policy contract', () => {
    const spec = JSON.parse(readFileSync(openApiPath, 'utf8'));
    const typeSchema = spec.components.schemas.PolicyDocument.properties.type;
    const requiredKeys = spec.components.schemas.PolicyDocument.required;

    expect(typeSchema).toEqual({ type: 'string', enum: ['privacy', 'terms'] });
    expect(Array.isArray(requiredKeys)).toBe(true);
    for (const key of policyDocumentRequiredKeys) {
      expect(requiredKeys).toContain(key);
    }
  });
});
