import { test, expect } from '../../src/fixtures/ui.fixture';
import { assertNoOverflow } from '../../src/utils/layout';

test.describe('Responsive layout @responsive', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
  });

  test('AIC-070 page has no horizontal overflow', async ({ page }, testInfo) => {
    await assertNoOverflow(page, testInfo);
  });

  test('AIC-071 lead form controls remain inside the viewport', async ({ commerce, page }) => {
    await commerce.form.root.scrollIntoViewIfNeeded();
    const viewportWidth = page.viewportSize()?.width;
    expect(viewportWidth).toBeDefined();
    for (const control of [
      commerce.form.fullName,
      commerce.form.email,
      commerce.form.company,
      commerce.form.service,
      commerce.form.submit,
    ]) {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth! + 1);
    }
  });

  test('AIC-072 mobile menu opens and closes', async ({ commerce }) => {
    await commerce.header.openMobileMenu();
    await expect(
      commerce.header.navigation.getByRole('link', { name: 'Contact Us', exact: true }),
    ).toBeVisible();
    await commerce.header.closeNavigation.click();
    await expect(commerce.header.openNavigation).toHaveAttribute('aria-expanded', 'false');
  });

  test('AIC-073 hero text has horizontal breathing room', async ({ commerce, page }) => {
    const box = await commerce.heading.boundingBox();
    const width = page.viewportSize()?.width;
    expect(box).not.toBeNull();
    expect(width).toBeDefined();
    // Proposed design floor: 16 CSS pixels on both sides, documented in coverage.md.
    expect(box!.x).toBeGreaterThanOrEqual(16);
    expect(width! - box!.x - box!.width).toBeGreaterThanOrEqual(16);
  });

  test('AIC-074 320px layout still fits', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await assertNoOverflow(page, testInfo);
  });
});
