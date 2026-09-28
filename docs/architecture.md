# Architecture and maintenance

## Repository map

| Path                            | Responsibility                                                   |
| ------------------------------- | ---------------------------------------------------------------- |
| `playwright.config.ts`          | Project selection, engines/devices, reporting, retries, timeouts |
| `src/config/environment.ts`     | Strict configuration validation and precedence                   |
| `src/fixtures/ui.fixture.ts`    | Per-test page objects, request guard, diagnostics                |
| `src/fixtures/api.fixture.ts`   | HTTP service object without launching a browser                  |
| `src/pages/ai-commerce.page.ts` | Page identity/navigation                                         |
| `src/pages/components/`         | Header, lead form, booking dialog                                |
| `src/network/`                  | Write interception and deterministic lead response stubs         |
| `src/services/`                 | Same-origin public HTTP reads                                    |
| `src/data/`                     | Expected capability contracts and synthetic lead data            |
| `src/utils/`                    | Accessibility and layout evidence                                |
| `src/reporters/`                | Machine-readable test outcome summary                            |
| `tests/`                        | Independent tagged scenarios grouped by purpose                  |
| `scripts/`                      | Cross-platform suite launcher and generated-output cleanup       |
| `docs/`                         | Scope, validation evidence, operating instructions               |

There is no Selenium-style driver singleton or giant BasePage abstraction. Playwright owns a fresh
browser context/page for each test. Fixture-scoped objects share only that test's context; immutable
datasets may be shared. Playwright's built-in auto-waiting and web-first assertions are the default.
`domcontentloaded` is the navigation boundary; third-party analytics do not define page readiness.

## Expected behavior versus observed implementation

The following selectors/contracts were inspected on the live site:

| Surface             | Contract                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Hero                | H1 `Make your ecommerce intelligent.`                                                                                         |
| Primary CTA         | Link to `#contact`                                                                                                            |
| Capabilities        | `#capabilities`, eight links to observed article IDs                                                                          |
| Main form           | `#contact-form-staffing` with `data-submit` and `data-thankyou`                                                               |
| Submit endpoint     | Relative `../contact-form-submit.php`, resolved from the actual page URL                                                      |
| Form field IDs      | `osd_full_name`, `osd_email`, `osd_company`, `osd_phone`, `osd_service`, `osd_region`, `osd_requirement`, `osd_attached_file` |
| File validation     | Allowlisted extensions; maximum 5 × 1024 × 1024 bytes                                                                         |
| Submission response | `{ ok, message, errors? }`; `errors` keys map to field `name` attributes                                                      |
| Modal               | `#requirement`, Close dialogue button, two ARIA tabs and corresponding panels                                                 |
| Booking provider    | `iframe[title="Book a call"]` under `#mdltabpanel-1`, app.cal.com                                                             |
| Mobile menu         | Open navigation / Close navigation buttons controlling `#site-navigation`                                                     |

Observed UI text is a regression contract, not a substitute for approved requirements. The 16px side
spacing floor, one-digit phone rejection, and modal keyboard expectations are proposed quality
requirements. Confirm product/design intent before accepting failures as release-blocking defects.

## Network boundaries

The context guard blocks non-read HTTP methods on first-party and third-party hosts. Only
`registerPostMock` can add a locally fulfilled lead response. The successful redirect destination is
also mocked. A tiny local HTTP server in `tests/framework/write-guard.spec.ts` verifies that blocked
and mocked requests do not reach the server.

This guard protects these test flows; it is not a general browser sandbox. GET endpoints can have
side effects on poorly designed applications, WebSocket messages need separate controls, and a
developer could bypass the fixture with a different client. Existing tests do not use such channels
for submissions. `APIRequestContext` is outside browser route interception: public HTTP tests use the
read-only service object, and no API write helper is provided.

Known tracker requests are blocked for deterministic tests. This changes network conditions and is
not suitable for validating analytics attribution. First-party HTTP errors and JavaScript errors are
attached as diagnostics; they are not blanket gates because stubbed failures and external scripts
can intentionally create errors. Core behavior has explicit assertions.

## Adding real backend integration

Before adding successful backend writes, obtain an approved non-production URL, an explicit API
contract, synthetic data policy, credentials via CI secrets, booking test tenant, and cleanup API.
Build a separate integration project with a narrow allowlist. Verify creation via a read endpoint or
known persistence observable and always clean up. Do not weaken the default public-page guard or
point a new booking Confirm test at the live sales calendar.

## Failure triage

1. Read the assertion, then the attached trace. Determine whether the page loaded successfully.
2. Confirm the locator's uniqueness and current accessible name. Update a locator only for an
   intentional UI contract change.
3. If a real behavior mismatch is reproducible, retain the failure and record the defect.
4. If DNS/proxy/CDN/provider access fails, classify it as an environment/integration limitation.
5. Fix root causes before changing timeouts. No blanket `test.fail` or catch-and-pass wrappers.

Keep visual baselines and dependency updates in reviewable PRs. Pin browser image and package
versions together. Add an exception only with owner, reason, scope, expiry, and a tracked ticket;
there is no default accessibility or console-error suppression list.
