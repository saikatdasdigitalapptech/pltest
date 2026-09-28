# Digital Aptech AI Commerce — Playwright TypeScript

A site-specific automation framework for `https://digitalaptech.com/services/ai-commerce/`.
Locators, capability anchors, form fields, error messages, upload constraints, modal tabs, and the
Cal.com embed were inspected on the live page on 28 September 2026.

This is a marketing and lead-generation page. Its AI shopping conversation is illustrative content;
there is no actual product search, cart, checkout, authenticated account, or commerce API here to test.
The framework tests the experience the page actually exposes.

## Start in Windows PowerShell

Install Node.js 22.13+ (22 LTS) or Node.js 24 LTS. Extract the ZIP, then:

```powershell
cd digital-aptech-ai-commerce-playwright
npm ci
npx playwright install chromium firefox webkit
Copy-Item .env.example .env
npm run check
npm run test:smoke
npm run report
```

Linux CI agents also need browser system dependencies:

```bash
npm ci
npx playwright install --with-deps chromium firefox webkit
cp .env.example .env
npm run test:smoke
```

`npm run check` performs TypeScript type checking, ESLint with zero warnings, and formatting checks.
Read [VALIDATION.md](docs/VALIDATION.md) for the exact checks executed during delivery and remaining limits.

## What is included

| Layer               | Implementation                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| Browser automation  | Playwright Test; Chromium, Firefox, WebKit                                                         |
| Device coverage     | Pixel 7, iPhone 13, iPad; 320px layout check                                                       |
| Design              | Page objects, reusable form/header/dialog components, typed fixtures                               |
| Environment         | Validated configuration, `.env` support, production/staging/qa/local targets                       |
| Functional coverage | Content, navigation, lead validation, attachments, dialog tabs, Escape                             |
| Submission coverage | Intercepted payload, success redirect, 422, 500, malformed JSON, network failure, pending requests |
| Other checks        | Accessibility with axe, keyboard focus, SEO, public HTTP contracts, navigation timings             |
| Visual regression   | Explicitly enabled screenshots with reviewed, OS-specific baselines                                |
| Evidence            | HTML, JUnit, JSON, quality summary, traces, screenshots, videos, diagnostics                       |
| Optional Allure     | Allure Playwright adapter with a pinned Allure 2 CLI; Java 17+ required only for report generation |
| CI                  | GitHub Actions with two shards and report merge, GitLab CI, Jenkinsfile, Dockerfile                |
| Maintenance         | Exact dependency pins, lockfile, Dependabot, lint rules, framework self-tests                      |

## Run suites

| Command                      | Scope                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `npm test`                   | Chromium smoke                                                                    |
| `npm run test:regression`    | All Chromium smoke/UI/form scenarios                                              |
| `npm run test:cross-browser` | Same scenarios across all three desktop engines                                   |
| `npm run test:mobile`        | Smoke and layout on three emulated devices                                        |
| `npm run test:api`           | Same-origin public HTTP GET checks                                                |
| `npm run test:a11y`          | Accessibility scans and keyboard/modal expectations                               |
| `npm run test:audit`         | Accessibility, metadata/content, navigation timing                                |
| `npm run test:framework`     | Configuration parsing and local HTTP write-interception self-test                 |
| `npm run test:all`           | All projects; visual and scheduler cases remain explicitly skipped unless enabled |
| `npm run test:list`          | Discover scenarios without launching browsers                                     |
| `npm run test:ui`            | Playwright UI runner for Chromium                                                 |
| `npm run test:debug`         | Playwright Inspector                                                              |
| `npm run test:scheduler`     | Optional read-only Cal.com rendering check                                        |

Examples:

```powershell
npm run test:regression -- --grep AIC-060 --headed
npm run test:cross-browser -- --grep '@forms'
npm run test:regression -- --shard=1/2
npm run test:regression -- --workers=1 --retries=0
npx playwright show-trace "test-results\<failed-test>\trace.zip"
```

The suite runner clears previous generated reports and results at the start. Archive evidence you
need before the next run. Run concurrent shards in separate checkouts/workspaces. `npx playwright
test` bypasses that cleanup helper; use it intentionally when debugging.

## Configuration

Shell/CI variables take precedence over `.env.<TEST_ENV>`, then `.env`, then defaults.
Choose `TEST_ENV` in the shell when selecting an environment file.
The base URL is an origin; configure the route separately.

```powershell
$env:TEST_ENV = 'staging'
$env:BASE_URL = 'https://your-approved-staging-host.example'
$env:AI_COMMERCE_PATH = '/services/ai-commerce/'
npm run test:regression
```

The example staging host is a placeholder, not a discovered Digital Aptech environment. A staging/qa
label combined with the production Digital Aptech hostname is rejected to prevent misleading runs.
Delete or replace shell variables to switch back. `.env` files, auth state, and generated evidence
are excluded from Git. Corporate proxies can use the optional `TEST_PROXY_*` variables.
TLS verification remains enabled.

## How form testing works

All browser contexts install a write guard before navigation and disable service workers. Non-read
HTTP methods are aborted unless a test registers an explicit, same-origin POST response stub.
Analytics hosts observed on the page are blocked. Unexpected first-party write attempts fail a test.
Synthetic `example.com` contact details are used.

The form endpoint is resolved from the live form's `data-submit` attribute. The browser still executes
the website's real JavaScript and creates its real multipart payload. The framework returns the
test-controlled response before that POST reaches the server. Successful navigation is checked
against `data-thankyou`; the destination itself is a clearly labeled local mock page.

These tests verify client behavior and the payload contract. They do **not** verify email delivery,
CRM persistence, server-side validation, attachment scanning, or actual appointment creation. A backend
test environment and booking test tenant are needed for those cases. No production-write toggle is
provided. See [architecture.md](docs/architecture.md) before extending network tests.

## Reports

```powershell
npm run report
npm run test:allure
npm run report:allure
npm run report:allure:open
```

HTML opens on port 9323; the optional Allure report uses port 9324. Allure results and generated HTML
are separate directories. The Allure adapter's `3.x` version does not mean the bundled CLI is Allure 3.
This project deliberately uses `allure-commandline` (Allure 2) and does not require a global install.
Switching to another report major version should be a reviewed dependency/configuration change.

Failed runs retain screenshots, video, trace, and diagnostics. Traces can contain form values and
response data. Use synthetic data and keep CI artifacts private. The diagnostic URL list removes
query strings; that is not complete trace redaction.

CI forbids `test.only`, retries once, and fails on unexpected failures **and flaky tests**. A retry pass
is not a green release gate. Accessibility findings remain failures; there is no hidden allowlist.
Optional skipped suites are reported as skipped rather than passed. A successful smoke run is not
evidence that all regression or audit cases passed.

## Visual baselines

```powershell
npm run test:visual:update
# Review every generated PNG under tests/visual/__screenshots__.
# Commit approved baselines to your Git repository.
npm run test:visual
```

Use the same OS, Playwright/browser version, viewport, fonts, and environment for baseline generation
and comparison. Baselines are deliberately not fabricated from an unreviewed screenshot. New/missing
baselines must be reviewed. Do not run snapshot update in a normal CI quality gate.

## CI setup

- GitHub: push the extracted project to your repository. PRs/main pushes run static checks, framework
  self-tests, and smoke. Use workflow dispatch for other suites. Optional repository variables:
  `BASE_URL` and `TEST_ENV`. Both shards together use two browser workers.
- GitLab: use the included `.gitlab-ci.yml`; cross-browser regression is a manual job.
- Jenkins: create a pipeline from `Jenkinsfile`; provision a Linux agent labeled `playwright-linux`
  with Node 22.13+/24 and Playwright OS dependencies. Jenkins needs the JUnit plugin.
- Docker: `docker build -t dapl-ai-commerce-tests .` then
  `docker run --rm --ipc=host dapl-ai-commerce-tests`. Mount `/work/reports` and `/work/test-results`
  if you want evidence retained after the container exits. The image tag must match the pinned
  Playwright version; update Dockerfile and GitLab image together with Playwright.

CI files are ready to configure, but no repository was connected and no remote pipeline was run
during creation. Teams with strict supply-chain policies can replace action tags with reviewed commit
SHAs under their normal dependency-update process.

## Extend the framework

1. Add page-specific selectors/actions to `src/pages/`; use semantic locators and verified unique IDs.
2. Add immutable datasets under `src/data/`; keep generated data local to each test.
3. Use `src/fixtures/ui.fixture.ts` for UI specs so network interception and diagnostics apply.
4. Keep business assertions in specs. Shared actions can use named `test.step` blocks.
5. Add a stable scenario ID and appropriate tag; update [coverage.md](docs/coverage.md).
6. Run `npm run check`, the new test, and the directly affected suite.

Avoid test-order dependencies, mutable global pages, fixed sleeps, forced clicks, XPath tied to DOM
position, blanket retries, swallowed assertions, and automatic snapshot acceptance.

## References

- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright configuration](https://playwright.dev/docs/test-configuration)
- [Playwright sharding and report merge](https://playwright.dev/docs/test-sharding)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Allure Playwright integration](https://allurereport.org/docs/playwright/)
