import { Page, expect, Locator } from '@playwright/test';
import { ToppingHandler } from './ToppingHandler';

export class SingleItem {
  readonly toppingHandler: ToppingHandler;
  readonly dialog: Locator;

  constructor(private page: Page) {
    this.toppingHandler = new ToppingHandler(page);
    this.dialog = page.getByRole('dialog');
  }

  async configure(item: any) { 
    await expect(this.dialog).toBeVisible();

    // OPTION SELECTION (IT 5, 6, 7 )
    if (item.ItemOption === "With Item Option") {
      
      // CASE: IT 6 (Caesar Salad )
      if (item.ItemCode === "IT 6") {
        console.log(`[${item.ItemCode}] Selecting Caesar Options...`);
        const anchovyChoice = item.TargetOption || "No Additions";
        await this.dialog.locator('div').filter({ hasText: /Anchovies Option/i })
            .getByText(new RegExp(anchovyChoice, 'i')).first().click();

        const chickenChoice = item.TargetOptionSecondary || "No Additions";
        await this.dialog.locator('div').filter({ hasText: /Chicken Option/i })
            .getByText(new RegExp(chickenChoice, 'i')).first().click();
      } 
      
      // CASE: IT 5 (Italian Salad)
      else if (item.ItemCode === "IT 5") {
        console.log(`[${item.ItemCode}] Selecting Sauce...`);
        const sauceName = item.TargetOption || "BBQ Sauce";
        await this.dialog.getByText(new RegExp(sauceName, 'i')).first().click();
      } 

      // CASE: IT 7 
     
      else if (item.TargetOption) {
        console.log(`[${item.ItemCode}] Selecting Option: ${item.TargetOption}`);
        const optionSelector = this.dialog.locator('div, label, span').filter({ 
            hasText: new RegExp(item.TargetOption, 'i') 
        }).last();
        await optionSelector.click({ force: true });
      }

      // DEFAULT FALLBACK
      else if (item.Category === "Grills") {
        console.log(`[${item.ItemCode}] Defaulting to Scalloped Potato...`);
        await this.dialog.getByText(/Scalloped Potato and Salad/i).last().click();
      }
    }

    // TOPPING REMOVAL
    if (item.Action === "Remove Current Toppings") {
      
      if (item.ItemCode === "IT 7" || item.ItemCode === "IT 14") {
      
        const pizzaToppings = [
          'Mozzarella', 'Tomato Sauce', 'BBQ Sauce', 'Ham (100% Pork)', 
          'Bacon', 'Hot Salami (100% Pork)', 'Beef', 'Mushrooms', 'Olives'
        ];
        console.log(`[${item.ItemCode}] Removing Pizza Toppings...`);
        await this.toppingHandler.removeToppingsByLabel(pizzaToppings);
      } 
      else if (item.ItemCode === "IT 5" || item.ItemCode === "IT 6") {
      
        const saladToppings = ['Capsicum', 'Red Onion', 'Lettuce', 'Tomato', 'Cucumber', 'Italian Dressing', 'Croutons', 'Egg'];
        await this.toppingHandler.removeToppingsByLabel(saladToppings);
      } 
      else {
        // Default List-style removal para sa Grills (IT 1, 3)
        await this.toppingHandler.removeCurrentToppings();
      }
    }

    // 3. EXTRA TOPPINGS
    if (item.ExtraToppings === "With Extra Toppings") {
      const toppingToSelect = item.TargetTopping || "Mozzarella";
      await this.toppingHandler.addExtraTopping(toppingToSelect);
    }

    // 4. CLICK ADD BUTTON
    const addBtn = this.dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addBtn).toBeEnabled({ timeout: 10000 });
    await addBtn.click();

    await expect(this.dialog).not.toBeVisible({ timeout: 10000 });
  }
}