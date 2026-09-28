import { test, expect } from '../../src/fixtures/api.fixture';
import { env } from '../../src/config/environment';

test.describe('Public HTTP contracts @api', () => {
  test('AIC-100 AI Commerce returns HTML with the expected identity', async ({ site }) => {
    const response = await site.get(env.AI_COMMERCE_PATH);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    const body = await response.text();
    expect(body).toContain('Make your ecommerce intelligent.');
    expect(body).toContain('contact-form-staffing');
    await response.dispose();
  });

  test('AIC-101 document headers are captured and do not expose a PHP version', async ({
    site,
  }, testInfo) => {
    const response = await site.get(env.AI_COMMERCE_PATH);
    expect(response.status()).toBe(200);
    const headers = response.headers();
    const selected = Object.fromEntries(
      [
        'content-type',
        'strict-transport-security',
        'content-security-policy',
        'x-content-type-options',
        'referrer-policy',
        'x-powered-by',
      ].map((key) => [key, headers[key] ?? '(absent)']),
    );
    await testInfo.attach('response-header-review', {
      body: JSON.stringify(selected, null, 2),
      contentType: 'application/json',
    });
    expect(headers['x-powered-by'] ?? '').not.toMatch(/PHP\/\d/i);
    await response.dispose();
  });

  for (const [index, path] of [
    '/privacy-policy/',
    '/cookie-policy/',
    '/terms-and-conditions/',
  ].entries()) {
    test(`AIC-${102 + index} ${path} is reachable without redirect`, async ({ site }) => {
      const response = await site.get(path);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/html');
      await response.dispose();
    });
  }
});
