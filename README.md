# Playwright UI and API challenge

This project is a compact Playwright TypeScript framework with one browser test and one API test. The tests are kept in separate files and can run concurrently on two workers. On failure, Playwright retains screenshots and video; the first CI retry also records a trace.

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

Reports are written to `playwright-report/index.html` and `test-results/junit-results.xml`. Per-test artifacts such as retained failure screenshots, videos, and retry traces are written below `test-results/artifacts/`.

## GitHub Actions

`.github/workflows/playwright.yml` runs for pull requests or a manual dispatch. It checks out the code, uses Node.js 22, installs locked dependencies and Chromium, runs both tests, and uploads the HTML report even when a test fails. It uses no credentials.
