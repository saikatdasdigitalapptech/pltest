import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test, expect } from '@playwright/test';
import { WriteGuard } from '../../src/network/write-guard';

test('FW-005 browser writes are blocked or mocked before reaching the server', async ({
  context,
  page,
}) => {
  let serverWrites = 0;
  const server = createServer((request, response) => {
    if (request.method === 'POST') serverWrites++;
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(
      '<!doctype html><html lang="en"><title>Guard test</title><p>Local safety contract</p></html>',
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const guard = new WriteGuard(context, origin);
    await guard.install();
    await page.goto(origin);
    const blocked = await page.evaluate(async () => {
      try {
        await fetch('/unknown-write', { method: 'POST', body: 'synthetic' });
        return false;
      } catch {
        return true;
      }
    });
    expect(blocked).toBe(true);
    expect(guard.blocked).toHaveLength(1);
    let mockCalls = 0;
    guard.registerPostMock(`${origin}/known-write`, async (route) => {
      mockCalls++;
      await route.fulfill({ json: { ok: true } });
    });
    const mocked = await page.evaluate(
      async () =>
        (await fetch('/known-write', { method: 'POST' })).json() as Promise<{ ok: boolean }>,
    );
    expect(mocked).toEqual({ ok: true });
    expect(mockCalls).toBe(1);
    expect(serverWrites).toBe(0);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
