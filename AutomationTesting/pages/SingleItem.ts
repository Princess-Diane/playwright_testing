import { Page, expect, Locator } from '@playwright/test';
import { ToppingHandler } from './ToppingHandler';

export class SingleItem {
  readonly toppingHandler: ToppingHandler;
  readonly dialog: Locator;

  constructor(private page: Page) {
    this.toppingHandler = new ToppingHandler(page);
    this.dialog = page.getByRole('dialog');
  }

 // pages/SingleItem.ts

async configure(item: any) { 
    await expect(this.dialog).toBeVisible();

    /**
     * 1. HANDLE OPTION SELECTION (Sides/Sauces)
     * Titignan muna kung "With Item Option" ang nasa JSON.
     * Kapag "Without Item Option" (gaya ng Greek Salad mo), lalaktawan ito ng code.
     */
    if (item.ItemOption === "With Item Option") {
      console.log(`[${item.ItemCode}] Processing options...`);
      
      // Fallback logic para sa TargetOption
      const optionName = item.TargetOption || "Scalloped Potato and Salad";
      const optionSelector = this.dialog.locator('div, label, span').filter({ 
          hasText: new RegExp(optionName, 'i') 
      }).last();

      await optionSelector.waitFor({ state: 'visible', timeout: 5000 });
      await optionSelector.scrollIntoViewIfNeeded();
      await optionSelector.click({ force: true });
    } else {
      // Log para alam mo na nilaktawan ang selection
      console.log(`[${item.ItemCode}] No options required. Proceeding to Add.`);
    }

    // 2. TOPPING REMOVAL (Kung IT1, IT3, etc.)
    if (item.Action === "Remove Current Toppings") {
      await this.toppingHandler.removeCurrentToppings();
    }

    // 3. EXTRA TOPPINGS (Kung IT1, IT2, etc.)
    if (item.ExtraToppings === "With Extra Toppings") {
      const toppingToSelect = item.TargetTopping || "Mozzarella";
      await this.toppingHandler.addExtraTopping(toppingToSelect);
    }

    // 4. CLICK ADD BUTTON
    // Ito ang gagawin niya agad para sa Greek Salad
    const addBtn = this.dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addBtn).toBeEnabled({ timeout: 10000 });
    await addBtn.click();

    // 5. FINAL CHECK
    const alert = this.page.getByText('Incomplete Order');
    if (await alert.isVisible()) {
        throw new Error(`Order Incomplete for ${item.ItemCode}. Check if this item actually requires an option.`);
    }
    
    await expect(this.dialog).not.toBeVisible({ timeout: 10000 });

  }
}