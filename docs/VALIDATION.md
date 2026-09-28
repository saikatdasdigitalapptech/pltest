# Delivery validation — 28 September 2026

This file separates implemented coverage from executed checks. The complete live UI suite has **not**
been certified green. Run the suites in your approved workstation/CI environment before using them
as release gates.

## Completed checks

| Check                   | Result                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Dependency installation | Completed; exact versions and npm lockfile included                                                            |
| TypeScript              | `tsc --noEmit` passed                                                                                          |
| ESLint                  | Passed with zero warnings                                                                                      |
| Prettier                | Passed                                                                                                         |
| Test discovery          | 70 distinct scenario IDs; 172 project executions across 11 projects and 16 spec files                          |
| Framework self-tests    | **6 passed**, including actual Chromium network interception against a local server and multipart parsing      |
| Public HTTP checks      | **5 passed** against the live site, using the environment's configured proxy and normal certificate validation |
| Allure adapter          | Six framework test results generated with `ENABLE_ALLURE=true`                                                 |
| Allure HTML report      | Generated successfully with the pinned CLI                                                                     |
| Blob report merge       | Generated merged HTML and JUnit from the six-test framework blob; remote two-shard workflow not executed       |
| Lockfile consistency    | `npm ci --dry-run --ignore-scripts` completed successfully                                                     |

Machine-readable outcome summaries are in `docs/validation/`. These contain outcome counts, not
proof that unexecuted suites passed. `test-inventory.txt` contains the discovered scenarios.

## Live page inspection

The interactive browser successfully inspected the exact target URL. The implementation uses the
observed DOM and inline form validation, rather than guessed test IDs.

Observed directly:

- Title/H1, eight capability links and their target article IDs.
- Primary roadmap CTA navigated to `#contact` and exposed the main form.
- An empty form submission displayed errors on `osd_full_name`, `osd_email`, and `osd_company`,
  focused the name field, and showed the expected validation summary.
- Book a Call opened its wrapper; switching to Connect with Us exposed the separate modal form;
  Close dialogue dismissed the wrapper.
- Cal.com's iframe rendered the Free Consultation heading and calendar controls.
- The main form declares a 5 MiB limit and client-side extension checks.
- The current modal container lacked `role="dialog"` and `aria-modal`; automated expectations retain
  those intended accessibility requirements and may fail on the current implementation.

This inspection is not equivalent to running the packaged Playwright suite. Successful lead submission,
appointment confirmation, focus trapping, and end-to-end backend delivery were not verified.

## Environment blockers during automated browser execution

| Attempt                                | Observed limitation                                                                                            | Interpretation                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Chromium with normal direct connection | `net::ERR_EMPTY_RESPONSE` before page load                                                                     | Container network path; UI assertions did not execute                          |
| Chromium with the provided proxy       | `net::ERR_CERT_AUTHORITY_INVALID` before page load                                                             | Browser trust configuration in this environment; TLS verification was retained |
| Firefox smoke                          | Browser content processes failed with `Sandbox: writing /proc/self/uid_map: EPERM` and page creation timed out | Container process restriction; no website behavior conclusion                  |
| WebKit                                 | Missing operating-system browser libraries                                                                     | Not executed; use a supported host or matching Playwright container            |

The default Chromium CDN returned an invalid 195-byte HTML response in place of the binary archive.
The matching official Chrome for Testing headless archive was downloaded from Google's official
distribution, checked against its published MD5 transport hash, and ZIP integrity checked before the
local framework tests. This establishes which binary executed; MD5 here is a transfer consistency
check, not a security signature.

No browser certificate checks were disabled to make a test pass. Configure an approved workstation
or CI agent's network/certificate trust through your organization's standard provisioning process.
Do not interpret the environment smoke failures as application defects.

## Remaining validation

- Run Chromium functional/form regression, mobile layouts, and audits against the live or staging URL.
- Run desktop Firefox/WebKit on a supported host with required browser dependencies.
- Generate and review visual baselines before enabling the visual gate.
- Provide a dedicated booking test tenant before automating a real Confirm action.
- Execute CI workflows in your repository; source was provided, but no remote pipeline was triggered.
- Container image builds, Jenkins, and GitLab execution were not run here.

All submitted test data in automated framework checks was synthetic. No live lead or appointment
was created. Local mock responses are deliberately not labeled as backend success.
