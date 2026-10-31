import { test, expect } from '@playwright/test';
import { SaleorClient } from '../../support/graphql-client';
import { SHOP } from '../../support/queries';

test('@smoke @ui Saleor Dashboard loads while GraphQL backend is reachable', async ({ page, request }) => {
  const client = new SaleorClient(request);
  const shop = await client.execute<{ shop: { name: string } }>(SHOP);
  expect(shop.shop.name).toBeTruthy();

  const response = await page.goto('/');
  expect(response, 'dashboard navigation response').not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
  // The dashboard may show a login page. We deliberately do not assume credentials.
});

test('@regression @ui dashboard displays meaningful content rather than a blank page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await expect.poll(async () => (await page.locator('body').innerText()).trim().length).toBeGreaterThan(20);
});
