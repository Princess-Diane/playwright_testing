import { Page, expect } from '@playwright/test';

export class ToppingHandler {
  constructor(private page: Page) {}

  async removeToppingsByLabel(toppings: string[]) {
   
    const firstToppingCheck = this.page.locator('label').filter({ hasText: new RegExp(toppings[0], 'i') });
    
    if (!(await firstToppingCheck.isVisible())) {
      const header = this.page.getByText('Current Toppings', { exact: true });
      if (await header.isVisible()) {
        console.log("Toppings hidden. Expanding 'Current Toppings' section...");
        await header.click();
        await this.page.waitForTimeout(500); 
      }
    }

    for (const topping of toppings) {
      const toppingLabel = this.page.locator('label').filter({ 
        hasText: new RegExp(topping, 'i') 
      });

      if (await toppingLabel.count() > 0) {
        const element = toppingLabel.first();
        try {
          await element.scrollIntoViewIfNeeded({ timeout: 2000 });
          if (await element.isVisible()) {
            console.log(`Unchecking: ${topping}`);
            const checkbox = element.locator('span').first();
            if (await checkbox.isVisible()) {
                await checkbox.click({ force: true });
            } else {
                await element.click({ force: true });
            }
            await this.page.waitForTimeout(200); 
          }
        } catch (e) {
          console.log(`Skipping ${topping}: Could not click.`);
        }
      }
    }
  }

  async removeCurrentToppings(customList?: string[]) {
    const listContainer = this.page.locator('#current-toppings-list-ul');
    const masterList = [
      'Mozzarella', 'Cheese', 'Chicken', 'Homemade Bolognese Sauce', 'Parmesan', 'Napoli Sauce',
      'Tomato Sauce', 'BBQ Sauce', 'Ham (100% Pork)', 'Mushrooms', 'Olives', 'Anchovies', 
      'Bacon', 'Egg', 'Hot Salami (100% Pork)', 'Beef'
    ];
    const toppingsToProcess = customList || masterList;

    for (const topping of toppingsToProcess) {
      const toppingRow = listContainer.getByRole('listitem').filter({ hasText: new RegExp(topping, 'i') });
      const removeBtn = toppingRow.locator('span').first();
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await this.page.waitForTimeout(300); 
      }
    }
  }

  async addExtraTopping(toppingName: string) {
    const extraToppingLabel = this.page.locator('label').filter({ hasText: new RegExp(toppingName, 'i') }).first();
    if (await extraToppingLabel.count() > 0) {
        await extraToppingLabel.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
        if (await extraToppingLabel.isVisible()) {
            await extraToppingLabel.click();
        }
    }
  }
}