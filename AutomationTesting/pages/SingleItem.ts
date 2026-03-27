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

    // 
    if (item.ItemOption === "With Item Option") {
      
      // IT 6 (Caesar Salad)
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

      // IT 13 IT 8 (Drinks/Nuggets)
      else if (item.ItemCode === "IT 13" || item.ItemCode === "IT 8") {
        console.log(`[${item.ItemCode}] Selecting Drink: ${item.TargetOption}`);
        const drinkOption = this.dialog.getByText(item.TargetOption, { exact: true }).first();
        await drinkOption.click({ force: true });
        await this.page.waitForTimeout(500);
      }

      // IT 7
      else if (item.TargetOption) {
        console.log(`[${item.ItemCode}] Selecting Option: ${item.TargetOption}`);
        const optionSelector = this.dialog.locator('div, label, span').filter({ 
            hasText: new RegExp(item.TargetOption, 'i') 
        }).last();
        await optionSelector.click({ force: true });
      }

      // DEFAULT FALLBACK (Grills)
      else if (item.Category === "Grills") {
        console.log(`[${item.ItemCode}] Defaulting to Scalloped Potato...`);
        await this.dialog.getByText(/Scalloped Potato and Salad/i).last().click();
      }
    }

    //TOPPING REMOVAL
    if (item.Action === "Remove Current Toppings") {
      
      if (item.ItemCode === "IT 7" || item.ItemCode === "IT 14") {
        const pizzaToppings = ['Mozzarella', 'Tomato Sauce', 'BBQ Sauce', 'Ham (100% Pork)', 'Bacon', 'Beef', 'Mushrooms', 'Olives'];
        await this.toppingHandler.removeToppingsByLabel(pizzaToppings);
      } 
      else if (item.ItemCode === "IT 5" || item.ItemCode === "IT 6") {
        const saladToppings = ['Capsicum', 'Red Onion', 'Lettuce', 'Tomato', 'Cucumber', 'Italian Dressing', 'Croutons', 'Egg'];
        await this.toppingHandler.removeToppingsByLabel(saladToppings);
      } 
      else if (item.ItemCode === "IT 9") {
        console.log(`[${item.ItemCode}] Removing Wedges Toppings...`);
        await this.toppingHandler.removeToppingsByLabel(['Sour Cream', 'Sweet Chilli Sauce']);
      }
      else {
        await this.toppingHandler.removeCurrentToppings();
      }
    }

    //EXTRA TOPPINGS 
    if (item.ExtraToppings === "With Extra Toppings") {
      const toppingToSelect = item.TargetTopping || "Mozzarella";
      await this.toppingHandler.addExtraTopping(toppingToSelect);
    }

    //CLICK ADD BUTTON 
    const addBtn = this.dialog.getByRole('button', { name: 'Add', exact: true });
    
    await addBtn.waitFor({ state: 'visible' });
    await expect(addBtn).toBeEnabled({ timeout: 10000 });
    await addBtn.click();

    await expect(this.dialog).not.toBeVisible({ timeout: 15000 });
  }
}