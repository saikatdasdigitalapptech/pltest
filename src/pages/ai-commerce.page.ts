import { expect, test } from '@playwright/test';
import type { Locator, Page, Response } from '@playwright/test';
import { env } from '../config/environment';
import { LeadForm } from './components/lead-form';
import { BookingDialog } from './components/booking-dialog';
import { SiteHeader } from './components/site-header';

export class AiCommercePage {
  readonly heading: Locator;
  readonly capabilities: Locator;
  readonly form: LeadForm;
  readonly booking: BookingDialog;
  readonly header: SiteHeader;
  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', {
      level: 1,
      name: 'Make your ecommerce intelligent.',
    });
    this.capabilities = page.locator('#capabilities');
    this.form = new LeadForm(page);
    this.booking = new BookingDialog(page);
    this.header = new SiteHeader(page);
  }
  async goto(): Promise<Response> {
    return test.step('Open AI Commerce and verify page identity', async () => {
      const response = await this.page.goto(env.AI_COMMERCE_PATH, {
        waitUntil: 'domcontentloaded',
      });
      if (!response) throw new Error('AI Commerce navigation returned no HTTP response.');
      expect(response.status(), 'AI Commerce HTTP status').toBe(200);
      await expect(this.heading).toBeVisible();
      // Form handlers and shared navigation are registered at DOMContentLoaded.
      return response;
    });
  }
  async followAnchor(name: string | RegExp, targetId: string): Promise<void> {
    await test.step(`Follow ${targetId} anchor`, async () => {
      await this.page.getByRole('link', { name, exact: typeof name === 'string' }).click();
      await expect(this.page.locator(`#${targetId}`)).toBeInViewport();
      await expect.poll(() => new URL(this.page.url()).hash).toBe(`#${targetId}`);
    });
  }
}
