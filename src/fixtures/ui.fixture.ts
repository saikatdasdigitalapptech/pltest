import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { AiCommercePage } from '../pages/ai-commerce.page';
import { env } from '../config/environment';
import { WriteGuard, safeUrl } from '../network/write-guard';

interface UiFixtures {
  commerce: AiCommercePage;
  guard: WriteGuard;
  diagnostics: void;
}
export const test = base.extend<UiFixtures>({
  guard: [
    async ({ context }, use, testInfo) => {
      const guard = new WriteGuard(context, env.BASE_URL);
      await guard.install();
      await use(guard);
      await testInfo.attach('write-guard', {
        body: JSON.stringify(guard.blocked, null, 2),
        contentType: 'application/json',
      });
      expect(
        guard.blocked.filter((entry) => entry.firstParty),
        'Unmocked first-party write attempts',
      ).toEqual([]);
    },
    { auto: true },
  ],
  commerce: async ({ page, guard: _guard }, use) => {
    await use(new AiCommercePage(page));
  },
  diagnostics: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      const failedResponses: Array<{ status: number; url: string }> = [];
      const observe = (observed: Page): void => {
        observed.on('pageerror', (error) =>
          errors.push(error.message.replace(/[\w.+-]+@[\w.-]+\.[a-z]+/gi, '[email]')),
        );
        observed.on('response', (response) => {
          if (response.status() >= 400 && new URL(response.url()).origin === env.BASE_URL) {
            failedResponses.push({ status: response.status(), url: safeUrl(response.url()) });
          }
        });
      };
      observe(page);
      await use();
      await testInfo.attach('browser-diagnostics', {
        body: JSON.stringify(
          { pageErrors: errors, failedFirstPartyResponses: failedResponses },
          null,
          2,
        ),
        contentType: 'application/json',
      });
    },
    { auto: true },
  ],
});
export { expect } from '@playwright/test';
