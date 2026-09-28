import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/environment';

/** Public HTTP contract checks only; it cannot submit leads or create bookings. */
export class PublicSiteService {
  constructor(private readonly request: APIRequestContext) {}
  async get(path: string): Promise<APIResponse> {
    const url = new URL(path, env.BASE_URL);
    if (url.origin !== env.BASE_URL || url.username || url.password)
      throw new Error('Only same-origin public reads are supported.');
    return this.request.get(url.href, { timeout: 45000, maxRedirects: 0, failOnStatusCode: false });
  }
}
