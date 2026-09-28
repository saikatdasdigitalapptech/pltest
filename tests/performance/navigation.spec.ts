import { test, expect } from '../../src/fixtures/ui.fixture';
import { env } from '../../src/config/environment';

const ttfbBudget = env.ENFORCE_PERFORMANCE ? env.MAX_TTFB_MS : Number.POSITIVE_INFINITY;
const dclBudget = env.ENFORCE_PERFORMANCE
  ? env.MAX_DOM_CONTENT_LOADED_MS
  : Number.POSITIVE_INFINITY;

test('AIC-110 navigation timing @performance', async ({ commerce, page }, testInfo) => {
  await commerce.goto();
  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    if (!navigation) return null;
    return {
      ttfbMs: navigation.responseStart - navigation.requestStart,
      domContentLoadedMs: navigation.domContentLoadedEventEnd - navigation.startTime,
      transferBytes: navigation.transferSize,
      encodedBodyBytes: navigation.encodedBodySize,
    };
  });
  expect(timing).not.toBeNull();
  await testInfo.attach('navigation-timing', {
    body: JSON.stringify({ timing, budgetsEnforced: env.ENFORCE_PERFORMANCE }, null, 2),
    contentType: 'application/json',
  });
  expect(timing!.ttfbMs).toBeLessThanOrEqual(ttfbBudget);
  expect(timing!.domContentLoadedMs).toBeLessThanOrEqual(dclBudget);
});
