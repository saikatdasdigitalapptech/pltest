import { test, expect } from '@playwright/test';
import { LeadForm } from '../../src/pages/components/lead-form';
import { WriteGuard } from '../../src/network/write-guard';
import { readMultipart, stubLead } from '../../src/network/lead-stub';

test('FW-006 lead stub captures a real browser multipart body', async ({ page, context }) => {
  // An authored local contract fixture, not a copy of the website or a live-site test.
  const origin = 'http://framework.example.test';
  const guard = new WriteGuard(context, origin);
  await guard.install();
  await page.route(`${origin}/form`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en"><title>Multipart contract</title>
      <form id="contact-form-staffing" data-submit="/submit">
        <label for="name">Full name *</label><input id="name" name="full_name" value="Automation Tester">
        <input name="email" value="qa@example.com"><input name="website" value="">
        <button>Book An Appointment</button>
      </form><p id="result"></p>
      <script>document.querySelector('form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const response = await fetch('/submit', {method: 'POST', body: new FormData(event.target)});
        document.querySelector('#result').textContent = (await response.json()).message;
      });</script></html>`,
    }),
  );
  await page.goto(`${origin}/form`);
  const form = new LeadForm(page);
  const stub = await stubLead(guard, form, { body: { ok: false, message: 'Controlled response' } });
  await form.submit.click();
  await expect(page.locator('#result')).toHaveText('Controlled response');
  expect(stub.calls).toHaveLength(1);
  expect(await readMultipart(stub.calls[0]!)).toEqual({
    full_name: 'Automation Tester',
    email: 'qa@example.com',
    website: '',
  });
  expect(guard.blocked).toHaveLength(0);
});
