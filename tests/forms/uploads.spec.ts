import { test, expect } from '../../src/fixtures/ui.fixture';
import { syntheticLead } from '../../src/data/commerce';
import { stubLead, stubThankYou } from '../../src/network/lead-stub';

test.describe('Attachment validation @regression @forms', () => {
  test.beforeEach(async ({ commerce }) => {
    await commerce.goto();
    await commerce.form.fill(syntheticLead());
  });

  test('AIC-050 accepted text attachment displays its filename and can be cleared', async ({
    commerce,
  }) => {
    await commerce.form.upload.setInputFiles({
      name: 'requirements.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Synthetic QA requirements'),
    });
    await expect(commerce.form.uploadName).toHaveText('requirements.txt');
    await commerce.form.upload.setInputFiles([]);
    await expect(commerce.form.uploadName).toHaveText('Choose Any File');
  });

  test('AIC-051 unsupported file extension is rejected', async ({ commerce, guard }) => {
    const stub = await stubLead(guard, commerce.form, { body: { ok: false } });
    await commerce.form.upload.setInputFiles({
      name: 'unsupported.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('Harmless text, not an executable'),
    });
    await commerce.form.submit.click();
    await expect(commerce.form.errorFor('osd_attached_file')).toContainText(
      'Please upload a valid file type',
    );
    expect(stub.calls).toHaveLength(0);
  });

  test('AIC-052 file above 5 MiB is rejected before a request', async ({ commerce, guard }) => {
    const stub = await stubLead(guard, commerce.form, { body: { ok: false } });
    await commerce.form.upload.setInputFiles({
      name: 'oversized.txt',
      mimeType: 'text/plain',
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1, 'a'),
    });
    await commerce.form.submit.click();
    await expect(commerce.form.errorFor('osd_attached_file')).toHaveText(
      'File must be 5MB or less.',
    );
    expect(stub.calls).toHaveLength(0);
  });

  test('AIC-053 file exactly 5 MiB reaches the intercepted endpoint', async ({
    commerce,
    guard,
    page,
  }) => {
    const stub = await stubLead(guard, commerce.form);
    const thankYou = await commerce.form.thankYouUrl();
    await stubThankYou(page, thankYou);
    await commerce.form.upload.setInputFiles({
      name: 'boundary.txt',
      mimeType: 'text/plain',
      buffer: Buffer.alloc(5 * 1024 * 1024, 'a'),
    });
    await commerce.form.submit.click();
    await expect(page).toHaveURL(thankYou);
    expect(stub.calls).toHaveLength(1);
  });
});
