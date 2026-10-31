# Saleor Playwright TypeScript practical automation

**Application under test:** [Saleor Platform](https://github.com/saleor/saleor-platform), developed independently by Saleor Commerce. This folder is a separate automation suite; it does NOT implement Saleor. Tests use the **real Saleor GraphQL API and Dashboard**.

## Prerequisites
1. Docker Desktop (allocate >=5 GB for the Saleor containers).
2. Clone Saleor separately: `git clone https://github.com/saleor/saleor-platform.git`
3. In Saleor directory: `docker compose run --rm api python3 manage.py migrate`
4. Seed: `docker compose run --rm api python3 manage.py populatedb --createsuperuser`
5. Start: `docker compose up`. Expect API at http://localhost:8000/graphql/ and Dashboard at http://localhost:9000.
6. Confirm your real channel slug from the Saleor dashboard. Some seeded installations use a different slug from the example.

From **pilotproject** (the automation repo), run:
```powershell
npm ci
npx playwright install chromium firefox
$env:SALEOR_API_URL='http://localhost:8000/graphql/'
$env:SALEOR_DASHBOARD_URL='http://localhost:9000'
$env:SALEOR_CHANNEL='default-channel'
npx playwright test --config=saleor/playwright.config.ts --project=api
npx playwright test --config=saleor/playwright.config.ts --project=chromium
npx playwright test --config=saleor/playwright.config.ts --workers=4
npx playwright test --config=saleor/playwright.config.ts --grep '@smoke'
npx playwright test --config=saleor/playwright.config.ts --project=firefox
```

**Caution:** This baseline is API-led, with Dashboard UI smoke checks. It is **not yet** product CRUD, authenticated admin UI, or a full checkout. Those require a running seeded Saleor instance, an API token, and a stable storefront. No test passes are claimed without execution.

## Line-by-line learning map

### playwright.config.ts
- `defineConfig`: Playwright type-checked configuration; `devices` supplies browser profiles.
- `testDir`: confines discovery to Saleor tests; existing repo tests are not mixed in.
- `fullyParallel`: allows independent tests to run simultaneously.
- `forbidOnly`: CI rejects accidentally committed `test.only`.
- `retries`: reattempt failed CI tests once; not a substitute for debugging.
- `workers`: configurable concurrency, 2 CI / 4 local.
- `timeout`, `expect`: upper bounds on execution and assertions.
- `reporter`: list and HTML reporting.
- `outputDir`: artifacts separate from the main framework.
- `baseURL`: Dashboard host used by `page.goto('/')`.
- `trace`, `screenshot`, `video`: failure evidence.
- `projects`: API project has no browser; Chromium and Firefox execute UI files.

### graphql-client.ts
- `import expect`: API assertions use the same Playwright test assertion library.
- `GraphQLResponse<T>`: generic response type prevents anonymous `any` objects.
- `constructor`: dependency injection: client receives test's APIRequestContext, so it can be reused across tests.
- `execute<T>`: returns typed GraphQL data; rejects both non-200 HTTP and the GraphQL `errors` array (GraphQL can return HTTP 200 with errors).
- `raw`: deliberately returns GraphQL errors for negative tests.
- `variables`: avoid unsafe string interpolation; use GraphQL input variables.

### catalog.api.spec.ts
- `test`: isolated scenario registered with Playwright.
- `request`: API fixture automatically managed by Playwright.
- `new SaleorClient(request)`: share transport/validation instead of duplicating POST logic.
- `SHOP`: verifies public API connectivity using a stable business field.
- `PRODUCTS`: fetches cursor-based pages using a channel slug.
- `Set<string>`: holds IDs seen across pages to detect accidental duplicates.
- `for`: controls number of pages queried, preventing unbounded loops.
- `hasNextPage`, `endCursor`: GraphQL pagination contract.
- `raw` negative test: makes an intentionally malformed GraphQL selection and checks structured errors.

### dashboard.ui.spec.ts
- `page`: isolated browser context for each test.
- `request`: API context in same test, demonstrating hybrid calls.
- `page.goto('/')`: navigates to Dashboard baseURL.
- `response.status()`: confirms navigation didn't return an HTTP error.
- `expect.poll`: periodically checks app text while rendering completes; avoids `waitForTimeout` sleeps.

## Coding standards and reusability
- Centralize operations in `support/queries.ts`.
- Reuse typed `SaleorClient` instead of repeating request payload construction.
- Prefer assertions on business values to raw UI implementation details.
- Keep test data channel/environment-specific and avoid shared mutable state.
- Avoid hard-coded sleeps and XPath unless absolutely necessary.
- Keep credentials out of Git and use CI secrets for authenticated API scenarios.
- Run tests in parallel only if each scenario owns its own test data.

## Practice assignments
1. **API easy:** assert 2 product pages return correct page sizes and nonempty slugs.
2. **API medium:** validate published product variant availability and pricing for a chosen channel.
3. **UI medium:** create a Dashboard login Page Object after verifying actual selectors, then test invalid login.
4. **UI + API advanced:** log in to Dashboard, create a product using UI, verify its details via GraphQL, and delete it in cleanup.
5. **Advanced:** simulate checkout and verify order through GraphQL using a dedicated test store (no real payment credentials).
6. **CI:** run API and UI on separate jobs, then add sharding and merge blob reports.

## Interview integrity
Say: "I built a Playwright suite against the independently developed Saleor application, with typed reusable GraphQL clients, cursor pagination validation and API/UI smoke checks." Do **not** claim verified green runs or full checkout automation until actually executed.
