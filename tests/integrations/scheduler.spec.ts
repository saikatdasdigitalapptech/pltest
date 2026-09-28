import { test, expect } from '../../src/fixtures/ui.fixture';
import { env } from '../../src/config/environment';

test('AIC-130 live booking provider renders its consultation view @scheduler', async ({
  commerce,
}) => {
  test.skip(!env.ENABLE_SCHEDULER, 'Optional third-party read-only availability check.');
  await commerce.goto();
  await commerce.booking.open();
  await expect(
    commerce.booking.scheduler.getByRole('heading', { name: 'Free Consultation', exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await expect(
    commerce.booking.scheduler.getByRole('button', { name: 'View next month', exact: true }),
  ).toBeVisible();
  // No date/time selection or Confirm click: successful booking needs a dedicated test tenant.
});
