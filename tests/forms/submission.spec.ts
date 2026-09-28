import { test, expect } from '../../src/fixtures/ui.fixture';
import { syntheticLead } from '../../src/data/commerce';
import { readMultipart, stubLead, stubThankYou } from '../../src/network/lead-stub';

test.describe('Intercepted lead submission @regression @forms @mocked', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
  });

  test('AIC-060 valid details produce multipart data and follow the configured redirect', async ({
    commerce,
    guard,
    page,
  }) => {
    const lead = syntheticLead('payload');
    const stub = await stubLead(guard, commerce.form);
    const thankYou = await commerce.form.thankYouUrl();
    await stubThankYou(page, thankYou);
    await commerce.form.fill(lead);
    await commerce.form.submit.click();
    await expect(page).toHaveURL(thankYou);
    await expect(page.getByRole('heading', { name: 'Mock confirmation' })).toBeVisible();
    expect(stub.calls).toHaveLength(1);
    const request = stub.calls[0];
    expect(request).toBeDefined();
    expect(await readMultipart(request!)).toMatchObject({
      full_name: lead.fullName,
      email: lead.email,
      company_name: lead.company,
      service: lead.service,
      region: lead.region,
      requirement: lead.requirement,
      website: '',
    });
    expect(request!.headers()['x-requested-with']).toBe('XMLHttpRequest');
  });

  test('AIC-061 server validation error is associated with the field', async ({
    commerce,
    guard,
  }) => {
    await stubLead(guard, commerce.form, {
      status: 422,
      body: {
        ok: false,
        message: 'Please check your work email.',
        errors: { email: 'Work email required.' },
      },
    });
    await commerce.form.fill(syntheticLead());
    await commerce.form.submit.click();
    await expect(commerce.form.email).toHaveAttribute('aria-invalid', 'true');
    await expect(commerce.form.errorFor('osd_email')).toHaveText('Work email required.');
    await expect(commerce.form.status).toHaveText('Please check your work email.');
    await expect(commerce.form.submit).toBeEnabled();
  });

  test('AIC-062 HTTP 500 gives a recoverable error', async ({ commerce, guard }) => {
    await stubLead(guard, commerce.form, {
      status: 500,
      body: { ok: false, message: 'Service unavailable. Please try again.' },
    });
    await commerce.form.fill(syntheticLead());
    await commerce.form.submit.click();
    await expect(commerce.form.status).toHaveText('Service unavailable. Please try again.');
    await expect(commerce.form.submit).toBeEnabled();
    await expect(commerce.form.email).toHaveValue(syntheticLead().email);
  });

  test('AIC-063 malformed response gives an error without navigation', async ({
    commerce,
    guard,
    page,
  }) => {
    await stubLead(guard, commerce.form, { rawBody: '<html>gateway error</html>' });
    const original = page.url();
    await commerce.form.fill(syntheticLead());
    await commerce.form.submit.click();
    await expect(commerce.form.status).toHaveText('Invalid server response.');
    await expect(page).toHaveURL(original);
    await expect(commerce.form.submit).toBeEnabled();
  });

  test('AIC-064 failed network request restores the button', async ({ commerce, guard }) => {
    await stubLead(guard, commerce.form, { abort: true });
    await commerce.form.fill(syntheticLead());
    await commerce.form.submit.click();
    await expect(commerce.form.status).not.toBeEmpty();
    await expect(commerce.form.submit).toBeEnabled();
    await expect(commerce.form.submit).toHaveText('Book An Appointment');
  });

  test('AIC-065 pending submission disables repeat clicks', async ({ commerce, guard }) => {
    let releaseResponse!: () => void;
    const release = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    const stub = await stubLead(guard, commerce.form, {
      release,
      body: { ok: false, message: 'Controlled test response.' },
    });
    try {
      await commerce.form.fill(syntheticLead());
      await commerce.form.submit.click();
      await expect(commerce.form.submit).toBeDisabled();
      await expect(commerce.form.submit).toHaveText('Submitting...');
      await expect.poll(() => stub.calls.length).toBe(1);
      // A real Enter key during the pending request must not submit a second lead.
      await commerce.form.company.press('Enter');
      expect(stub.calls).toHaveLength(1);
    } finally {
      releaseResponse();
    }
    await expect(commerce.form.submit).toBeEnabled();
    expect(stub.calls).toHaveLength(1);
  });

  test('AIC-066 Unicode name is accepted by client validation', async ({ commerce, guard }) => {
    const stub = await stubLead(guard, commerce.form, {
      body: { ok: false, message: 'Controlled test response.' },
    });
    await commerce.form.fill({ ...syntheticLead(), fullName: 'সৈকত দাস' });
    await commerce.form.submit.click();
    await expect(commerce.form.status).toHaveText('Controlled test response.');
    expect(stub.calls).toHaveLength(1);
  });
});
