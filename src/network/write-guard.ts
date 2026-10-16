import type { BrowserContext, Route } from '@playwright/test';

const trackerHosts =
  /(^|\.)(google-analytics\.com|googletagmanager\.com|doubleclick\.net|googleadservices\.com|clarity\.ms|licdn\.com|facebook\.net|facebook\.com)$/i;
export const isReadMethod = (method: string): boolean =>
  ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
export const safeUrl = (input: string): string => {
  const u = new URL(input);
  return `${u.origin}${u.pathname}`;
};

/** Browser-only guard: no production write-mode switch is provided. Install before navigation. */
export class WriteGuard {
  readonly blocked: Array<{ method: string; url: string; firstParty: boolean }> = [];
  private readonly mocks = new Map<string, (route: Route) => Promise<void>>();
  constructor(
    private readonly context: BrowserContext,
    private readonly origin: string,
  ) {}
  async install(): Promise<void> {
    await this.context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (
        trackerHosts.test(url.hostname) ||
        (url.origin === this.origin && url.pathname.startsWith('/ldr8/'))
      ) {
        await route.abort('blockedbyclient');
        return;
      }
      if (isReadMethod(request.method())) {
        await route.continue();
        return;
      }
      const handler = this.mocks.get(url.href);
      if (handler && request.method() === 'POST') {
        await handler(route);
        return;
      }
      this.blocked.push({
        method: request.method(),
        url: safeUrl(url.href),
        firstParty: url.origin === this.origin,
      });
      await route.abort('blockedbyclient');
    });
  }
  registerPostMock(url: string, handler: (route: Route) => Promise<void>): void {
    const resolved = new URL(url);
    if (resolved.origin !== this.origin)
      throw new Error('Lead mocks must target the configured site origin.');
    this.mocks.set(resolved.href, handler);
  }
}
