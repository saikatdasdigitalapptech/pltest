import { test, expect } from '../../src/fixtures/ui.fixture';
import { syntheticLead, serviceOptions, regionOptions } from '../../src/data/commerce';
import { stubLead } from '../../src/network/lead-stub';

test.describe('Lead validation @regression @forms', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
  });

  test('AIC-040 empty submission shows field errors and focuses name', async ({
    commerce,
    guard,
  }) => {
    const stub = await stubLead(guard, commerce.form, { body: { ok: false } });
    await commerce.form.submit.click();
    await expect(commerce.form.fullName).toHaveAttribute('aria-invalid', 'true');
    await expect(commerce.form.email).toHaveAttribute('aria-invalid', 'true');
    await expect(commerce.form.company).toHaveAttribute('aria-invalid', 'true');
    await expect(commerce.form.fullName).toBeFocused();
    await expect(commerce.form.status).toHaveText(
      'Please fix the highlighted fields and try again.',
    );
    expect(stub.calls).toHaveLength(0);
  });

  const invalidCases = [
    {
      id: 41,
      label: 'single-character name',
      field: 'fullName',
      input: 'A',
      selector: 'osd_full_name',
      message: 'Name must be at least 2 characters.',
    },
    {
      id: 42,
      label: 'digits in name',
      field: 'fullName',
      input: 'Tester123',
      selector: 'osd_full_name',
      message: 'Name contains invalid characters.',
    },
    {
      id: 43,
      label: 'missing email domain',
      field: 'email',
      input: 'qa@',
      selector: 'osd_email',
      message: 'Please enter a valid email address.',
    },
    {
      id: 44,
      label: 'email without at sign',
      field: 'email',
      input: 'qa.example.com',
      selector: 'osd_email',
      message: 'Please enter a valid email address.',
    },
    {
      id: 45,
      label: 'whitespace-only company',
      field: 'company',
      input: '   ',
      selector: 'osd_company',
      message: 'Please enter your company name.',
    },
  ] as const;
  for (const data of invalidCases) {
    test(`AIC-0${data.id} rejects ${data.label}`, async ({ commerce, guard }) => {
      const stub = await stubLead(guard, commerce.form, { body: { ok: false } });
      await commerce.form.fill({ ...syntheticLead(), [data.field]: data.input });
      await commerce.form.submit.click();
      await expect(commerce.form.errorFor(data.selector)).toHaveText(data.message);
      expect(stub.calls).toHaveLength(0);
    });
  }

  test('AIC-046 editing an invalid value clears its error', async ({ commerce }) => {
    await commerce.form.submit.click();
    await expect(commerce.form.fullName).toHaveAttribute('aria-invalid', 'true');
    await commerce.form.fullName.fill('Automation Tester');
    await expect(commerce.form.fullName).not.toHaveAttribute('aria-invalid', 'true');
    await expect(commerce.form.errorFor('osd_full_name')).toBeEmpty();
  });

  test('AIC-047 service and region contracts match the published choices', async ({ commerce }) => {
    await expect(commerce.form.service.locator('option')).toHaveText([...serviceOptions]);
    await expect(commerce.form.region.locator('option')).toHaveText([...regionOptions]);
    await commerce.form.service.selectOption('AI commerce roadmap');
    await commerce.form.region.selectOption('United Kingdom');
    await expect(commerce.form.service).toHaveValue('AI commerce roadmap');
    await expect(commerce.form.region).toHaveValue('United Kingdom');
  });

  test('AIC-048 text fields enforce their documented maxlength', async ({ commerce }) => {
    await expect(commerce.form.fullName).toHaveAttribute('maxlength', '100');
    await expect(commerce.form.email).toHaveAttribute('maxlength', '120');
    await expect(commerce.form.company).toHaveAttribute('maxlength', '120');
    await expect(commerce.form.phone).toHaveAttribute('maxlength', '20');
  });

  test('AIC-049 one-digit phone is rejected when provided', async ({ commerce, guard }) => {
    const stub = await stubLead(guard, commerce.form, {
      body: { ok: false, message: 'Test stop' },
    });
    await commerce.form.fill({ ...syntheticLead(), phone: '1' });
    await commerce.form.submit.click();
    await expect(commerce.form.phone).toHaveAttribute('aria-invalid', 'true');
    expect(stub.calls).toHaveLength(0);
  });
});
