# Interview notes

## Explain this framework.

It is a small Playwright TypeScript test project with four UI and four API scenarios. The configuration centralizes timeouts, retries, two-worker parallelism, reports, and failure artifacts. Each test stays focused on one user or API behavior.

## How are UI and API tests handled together?

Both use Playwright Test and share one runner and reporting setup. The UI test uses the `page` fixture, while the API test uses the isolated `request` fixture. Separate spec files let us run them together or independently.

## How does parallel execution work?

`fullyParallel: true` allows independent tests to run concurrently, and `workers: 2` provides two worker processes. With two separate tests, Playwright can schedule one on each worker.

## How are failures captured?

Each successful UI test attaches a final-state screenshot so its behavior is easy to review. Playwright also keeps an automatic screenshot and video for failed tests. In CI, a failed test receives one retry and a trace is captured on that first retry. Artifacts go under `test-results/artifacts/`.

## How are reports generated?

The HTML and JUnit reporters run together. The human-readable report is `playwright-report/index.html`, and CI-compatible XML is `test-results/junit-results.xml`.

## How will this run in GitHub Actions?

Pull requests and manual dispatches start the workflow. It installs dependencies with `npm ci`, installs Chromium, runs the full suite, and uploads the HTML report even if testing fails.

## How would you add smoke and regression tags?

Add tags such as `@smoke` and `@regression` to test titles or Playwright test details, then select them with `--grep @smoke` or `--grep @regression`. Package scripts can make those commands easy to remember.

## How would you run it in different environments?

Read a base URL from an environment variable, validate it in the configuration, and set `use.baseURL`. CI environments can supply non-secret URLs as variables and secrets through the platform's protected secret store.

## How would you scale it to 100 tests?

Group tests by feature, use reusable fixtures and small page or API client objects, keep tests independent, tag suites by purpose, shard across CI jobs, and monitor slow or flaky tests. Worker count should match the available machine capacity.

## What improvements would you make for a company project?

I would add linting and formatting, typed test-data builders, environment validation, authentication fixtures, accessibility checks, test ownership, CI sharding, report history, quarantine rules with expiry, and clear review standards. I would add each feature only when the project needs it.
