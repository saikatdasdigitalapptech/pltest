import type { Page, Request as PlaywrightRequest } from '@playwright/test';
import type { LeadForm } from '../pages/components/lead-form';
import type { WriteGuard } from './write-guard';

export interface LeadStubOptions {
  status?: number;
  body?: unknown;
  rawBody?: string;
  abort?: boolean;
  release?: Promise<void>;
}

export async function stubLead(guard: WriteGuard, form: LeadForm, options: LeadStubOptions = {}) {
  const calls: PlaywrightRequest[] = [];
  guard.registerPostMock(await form.endpoint(), async (route) => {
    calls.push(route.request());
    if (options.release) await options.release;
    if (options.abort) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({
      status: options.status ?? 200,
      contentType: options.rawBody !== undefined ? 'text/plain' : 'application/json',
      body:
        options.rawBody ?? JSON.stringify(options.body ?? { ok: true, message: 'Test accepted' }),
    });
  });
  return { calls };
}

export async function readMultipart(request: PlaywrightRequest): Promise<Record<string, string>> {
  const payload = request.postDataBuffer();
  if (!payload) throw new Error('Missing multipart request payload.');
  const contentType = request.headers()['content-type'];
  if (!contentType) throw new Error('Missing multipart Content-Type.');
  const data = await new Response(new Uint8Array(payload), {
    headers: { 'Content-Type': contentType },
  }).formData();
  return Object.fromEntries(
    [...data.entries()].filter((pair): pair is [string, string] => typeof pair[1] === 'string'),
  );
}

export async function stubThankYou(page: Page, url: string): Promise<void> {
  await page.route(url, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>Test-only confirmation</title><h1>Mock confirmation</h1></html>',
    }),
  );
}
