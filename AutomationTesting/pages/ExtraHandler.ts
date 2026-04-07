import { Page } from '@playwright/test';

export class ExtraHandler {
  constructor(private page: Page) {}

  async addExtras(extras: { Category: string, Name: string }[]) {
    const extrasHeader = this.page.getByText('Extras', { exact: true });
    const subHeader = this.page.getByText('Choose Up To 12 Extras', { exact: false });

    if (await extrasHeader.isVisible()) {
      await extrasHeader.click();
      await this.page.waitForTimeout(300);
    }
    
    if (await subHeader.isVisible()) {
        await subHeader.click().catch(() => {}); 
    }

    for (const extra of extras) {
      console.log(`Processing Extra: ${extra.Name} (${extra.Category})`);
      const toppingLabel = this.page.locator('label.extra-hh-topping')
        .filter({ hasText: new RegExp(extra.Name, 'i') })
        .first();

      if (!(await toppingLabel.isVisible())) {
        const categoryHeader = this.page.getByText(extra.Category, { exact: true }).first();
        
        if (await categoryHeader.isVisible()) {
          console.log(`Expanding Category: ${extra.Category}`);
          await categoryHeader.click();
          await this.page.waitForTimeout(400); 
        }
      }

      if (await toppingLabel.isVisible()) {
        const checkboxSpan = toppingLabel.locator('span').first();
        if (await checkboxSpan.isVisible()) {
            await checkboxSpan.click({ force: true });
        } else {
            await toppingLabel.click({ force: true });
        }
        await this.page.waitForTimeout(200); 
      } else {
        console.warn(`Warning: Topping "${extra.Name}" not found under ${extra.Category}`);
      }
    }
  }
}