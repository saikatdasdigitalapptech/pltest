import { test, expect } from '../../src/fixtures/ui.fixture';
import { env } from '../../src/config/environment';

test.describe('Reviewed visual baselines @visual', () => {
  test.skip(
    !env.ENABLE_VISUAL,
    'Set ENABLE_VISUAL=true after reviewing and committing platform-specific baselines.',
  );

  test.beforeEach(async ({ commerce, page }) => {
    await commerce.goto();
    await page.evaluate(() => document.fonts.ready);
  });

  test('AIC-120 desktop hero', async ({ commerce, page }) => {
    await expect(commerce.heading).toBeVisible();
    await expect(page).toHaveScreenshot('hero.png', { fullPage: false });
  });

  test('AIC-121 capability grid', async ({ commerce }) => {
    await commerce.capabilities.scrollIntoViewIfNeeded();
    await expect(commerce.capabilities).toHaveScreenshot('capabilities.png');
  });

  test('AIC-122 lead form', async ({ commerce }) => {
    await commerce.form.root.scrollIntoViewIfNeeded();
    await expect(commerce.form.root).toHaveScreenshot('lead-form.png');
  });
});
