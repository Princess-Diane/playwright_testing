import { Page, expect, Locator } from '@playwright/test';
import { HalfHalfItem } from './HalfHalfItem';

export class DealItem {
  readonly halfHalfItem: HalfHalfItem;
  readonly dialog: Locator;

  constructor(private page: Page) {
    this.halfHalfItem = new HalfHalfItem(page);
    this.dialog = page.getByRole('dialog');
  }

  async configure(deal: any) {
    await expect(this.dialog).toBeVisible();
    console.log(`Configuring Deal: ${deal.OOItem}`);

    const pizzaRow = this.dialog.locator('p').filter({ 
      hasText: /Pizza/i 
    }).filter({ 
      hasNotText: /^1 X/ 
    }).first();

    await pizzaRow.waitFor({ state: 'visible' });
    await pizzaRow.click();

    const pizzaTrigger = this.dialog.getByText(/upgrade to half\/half/i);
    await pizzaTrigger.waitFor({ state: 'visible' });
    await pizzaTrigger.click();

 // First Half -> Next -> Second Half -> Next
    await this.halfHalfItem.configure(deal.PizzaData);

    const nextBtn = this.dialog.getByRole('button', { name: 'Next', exact: true });
    await nextBtn.waitFor({ state: 'visible' });
    await nextBtn.click();

    //  DRINK PART 
   
    const drinkCat = this.dialog.locator('p')
      .filter({ hasText: deal.DrinkCategory ?? 'Drink' })
      .filter({ hasNotText: /^1 x/i }).first();
    await drinkCat.waitFor({ state: 'visible' });
    await drinkCat.click();
    
    const drinkItem = this.dialog.locator('p')
      .filter({ hasText: deal.DrinkItem ?? 'Bottle' })
      .filter({ hasNotText: /^1 x/i }).first();
    await drinkItem.waitFor({ state: 'visible' });
    await drinkItem.click();

    const flavor = deal.DrinkOption ?? deal.DrinkFlavor;
    if (flavor) {
      const flavorLocator = this.dialog.getByText(flavor, { exact: false }).first();
      await flavorLocator.waitFor({ state: 'visible' });
      await flavorLocator.click();
    }

    const subNextBtn = this.dialog.getByRole('button', { name: 'Next', exact: true });
    await subNextBtn.waitFor({ state: 'visible' });
    await subNextBtn.click();

    if (await subNextBtn.isVisible()) {
        await subNextBtn.click();
    }

    const addBtn = this.dialog.getByRole('button', { name: 'Add to Order', exact: true });
    
    await expect(addBtn).toBeEnabled({ timeout: 10000 });
    await addBtn.click();
    
    await expect(this.dialog).toBeHidden();
    console.log(`Successfully added ${deal.OOItem} to order.`);
  }
}