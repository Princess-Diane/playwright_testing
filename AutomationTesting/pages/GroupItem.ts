import { Page, expect, Locator } from '@playwright/test';
import { ToppingHandler } from './ToppingHandler';

export class GroupItem {
  readonly toppingHandler: ToppingHandler;
  readonly dialog: Locator;

  constructor(private page: Page) {
    this.toppingHandler = new ToppingHandler(page);
    this.dialog = page.getByRole('dialog');
  }

  async configure(item: any) {
    await expect(this.dialog).toBeVisible();

    if (item.ItemOption === "With Item Option") {
      const optionName = item.TargetOption;
      const optionSelector = this.dialog.locator('div, label, span').filter({ 
          hasText: new RegExp(optionName, 'i') 
      }).last();
      await optionSelector.click({ force: true });
    }

    if (item.Action === "Remove Current Toppings") {
      await this.toppingHandler.removeCurrentToppings();
    }

    if (item.ExtraToppings === "With Extra Toppings") {
      await this.toppingHandler.addExtraTopping(item.TargetTopping || "Mozzarella");
    }

    const addBtn = this.dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addBtn).toBeEnabled({ timeout: 10000 });
    await addBtn.click();
    
    await expect(this.dialog).not.toBeVisible();
    console.log(`[${item.ItemCode}] Successfully direct added Group Item.`);
  }
}