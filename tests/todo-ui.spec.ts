import { expect, test } from '@playwright/test';

test('adds and completes an interview preparation task', async ({ page }) => {
  const taskName = 'Prepare API interview';

  await page.goto('https://demo.playwright.dev/todomvc/');
  await page.getByPlaceholder('What needs to be done?').fill(taskName);
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  const todoItem = page.getByTestId('todo-item').filter({ hasText: taskName });
  await expect(todoItem).toBeVisible();
  await expect(todoItem.getByTestId('todo-title')).toHaveText(taskName);

  const completionCheckbox = todoItem.getByRole('checkbox');
  await completionCheckbox.check();

  await expect(completionCheckbox).toBeChecked();
  await expect(todoItem).toHaveClass(/completed/);
});
