# Coverage and test strategy

IDs identify scenarios; the project name distinguishes repeated execution across engines/devices.
Run `npm run test:list` for the exact executable inventory.

| Scenario IDs | Area                   | Assertions                                                                                                           |
| ------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| AIC-001–004  | Smoke                  | Identity, CTA, eight capabilities, form readiness, modal open/close                                                  |
| AIC-010–017  | Capabilities           | Each card navigates to the correct visible article and fragment                                                      |
| AIC-018–021  | Navigation             | Contact/capability/stack CTA destinations, Services menu                                                             |
| AIC-030–032  | Booking wrapper        | Selected tabs/panels, Escape, provider iframe contract                                                               |
| AIC-040–049  | Lead validation        | Required errors/focus, name/email/company rules, clearing errors, choices, maxlength, short phone                    |
| AIC-050–053  | Attachments            | Filename/clear, invalid extension, size above limit, exact boundary                                                  |
| AIC-060–066  | Intercepted submission | Payload/redirect, server field error, 500, malformed response, network failure, duplicate prevention, Unicode name   |
| AIC-070–074  | Responsive             | Overflow, control fit, menu toggle, 16px hero spacing, 320px minimum width                                           |
| AIC-080–084  | Accessibility          | Automated A/AA checks, invalid form state, modal semantics/focus trap/focus restoration                              |
| AIC-090–093  | Content/SEO            | Metadata/canonical, unique anchor targets, loaded images/alt attributes, policy destinations                         |
| AIC-100–104  | Public HTTP            | HTML status/identity, header review, three policy pages                                                              |
| AIC-110      | Performance diagnostic | Navigation timing and optional agreed budgets                                                                        |
| AIC-120–122  | Visual, opt-in         | Hero, capability grid, lead form screenshots                                                                         |
| AIC-130      | Scheduler, opt-in      | Live provider's consultation heading and calendar navigation control                                                 |
| FW-001–006   | Framework              | Configuration boundaries, method classification/redaction, real local server interception, multipart payload capture |

## Project matrix

| Project       | Engine/device                        | Suites                          |
| ------------- | ------------------------------------ | ------------------------------- |
| chromium      | Desktop Chromium, 1440 × 900         | smoke, ui, forms                |
| firefox       | Desktop Firefox                      | smoke, ui, forms                |
| webkit        | Desktop WebKit                       | smoke, ui, forms                |
| mobile-chrome | Pixel 7 emulation                    | smoke, responsive               |
| mobile-safari | iPhone 13 emulation                  | smoke, responsive               |
| tablet        | iPad emulation                       | smoke, responsive               |
| audit         | Desktop Chromium                     | accessibility, seo, performance |
| api           | No browser                           | public HTTP                     |
| framework     | Desktop Chromium for guard self-test | framework                       |
| visual        | Fixed desktop Chromium               | opt-in visual                   |
| scheduler     | Desktop Chromium                     | opt-in provider rendering       |

Mobile emulation does not certify physical Android/iOS hardware. WebKit is not a packaged Safari
binary. Form regression currently runs on desktop engines; mobile smoke confirms basic form
availability/layout. Expand mobile form testing when mobile conversion becomes a dedicated gate.

## Release gates

- PR: static checks + framework self-tests + smoke. Zero unexpected or flaky tests.
- Before release: cross-browser regression, mobile, API, and audit against the release environment.
- Visual: reviewed baselines and a repeatable renderer/OS, run separately with `ENABLE_VISUAL=true`.
- Scheduler: run separately to make provider/network outages visible without conflating them with
  deterministic UI regression.
- Performance thresholds are opt-in. A single synthetic navigation is not a Core Web Vitals field
  assessment, load test, scalability test, or a statistically reliable performance benchmark.

## Coverage requiring further inputs or manual review

- Actual booking Confirm click and successful appointment lifecycle: dedicated test calendar,
  stable slot provisioning, approved synthetic attendees, cleanup, and confirmation contract.
- Actual lead delivery and server-side validation: staging endpoint/CRM/email sandbox contract.
- Full accessibility conformance: keyboard, screen reader, zoom/reflow and human review in addition
  to axe. Automated scans alone cannot establish conformance.
- Header CSP/HSTS policy: ownership and an agreed security baseline. Current tests capture headers
  and check one disclosure symptom; this is not a vulnerability scan or penetration test.
- Design-specific card equality, typography, and side spacing beyond the proposed 16px floor:
  approved design specifications and baseline review.
- Browser privacy settings, tracker consent, analytics events, WebSocket behavior, uploads on real
  devices, localization, and unusual network conditions: separate agreed requirements.

No live lead or booking was intentionally submitted while creating this project.
