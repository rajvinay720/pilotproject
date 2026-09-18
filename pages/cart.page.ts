import { expect, type Locator, type Page } from '@playwright/test';

export interface CartLineItem {
  name: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

function priceWithoutCurrency(price: string): string {
  return price.replace('$', '').trim();
}

export class CartPage {
  private readonly page: Page;
  private readonly cartTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartTotal = page
      .getByRole('row', { name: /^Total \$/ })
      .getByRole('cell')
      .filter({ hasText: /^\$\d+\.\d{2}$/ });
  }

  private itemRow(productName: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: productName, exact: true }),
    });
  }

  async expectLoaded(productName: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout$/);
    await expect(this.itemRow(productName)).toBeVisible();
  }

  async getLineItem(productName: string): Promise<CartLineItem> {
    const row = this.itemRow(productName);
    const quantity = await row
      .getByLabel(`Quantity for ${productName}`, { exact: true })
      .inputValue();
    const priceCells = row
      .getByRole('cell')
      .filter({ hasText: /^\$\d+\.\d{2}$/ });
    await expect(priceCells).toHaveCount(2);
    const [unitPrice, lineTotal] = await priceCells.allInnerTexts();

    return {
      name: (await row.getByRole('cell', { name: productName, exact: true }).innerText()).trim(),
      quantity: Number(quantity),
      unitPrice: priceWithoutCurrency(unitPrice),
      lineTotal: priceWithoutCurrency(lineTotal),
    };
  }

  async getCartTotal(): Promise<string> {
    return priceWithoutCurrency(await this.cartTotal.innerText());
  }
}
