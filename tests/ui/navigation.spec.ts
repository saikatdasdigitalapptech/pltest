import { test, expect } from '../../src/fixtures/ui.fixture';
import { capabilities } from '../../src/data/commerce';

test.describe('Navigation @regression', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
  });

  for (const [index, capability] of capabilities.entries()) {
    test(`AIC-${String(10 + index).padStart(3, '0')} ${capability.id} card reaches its detail`, async ({
      commerce,
      page,
    }) => {
      await commerce.capabilities.locator(`a[href="#${capability.id}"]`).click();
      const target = page.locator(`#${capability.id}`);
      await expect(
        target.getByRole('heading', { name: capability.title, exact: true }),
      ).toBeVisible();
      await expect(target).toBeInViewport();
      await expect.poll(() => new URL(page.url()).hash).toBe(`#${capability.id}`);
    });
  }

  test('AIC-018 hero roadmap CTA reaches contact form', async ({ commerce }) => {
    await commerce.followAnchor(/Build your AI commerce roadmap/i, 'contact');
    await expect(commerce.form.root).toBeInViewport();
  });

  test('AIC-019 See what we build reaches capabilities', async ({ commerce }) => {
    await commerce.followAnchor('See what we build', 'capabilities');
    await expect(commerce.capabilities.getByRole('heading', { level: 2 })).toHaveText(
      'What we can build for you',
    );
  });

  test('AIC-020 stack CTA reaches contact', async ({ commerce }) => {
    await commerce.followAnchor(/Plan your stack with us/i, 'contact');
    await expect(commerce.form.root).toBeInViewport();
  });

  test('AIC-021 Services menu contains the current service', async ({ commerce }) => {
    await commerce.header.navigation
      .getByRole('button', { name: 'Expand Services submenu', exact: true })
      .click();
    await expect(
      commerce.header.navigation.locator('#mega-menu-2 a[href$="/ai-commerce/"]'),
    ).toBeVisible();
  });
});
