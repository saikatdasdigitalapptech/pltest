import { test, expect } from '../../src/fixtures/ui.fixture';
import { env } from '../../src/config/environment';

test.describe('Content and metadata @seo', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
  });

  test('AIC-090 page has one H1, language, description, canonical, and viewport', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', /^en(?:-|$)/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S.{30,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^https:\/\/digitalaptech\.com\/services\/ai-commerce\/$/,
    );
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /width=device-width/,
    );
  });

  test('AIC-091 capability and CTA fragment links resolve to unique elements', async ({ page }) => {
    const broken = await page.locator('main a[href^="#"]').evaluateAll((links) =>
      links.flatMap((link) => {
        const hash = link.getAttribute('href') ?? '';
        if (hash === '#') return [];
        const id = decodeURIComponent(hash.slice(1));
        const count = document.querySelectorAll(`[id="${CSS.escape(id)}"]`).length;
        return count === 1 ? [] : [{ hash, count }];
      }),
    );
    expect(broken).toEqual([]);
  });

  test('AIC-092 meaningful main images load and carry alt text', async ({ page }) => {
    const images = page.locator('main > section img');
    expect(await images.count()).toBeGreaterThan(0);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute('alt');
      await expect
        .poll(() =>
          image.evaluate(
            (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
  });

  test('AIC-093 footer policy links use HTTPS and the correct origin', async ({ page }) => {
    for (const label of ['Privacy Policy', 'Cookie Policy', 'Terms and Conditions']) {
      const link = page.getByRole('contentinfo').getByRole('link', { name: label, exact: true });
      await expect(link).toHaveAttribute('href', /.+/);
      const href = await link.getAttribute('href');
      expect(new URL(href!).protocol).toBe('https:');
      // Published policy links can intentionally stay on the production canonical site in staging.
      expect([env.BASE_URL, 'https://digitalaptech.com']).toContain(new URL(href!).origin);
    }
  });
});
