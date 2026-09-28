import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import { env } from './src/config/environment';

const reporters: ReporterDescription[] = [
  [env.CI ? 'github' : 'list'],
  ['html', { outputFolder: 'reports/html', open: 'never' }],
  ['junit', { outputFile: 'reports/junit/results.xml' }],
  ['json', { outputFile: 'reports/results.json' }],
  ['./src/reporters/quality-gate.ts'],
];
if (env.CI) reporters.push(['blob', { outputDir: 'blob-report' }]);
if (env.ENABLE_ALLURE)
  reporters.push([
    'allure-playwright',
    {
      resultsDir: 'allure-results',
      detail: true,
      environmentInfo: { environment: env.TEST_ENV, base_url: env.BASE_URL, node: process.version },
    },
  ]);

const browserTests = '**/{smoke,ui,forms}/**/*.spec.ts';
const proxy = env.TEST_PROXY_SERVER
  ? {
      server: env.TEST_PROXY_SERVER,
      username: env.TEST_PROXY_USERNAME,
      password: env.TEST_PROXY_PASSWORD,
    }
  : undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.CI,
  failOnFlakyTests: env.CI,
  retries: env.RETRIES,
  workers: env.WORKERS,
  timeout: 60000,
  globalTimeout: 30 * 60 * 1000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.005 },
  },
  outputDir: 'test-results',
  reporter: reporters,
  metadata: {
    target: `${env.BASE_URL}${env.AI_COMMERCE_PATH}`,
    environment: env.TEST_ENV,
    writePolicy: 'intercept-only',
  },
  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    actionTimeout: 10000,
    navigationTimeout: 45000,
    locale: 'en-GB',
    timezoneId: 'Asia/Kolkata',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    ignoreHTTPSErrors: false,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    proxy,
  },
  projects: [
    {
      name: 'chromium',
      testMatch: browserTests,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'firefox', testMatch: browserTests, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: browserTests, use: { ...devices['Desktop Safari'] } },
    {
      name: 'mobile-chrome',
      testMatch: '**/{smoke,responsive}/**/*.spec.ts',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      testMatch: '**/{smoke,responsive}/**/*.spec.ts',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'tablet',
      testMatch: '**/{smoke,responsive}/**/*.spec.ts',
      use: { ...devices['iPad (gen 7)'] },
    },
    {
      name: 'audit',
      testMatch: '**/{accessibility,seo,performance}/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },
    {
      name: 'framework',
      testMatch: '**/framework/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual',
      testMatch: '**/visual/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'scheduler',
      testMatch: '**/integrations/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  snapshotPathTemplate:
    '{testDir}/visual/__screenshots__/{projectName}/{platform}/{testFilePath}/{arg}{ext}',
});
