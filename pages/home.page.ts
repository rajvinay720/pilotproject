import { expect, type Locator, type Page } from '@playwright/test';

export interface ProductSummary {
  name: string;
  unitPrice: string;
}

function priceWithoutCurrency(price: string): string {
  return price.replace('$', '').trim();
}

export class HomePage {
  private readonly page: Page;
  private readonly productCards: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.locator('a[data-test^="product-"]');
    this.searchInput = page.getByPlaceholder('Search');
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
  }

  private productLink(productName: string): Locator {
    return this.page.getByRole('link', {
      name: new RegExp(`^${productName}\\b`),
    });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async expectProductListingDisplayed(): Promise<void> {
    await expect(this.productCards.first()).toBeVisible();
    expect(await this.productCards.count()).toBeGreaterThan(0);
  }

  async searchFor(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
  }

  async expectSingleAvailableProduct(productName: string): Promise<void> {
    await expect(this.productCards).toHaveCount(1, { timeout: 15_000 });

    const productLink = this.productLink(productName);
    await expect(productLink).toBeVisible();
    await expect(productLink.getByText('Out of stock', { exact: true })).toHaveCount(0);
  }

  async getProductSummary(productName: string): Promise<ProductSummary> {
    const productLink = this.productLink(productName);
    const name = (await productLink.getByRole('heading', { level: 5 }).innerText()).trim();
    const price = await productLink.getByText(/^\$\d+\.\d{2}$/).innerText();

    return {
      name,
      unitPrice: priceWithoutCurrency(price),
    };
  }

  async openProduct(productName: string): Promise<void> {
    await this.productLink(productName).click();
  }
}
