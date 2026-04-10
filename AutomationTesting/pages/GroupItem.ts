import { Page, expect, Locator } from '@playwright/test';
import { ExtraHandler } from './ExtraHandler';
import { ToppingHandler } from './ToppingHandler';

export class GroupItem {
  readonly extraHandler: ExtraHandler;
  readonly toppingHandler: ToppingHandler;
  readonly dialog: Locator;

  constructor(private page: Page) {
    this.extraHandler = new ExtraHandler(page);
    this.toppingHandler = new ToppingHandler(page);
    this.dialog = page.getByRole('dialog');
  }

  async configure(item: any) {
    console.log(`Configuring Group Item: [${item.ItemCode}] ${item.OOItem}`);
    await expect(this.dialog).toBeVisible();

    // --- IT 16: CHICKEN WINGS ---
    if (item.ItemCode === "IT 16") {
      console.log(`[${item.ItemCode}] Executing Wings Flow...`);
      const trigger = this.dialog.getByText('Choose one', { exact: false }).first();
      if (await trigger.isVisible()) {
        await trigger.click();
        await this.page.waitForTimeout(500);
      }

      if (item.MainOption) {
        await this.dialog.getByText(new RegExp(item.MainOption, 'i')).first().click();
        await this.page.waitForTimeout(800);
      }

      if (item.GroupChoices && item.GroupChoices.length > 0) {
        for (const choice of item.GroupChoices) {
          await this.dialog.getByText(choice, { exact: true }).first().click();
          await this.page.waitForTimeout(300);
        }
      }
    }

    else if (item.ItemCode === "IT 15") {
      console.log(`[${item.ItemCode}] Executing Nuggets Flow...`);
      if (item.MainOption) {
       
        await this.dialog.getByText(new RegExp(item.MainOption, 'i')).first().click();
        await this.page.waitForTimeout(500);
      }

      if (item.GroupChoices && item.GroupChoices.length > 0) {
        for (const choice of item.GroupChoices) {
          const choiceBtn = this.dialog.getByText(choice, { exact: true }).first();
          await choiceBtn.scrollIntoViewIfNeeded();
          await choiceBtn.click();
          await this.page.waitForTimeout(300);
        }
      }

      const nextBtn = this.dialog.getByRole('button', { name: 'Next', exact: true });
      if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await this.page.waitForTimeout(800);
      }
    }

    // --- DEFAULT FALLBACK ---
    else {
      if (item.MainOption) {
        await this.dialog.getByText(new RegExp(item.MainOption, 'i')).first().click();
      }
      if (item.GroupChoices && Array.isArray(item.GroupChoices)) {
        for (const choice of item.GroupChoices) {
          await this.dialog.getByText(choice, { exact: true }).first().click();
        }
      }
    }

    if (item.Action === "Remove Current Toppings") {
      console.log(`[${item.ItemCode}] Removing Toppings...`);
      if (item.ItemCode === "IT 16") {
        const wingsToppings = ['Bacon', 'Chicken'];
        await this.toppingHandler.removeToppingsByLabel(wingsToppings);
      } else {
        await this.toppingHandler.removeCurrentToppings();
      }
    }

    if (item.Extras && Array.isArray(item.Extras)) {
      console.log(`[${item.ItemCode}] Adding Extras...`);
      await this.extraHandler.addExtras(item.Extras);
    }

    const addBtn = this.dialog.getByRole('button', { name: 'Add', exact: true });
    await addBtn.waitFor({ state: 'visible' });
    await expect(addBtn).toBeEnabled({ timeout: 10000 });
    await addBtn.click();

    await expect(this.dialog).not.toBeVisible({ timeout: 15000 });
  }
}