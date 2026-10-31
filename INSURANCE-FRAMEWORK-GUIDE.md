# Insurance UI + API Playwright framework — code walkthrough
This is an educational simulator, NOT a real insurance or ALIP application. The original 9 tests remain unchanged.

## File-by-file explanation
1. **insurance-app/server.mjs**: Node HTTP service and minimal browser interface. A Map stores each policy in memory. Routes validate user roles and allowed state transitions.
2. **playwright.insurance.config.ts**: New Playwright configuration, isolated from the old tests; starts the server automatically, configures 3 browsers, worker parallelism, retry-on-CI, screenshots/videos/traces and HTML/JUnit reports.
3. **insurance-tests/api/policy.spec.ts**: Four API scenarios, using Playwright's request client and independently created UUID customer data.
4. **insurance-tests/ui/hybrid.spec.ts**: Two browser tests including a cross-layer workflow that creates and issues a policy in UI and checks it using API.
5. **.github/workflows/insurance-ci.yml**: Separate GitHub Actions jobs for Chromium, Firefox and WebKit; uploads reports even on failure.

## Logic, in execution order
- A test starts: Playwright's webServer launches the local simulator and checks GET /health.
- A test worker gets a new isolated browser context, or a request context in API-only tests.
- API createPolicy sends POST /api/policies with x-role applicant and a unique name; the backend checks minimum premium and creates a SUBMITTED policy, version=1.
- The underwriter-only POST /approve moves it to APPROVED and increases version.
- The admin-only POST /issue moves it to ISSUED and increases version.
- The applicant-only POST /withdraw allows a positive amount no larger than half the policy balance, then decreases the balance and increments version.
- Negative tests check HTTP 403/422 and assert no unauthorized or invalid mutation occurred.
- The concurrency test sends five simultaneous issue requests and verifies exactly one 200 and four 409 conflict responses.
- The hybrid test fills web form controls, reads the generated ID, calls the API to verify SUBMITTED, completes approval and issue through UI, and checks final API state and version.

## Commands
Install: `npm ci`
Browsers: `npx playwright install chromium firefox webkit`
All new tests: `npx playwright test --config=playwright.insurance.config.ts`
Only API: `npx playwright test --config=playwright.insurance.config.ts insurance-tests/api`
Only UI + API: `npx playwright test --config=playwright.insurance.config.ts insurance-tests/ui`
Smoke: `npx playwright test --config=playwright.insurance.config.ts --grep @smoke`
Regression: `npx playwright test --config=playwright.insurance.config.ts --grep @regression`
Sequential: `npx playwright test --config=playwright.insurance.config.ts --workers=1`
Parallel four workers: `npx playwright test --config=playwright.insurance.config.ts --workers=4`
Chromium only: `npx playwright test --config=playwright.insurance.config.ts --project=chromium`
Headed: `npx playwright test --config=playwright.insurance.config.ts --project=chromium --headed`
Debug: `npx playwright test --config=playwright.insurance.config.ts --project=chromium --debug`
Sharding: `npx playwright test --config=playwright.insurance.config.ts --shard=1/2`

## Limitations / interview integrity
- The x-role header is a testing shortcut and **not secure authentication**. Don't call it OAuth or JWT.
- In-memory policies disappear on server restart. It is not a persistence or DB transaction test.
- The concurrent test demonstrates one-process policy state checks; it does not demonstrate distributed locks.
- The test suite must be executed and its results reviewed before claiming it passes in CI.
- Next iterations should introduce a proper database, authenticated roles, POM for UI, independent API client, idempotency keys, CI report merging, and advanced failure-injection tests.
