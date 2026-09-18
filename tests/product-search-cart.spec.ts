import { expect, test } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { HomePage } from '../pages/home.page';
import { ProductPage } from '../pages/product.page';
import { availableProduct } from '../test-data/products';

test('searches for an available product and adds it to the cart', async ({ page }, testInfo) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);

  await test.step('Open the store and verify the product listing', async () => {
    await homePage.open();
    await homePage.expectProductListingDisplayed();
  });

  const listingProduct = await test.step(
    'Search for an available product and capture its listing details',
    async () => {
      await homePage.searchFor(availableProduct.searchTerm);
      await homePage.expectSingleAvailableProduct(availableProduct.expectedName);
      const summary = await homePage.getProductSummary(availableProduct.expectedName);

      expect(summary.name).toBe(availableProduct.expectedName);
      expect(Number(summary.unitPrice)).toBeGreaterThan(0);
      await homePage.openProduct(availableProduct.expectedName);
      return summary;
    },
  );

  const productDetails = await test.step(
    'Validate the selected product name, price, and quantity',
    async () => {
      await productPage.expectLoaded();
      const details = await productPage.getProductDetails();

      expect(details.name).toBe(listingProduct.name);
      expect(details.unitPrice).toBe(listingProduct.unitPrice);
      await productPage.expectQuantity(availableProduct.quantity);
      return details;
    },
  );

  await test.step('Add the product to the cart and open the cart', async () => {
    await productPage.addToCart();
    await productPage.expectAddedToCart(availableProduct.quantity);
    await productPage.openCart();
  });

  await test.step('Verify the same product, quantity, and price in the cart', async () => {
    await cartPage.expectLoaded(availableProduct.expectedName);
    const cartItem = await cartPage.getLineItem(availableProduct.expectedName);

    expect(cartItem.name).toBe(productDetails.name);
    expect(cartItem.quantity).toBe(availableProduct.quantity);
    expect(cartItem.unitPrice).toBe(productDetails.unitPrice);
    expect(cartItem.lineTotal).toBe(productDetails.unitPrice);
    expect(await cartPage.getCartTotal()).toBe(productDetails.unitPrice);

    const screenshotPath = testInfo.outputPath('verified-cart.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach('verified-cart', {
      path: screenshotPath,
      contentType: 'image/png',
    });
  });
});
