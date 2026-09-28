import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('AI Commerce smoke @smoke', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
  });

  test('AIC-001 page identity and primary conversion CTA', async ({ commerce, page }) => {
    await expect(page).toHaveTitle(/AI Commerce.*Digital Aptech/);
    await expect(commerce.heading).toBeVisible();
    await expect(page.getByRole('link', { name: /Build your AI commerce roadmap/i })).toBeVisible();
    await expect(commerce.header.bookCall).toHaveText('Book a Call');
  });

  test('AIC-002 eight capability cards are present', async ({ commerce }) => {
    await expect(commerce.capabilities.getByRole('link')).toHaveCount(8);
  });

  test('AIC-003 lead form is available with the correct default service', async ({ commerce }) => {
    await commerce.form.root.scrollIntoViewIfNeeded();
    await expect(commerce.form.fullName).toBeVisible();
    await expect(commerce.form.service).toHaveValue('AI Commerce');
    await expect(commerce.form.submit).toBeEnabled();
  });

  test('AIC-004 Book a Call dialog opens and closes', async ({ commerce }) => {
    await commerce.booking.open();
    await expect(commerce.booking.bookingTab).toHaveAttribute('aria-selected', 'true');
    await commerce.booking.close();
    await expect(commerce.header.bookCall).toBeVisible();
  });
});
