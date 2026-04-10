import { Page, Locator } from '@playwright/test';

export class ExtraHandler {
  constructor(private page: Page) {}

  async addExtras(extras: { Category: string, Name: string }[]) {
    if (!extras || extras.length === 0) return;

    const extrasHeader = this.page.getByText('Extras', { exact: true });
  
    if (await extrasHeader.isVisible()) {
      await extrasHeader.click();
      await this.page.waitForTimeout(500); 
    }

    for (const extra of extras) {
      console.log(`Selecting Extra: ${extra.Name}`);

      const categoryHeader = this.page.getByText(extra.Category, { exact: true }).first();
     
      const toppingItem = this.page.locator('label, .multi-option-select')
        .filter({ hasText: new RegExp(`^${extra.Name}`, 'i') })
        .first();

      if (!(await toppingItem.isVisible()) && await categoryHeader.isVisible()) {
        await categoryHeader.click();
        await this.page.waitForTimeout(400);
      }

      if (await toppingItem.isVisible()) {
        const checkbox = toppingItem.locator('span.checkmark, input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
            await checkbox.click({ force: true });
        } else {
            await toppingItem.click({ force: true });
        }
        await this.page.waitForTimeout(300); 
      }
    }
  }
}