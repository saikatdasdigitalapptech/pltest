import { test, expect } from '@playwright/test';
import { parseEnvironment } from '../../src/config/environment';
import { isReadMethod, safeUrl } from '../../src/network/write-guard';

test('FW-001 environment parser rejects accidental production staging', () => {
  expect(() => parseEnvironment({ TEST_ENV: 'staging' })).toThrow(/non-production/);
  expect(parseEnvironment({ TEST_ENV: 'qa', BASE_URL: 'https://qa.example.test' }).BASE_URL).toBe(
    'https://qa.example.test',
  );
});

test('FW-002 booleans are parsed explicitly', () => {
  expect(parseEnvironment({ CI: 'false', HEADLESS: 'false' }).CI).toBe(false);
  expect(parseEnvironment({ CI: 'true' }).CI).toBe(true);
  expect(() => parseEnvironment({ ENABLE_VISUAL: 'yes' })).toThrow();
});

test('FW-003 credentials and cross-origin paths are rejected', () => {
  expect(() => parseEnvironment({ BASE_URL: 'https://user:secret@example.test' })).toThrow();
  expect(() => parseEnvironment({ AI_COMMERCE_PATH: '//example.test/' })).toThrow();
  expect(() => parseEnvironment({ BASE_URL: 'https://example.test/page/' })).toThrow();
});

test('FW-004 write classification and evidence URL redaction', () => {
  expect(['GET', 'HEAD', 'OPTIONS'].every(isReadMethod)).toBe(true);
  expect(['POST', 'PATCH', 'PUT', 'DELETE'].some(isReadMethod)).toBe(false);
  expect(safeUrl('https://example.test/contact?email=private@example.test#secret')).toBe(
    'https://example.test/contact',
  );
});
