import { Page } from '@playwright/test';

export class BrowsePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickItemByName(itemName: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: itemName }).first();
    await item.scrollIntoViewIfNeeded();
    await item.click();
  }

async handleModalIfExists() {
  const modal = this.page.locator('.modal-popup:visible').first();
  if (await modal.count()) {
    const option = modal.locator('.item-option-radio-list').first();
    if (await option.count()) await option.check();
    await modal.getByRole('button', { name: 'Add' }).click();
  }
}
  async setQuantity(qty: number) {
    const plusBtn = this.page.getByRole('button', { name: '+' });
    for (let i = 1; i < qty; i++) await plusBtn.click();
  }

  async addItemToOrder(itemName: string, qty = 1) {
    await this.clickItemByName(itemName);
    await this.handleModalIfExists();
    await this.setQuantity(qty);
    const addBtn = this.page.getByRole('button', { name: 'Add' });
    if (await addBtn.isVisible({ timeout: 1000 })) await addBtn.click();
  }
}