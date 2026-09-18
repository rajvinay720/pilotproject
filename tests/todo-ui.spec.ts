import { expect, test, type Page, type TestInfo } from '@playwright/test';

const todoUrl = 'https://demo.playwright.dev/todomvc/';

async function addTask(page: Page, taskName: string) {
  const taskInput = page.getByPlaceholder('What needs to be done?');
  await taskInput.fill(taskName);
  await taskInput.press('Enter');
}

async function attachFinalState(page: Page, testInfo: TestInfo, name: string) {
  const screenshotPath = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach(name, {
    path: screenshotPath,
    contentType: 'image/png',
  });
}

test('adds and completes an interview preparation task', async ({ page }, testInfo) => {
  const taskName = 'Prepare API interview';

  await page.goto(todoUrl);
  await addTask(page, taskName);

  const todoItem = page.getByTestId('todo-item').filter({ hasText: taskName });
  await expect(todoItem).toBeVisible();
  await expect(todoItem.getByTestId('todo-title')).toHaveText(taskName);

  const completionCheckbox = todoItem.getByRole('checkbox');
  await completionCheckbox.check();

  await expect(completionCheckbox).toBeChecked();
  await expect(todoItem).toHaveClass(/completed/);
  await attachFinalState(page, testInfo, 'completed-task');
});

test('adds multiple tasks and shows the remaining count', async ({ page }, testInfo) => {
  await page.goto(todoUrl);
  await addTask(page, 'Review Playwright locators');
  await addTask(page, 'Practice API assertions');

  await expect(page.getByTestId('todo-item')).toHaveCount(2);
  await expect(page.getByTestId('todo-count')).toContainText('2 items left');
  await attachFinalState(page, testInfo, 'two-active-tasks');
});

test('filters active and completed tasks', async ({ page }, testInfo) => {
  const completedTask = 'Complete UI exercise';
  const activeTask = 'Review API results';

  await page.goto(todoUrl);
  await addTask(page, completedTask);
  await addTask(page, activeTask);

  const completedItem = page.getByTestId('todo-item').filter({ hasText: completedTask });
  const activeItem = page.getByTestId('todo-item').filter({ hasText: activeTask });
  await completedItem.getByRole('checkbox').check();

  await page.getByRole('link', { name: 'Completed' }).click();
  await expect(completedItem).toBeVisible();
  await expect(activeItem).toBeHidden();
  await expect(page).toHaveURL(/#\/completed$/);
  await attachFinalState(page, testInfo, 'completed-filter');

  await page.getByRole('link', { name: 'Active' }).click();
  await expect(completedItem).toBeHidden();
  await expect(activeItem).toBeVisible();
});

test('clears completed tasks without removing active tasks', async ({ page }, testInfo) => {
  const completedTask = 'Remove after completion';
  const activeTask = 'Keep this task';

  await page.goto(todoUrl);
  await addTask(page, completedTask);
  await addTask(page, activeTask);

  const completedItem = page.getByTestId('todo-item').filter({ hasText: completedTask });
  const activeItem = page.getByTestId('todo-item').filter({ hasText: activeTask });
  await completedItem.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Clear completed' }).click();

  await expect(completedItem).toHaveCount(0);
  await expect(activeItem).toBeVisible();
  await expect(page.getByTestId('todo-count')).toContainText('1 item left');
  await attachFinalState(page, testInfo, 'completed-task-cleared');
});
