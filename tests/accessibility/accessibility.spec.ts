import { test, expect } from '../../src/fixtures/ui.fixture';
import { expectNoA11yViolations } from '../../src/utils/accessibility';

test.describe('Accessibility @a11y', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
  });

  test('AIC-080 page WCAG A/AA automated scan', async ({ page }, testInfo) => {
    await expectNoA11yViolations(page, testInfo);
  });

  test('AIC-081 lead validation state automated scan', async ({ commerce, page }, testInfo) => {
    await commerce.form.submit.click();
    await expect(commerce.form.fullName).toBeFocused();
    await expectNoA11yViolations(page, testInfo, '#contact-form-staffing');
  });

  test('AIC-082 dialog has modal semantics and an accessible name', async ({ commerce }) => {
    await commerce.booking.open();
    await expect(commerce.booking.root).toHaveAttribute('role', 'dialog');
    await expect(commerce.booking.root).toHaveAttribute('aria-modal', 'true');
    await expect(commerce.booking.root).toHaveAccessibleName(/.+/);
  });

  test('AIC-083 opening dialog moves focus inside; Tab stays inside', async ({
    commerce,
    page,
  }) => {
    await commerce.header.bookCall.focus();
    await commerce.header.bookCall.press('Enter');
    const modalOwnsFocus = () =>
      commerce.booking.root.evaluate((root) => root.contains(document.activeElement));
    await expect.poll(modalOwnsFocus, { message: 'Initial dialog focus' }).toBe(true);
    await commerce.booking.connectTab.click();
    for (let index = 0; index < 16; index++) {
      await page.keyboard.press('Tab');
      expect(await modalOwnsFocus(), `Focus escaped after Tab ${index + 1}`).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await modalOwnsFocus()).toBe(true);
  });

  test('AIC-084 closing dialog restores focus to trigger', async ({ commerce }) => {
    await commerce.header.bookCall.focus();
    await commerce.header.bookCall.press('Enter');
    await commerce.booking.close();
    await expect(commerce.header.bookCall).toBeFocused();
  });
});
