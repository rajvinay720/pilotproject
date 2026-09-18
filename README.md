# Playwright UI and API challenge

This project is a compact Playwright TypeScript framework with four TodoMVC browser tests and four JSONPlaceholder API tests. The tests are kept in separate files and can run concurrently on two workers. Each successful UI test attaches a final-state screenshot to the report. On failure, Playwright also retains an automatic screenshot and video; the first CI retry records a trace.

## Install

```bash
npm ci
npm run install:chromium
```

For a first checkout without a lockfile, use `npm install`, then commit the generated `package-lock.json`. The Chromium script keeps the downloaded browser inside this project.

## Run

Run the complete suite:

```bash
npm test
```

Run explicitly with two parallel workers:

```bash
npm run test:parallel
```

Run just one layer when diagnosing:

```bash
npx playwright test tests/todo-ui.spec.ts
npx playwright test tests/post-api.spec.ts
```

Open the generated HTML report:

```bash
npm run report
```

Reports are written to `playwright-report/index.html` and `test-results/junit-results.xml`. Successful UI screenshots and failure artifacts such as screenshots, videos, and retry traces are written below `test-results/artifacts/` and attached to the HTML report.

## GitHub Actions

`.github/workflows/playwright.yml` runs for pushes to `main`, pull requests, or a manual dispatch. It checks out the code, uses Node.js 22, installs locked dependencies and Chromium, runs all eight tests, and uploads the HTML report, JUnit XML, screenshots, and any failure evidence even when a test fails. It uses no credentials.
