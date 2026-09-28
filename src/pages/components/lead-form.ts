import { test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type { LeadData } from '../../data/commerce';

export class LeadForm {
  readonly root: Locator;
  readonly fullName: Locator;
  readonly email: Locator;
  readonly company: Locator;
  readonly phone: Locator;
  readonly service: Locator;
  readonly region: Locator;
  readonly requirement: Locator;
  readonly upload: Locator;
  readonly uploadName: Locator;
  readonly submit: Locator;
  readonly status: Locator;
  constructor(readonly page: Page) {
    this.root = page.locator('#contact-form-staffing');
    this.fullName = this.root.getByRole('textbox', { name: 'Full name *', exact: true });
    this.email = this.root.getByRole('textbox', { name: 'Work email *', exact: true });
    this.company = this.root.getByRole('textbox', { name: 'Company *', exact: true });
    this.phone = this.root.getByRole('textbox', { name: 'Phone', exact: true });
    this.service = this.root.getByRole('combobox', { name: 'Service Required *', exact: true });
    this.region = this.root.getByRole('combobox', { name: 'Where are you based?', exact: true });
    this.requirement = this.root.getByRole('textbox', {
      name: 'What platform is the store on, and what should AI improve first?',
      exact: true,
    });
    // Two labels point at this file input; its unique ID avoids ambiguous label matching.
    this.upload = this.root.locator('#osd_attached_file');
    this.uploadName = this.root.locator('#osd-file-name');
    this.submit = this.root.getByRole('button', {
      name: /^(Book An Appointment|Submitting\.\.\.)$/,
    });
    this.status = this.root.locator('#osdFormStatus');
  }
  async fill(data: LeadData): Promise<void> {
    await test.step('Fill synthetic lead details', async () => {
      await this.fullName.fill(data.fullName);
      await this.email.fill(data.email);
      await this.company.fill(data.company);
      if (data.phone !== undefined) await this.phone.fill(data.phone);
      if (data.service !== undefined) await this.service.selectOption({ label: data.service });
      if (data.region !== undefined) await this.region.selectOption({ label: data.region });
      if (data.requirement !== undefined) await this.requirement.fill(data.requirement);
    });
  }
  errorFor(id: string): Locator {
    return this.root
      .locator('.osd-field')
      .filter({ has: this.page.locator(`#${id}`) })
      .locator('.field-error');
  }
  async endpoint(): Promise<string> {
    const endpoint = await this.root.getAttribute('data-submit');
    if (!endpoint) throw new Error('Lead form data-submit contract is missing.');
    return new URL(endpoint, this.page.url()).href;
  }
  async thankYouUrl(): Promise<string> {
    const url = await this.root.getAttribute('data-thankyou');
    if (!url) throw new Error('Lead form data-thankyou contract is missing.');
    return new URL(url, this.page.url()).href;
  }
}
