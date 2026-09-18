import { expect, type Locator, type Page } from '@playwright/test';

export interface ProductDetails {
  name: string;
  unitPrice: string;
}

export class ProductPage {
  private readonly page: Page;
  private readonly productName: Locator;
  private readonly unitPrice: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly cartLink: Locator;
  private readonly addedToCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.getByRole('heading', { level: 1 });
    this.unitPrice = page.getByLabel('unit-price', { exact: true });
    this.quantityInput = page.getByRole('spinbutton');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.cartLink = page.getByLabel('cart', { exact: true });
    this.addedToCartMessage = page.getByText('Product added to shopping cart.', {
      exact: true,
    });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/product\//);
    await expect(this.productName).toBeVisible();
    await expect(this.addToCartButton).toBeEnabled();
  }

  async getProductDetails(): Promise<ProductDetails> {
    return {
      name: (await this.productName.innerText()).trim(),
      unitPrice: (await this.unitPrice.innerText()).trim(),
    };
  }

  async expectQuantity(quantity: number): Promise<void> {
    await expect(this.quantityInput).toHaveValue(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async expectAddedToCart(quantity: number): Promise<void> {
    await expect(this.addedToCartMessage).toBeVisible();
    await expect(this.cartLink).toContainText(String(quantity));
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
