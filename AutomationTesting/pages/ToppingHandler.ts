import { Page, expect } from '@playwright/test';

export class ToppingHandler {
  constructor(private page: Page) {}

  async removeCurrentToppings(customList?: string[]) {
    const listContainer = this.page.locator('#current-toppings-list-ul');
   
    const masterList = [
      'Mozzarella', 
      'Cheese', 
      'Chicken', 
      'Homemade Bolognese Sauce', 
      'Parmesan', 
      'Napoli Sauce'
    ];

    const toppingsToProcess = customList || masterList;

    console.log("Checking toppings to remove...");

    for (const topping of toppingsToProcess) {
     
      const toppingRow = listContainer.getByRole('listitem').filter({ hasText: new RegExp(`^${topping}$`, 'i') });
     
      const removeBtn = toppingRow.locator('span').first();

      if (await removeBtn.isVisible()) {
        console.log(`Removing: ${topping}`);
        await removeBtn.click();
        
        await this.page.waitForTimeout(300); 
      } else {
        
        console.log(`Topping not found, skipping: ${topping}`);
      }
    }
  }

  async addExtraTopping(toppingName: string) {
    const extraToppingLabel = this.page.locator('label').filter({ hasText: toppingName }).first();
    if (await extraToppingLabel.isVisible()) {
        await extraToppingLabel.click();
    }
  }
}