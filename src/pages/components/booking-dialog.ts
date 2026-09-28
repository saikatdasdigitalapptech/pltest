import { expect, test } from '@playwright/test';
import type { Locator, Page, FrameLocator } from '@playwright/test';

export class BookingDialog {
  readonly root: Locator;
  readonly closeButton: Locator;
  readonly bookingTab: Locator;
  readonly connectTab: Locator;
  readonly bookingPanel: Locator;
  readonly connectPanel: Locator;
  readonly iframe: Locator;
  readonly scheduler: FrameLocator;
  constructor(readonly page: Page) {
    // The current website lacks role=dialog; keeping this ID lets accessibility tests expose that defect.
    this.root = page.locator('#requirement');
    this.closeButton = this.root.getByRole('button', { name: 'Close dialogue', exact: true });
    this.bookingTab = this.root.getByRole('tab', { name: 'Book An Appointment', exact: true });
    this.connectTab = this.root.getByRole('tab', { name: 'Connect with Us', exact: true });
    this.bookingPanel = this.root.locator('#mdltabpanel-1');
    this.connectPanel = this.root.locator('#mdltabpanel-2');
    this.iframe = this.bookingPanel.locator('iframe[title="Book a call"]');
    this.scheduler = this.bookingPanel.frameLocator('iframe[title="Book a call"]');
  }
  async open(): Promise<void> {
    await test.step('Open Book a Call dialog', async () => {
      await this.page
        .locator('#masthead')
        .getByRole('button', { name: 'Book a Call', exact: true })
        .click();
      await expect(this.closeButton).toBeVisible();
    });
  }
  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.closeButton).toBeHidden();
  }
}
