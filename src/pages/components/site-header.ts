import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

export class SiteHeader {
  readonly root: Locator;
  readonly navigation: Locator;
  readonly bookCall: Locator;
  readonly openNavigation: Locator;
  readonly closeNavigation: Locator;
  constructor(readonly page: Page) {
    this.root = page.locator('#masthead');
    this.navigation = page.locator('#site-navigation');
    this.bookCall = this.root.getByRole('button', { name: 'Book a Call', exact: true });
    this.openNavigation = this.root.getByRole('button', { name: 'Open navigation', exact: true });
    this.closeNavigation = this.root.getByRole('button', { name: 'Close navigation', exact: true });
  }
  async openMobileMenu(): Promise<void> {
    await this.openNavigation.click();
    await expect(this.openNavigation).toHaveAttribute('aria-expanded', 'true');
    await expect(this.closeNavigation).toBeVisible();
  }
}
