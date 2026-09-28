import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

const booleanValue = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0'])
    .default(String(fallback) as 'true' | 'false')
    .transform((value) => value === 'true' || value === '1');

export const environmentSchema = z.object({
  TEST_ENV: z.enum(['production', 'staging', 'qa', 'local']).default('production'),
  BASE_URL: z.url().default('https://digitalaptech.com'),
  AI_COMMERCE_PATH: z
    .string()
    .regex(/^\/(?!\/)/)
    .default('/services/ai-commerce/'),
  CI: booleanValue(false),
  WORKERS: z.coerce.number().int().min(1).max(8).default(2),
  RETRIES: z.coerce.number().int().min(0).max(2).default(0),
  HEADLESS: booleanValue(true),
  ENABLE_ALLURE: booleanValue(false),
  ENABLE_VISUAL: booleanValue(false),
  ENABLE_SCHEDULER: booleanValue(false),
  ENFORCE_PERFORMANCE: booleanValue(false),
  MAX_DOM_CONTENT_LOADED_MS: z.coerce.number().positive().default(10000),
  MAX_TTFB_MS: z.coerce.number().positive().default(3000),
  TEST_PROXY_SERVER: z.string().optional(),
  TEST_PROXY_USERNAME: z.string().optional(),
  TEST_PROXY_PASSWORD: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(input: NodeJS.ProcessEnv): Environment {
  const parsed = environmentSchema.parse(input);
  const url = new URL(parsed.BASE_URL);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'BASE_URL must be an HTTP(S) origin without credentials, query, hash, or path.',
    );
  }
  if (new URL(parsed.AI_COMMERCE_PATH, url).origin !== url.origin) {
    throw new Error('AI_COMMERCE_PATH must stay on BASE_URL.');
  }
  if (parsed.TEST_ENV !== 'production' && /(^|\.)digitalaptech\.com$/i.test(url.hostname)) {
    throw new Error('Set a non-production BASE_URL when TEST_ENV is staging, qa, or local.');
  }
  return { ...parsed, BASE_URL: url.origin };
}

// Explicit shell/CI settings win. Selected environment file wins over generic .env.
const root = process.cwd();
const envName = process.env.TEST_ENV ?? 'production';
if (!/^(production|staging|qa|local)$/.test(envName)) throw new Error('Invalid TEST_ENV');
for (const filename of [`.env.${envName}`, '.env']) {
  const filenamePath = path.resolve(root, filename);
  if (existsSync(filenamePath)) dotenv.config({ path: filenamePath, override: false, quiet: true });
}
export const env = parseEnvironment(process.env);
