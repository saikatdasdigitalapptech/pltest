import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('Book a Call wrapper @regression', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
    await commerce.booking.open();
  });

  test('AIC-030 switching tabs displays the corresponding form', async ({ commerce }) => {
    const modal = commerce.booking;
    await modal.connectTab.click();
    await expect(modal.connectTab).toHaveAttribute('aria-selected', 'true');
    await expect(modal.bookingTab).toHaveAttribute('aria-selected', 'false');
    await expect(
      modal.connectPanel.getByRole('textbox', { name: 'Name', exact: true }),
    ).toBeVisible();
    await expect(modal.bookingPanel).toBeHidden();
    await modal.bookingTab.click();
    await expect(modal.bookingPanel).toBeVisible();
    await expect(modal.connectPanel).toBeHidden();
  });

  test('AIC-031 Escape dismisses the dialog', async ({ commerce, page }) => {
    await page.keyboard.press('Escape');
    await expect(commerce.booking.closeButton).toBeHidden();
  });

  test('AIC-032 booking iframe has the expected provider and title', async ({ commerce }) => {
    await expect(commerce.booking.iframe).toBeAttached();
    await expect(commerce.booking.iframe).toHaveAttribute(
      'src',
      /^https:\/\/app\.cal\.com\/digital-aptech-pvt-ltd\/free-consultation-uk\/embed\?/,
    );
    await expect(commerce.booking.iframe).toHaveAttribute('title', 'Book a call');
  });
});
