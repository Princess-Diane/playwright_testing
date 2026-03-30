import { Page, expect, Locator } from '@playwright/test';
import { ToppingHandler } from './ToppingHandler';

export class HalfHalfItem {
  readonly toppingHandler: ToppingHandler;
  readonly dialog: Locator;

  constructor(private page: Page) {
    this.toppingHandler = new ToppingHandler(page);
    this.dialog = page.getByRole('dialog');
  }

  async configure(item: any) {
    await expect(this.dialog).toBeVisible();
    console.log(`Configuring Half-Half: ${item.FirstHalf} / ${item.SecondHalf}`);

    if (item.Size) {
      const sizeTrigger = this.dialog.getByText('Select Size', { exact: false });
      if (await sizeTrigger.isVisible()) {
        await sizeTrigger.click();
        await this.dialog.getByText(item.Size, { exact: true }).click();
        console.log(`Selected Size: ${item.Size}`);
      }
    }

    // FIRST HALF
    const firstHalfTrigger = this.dialog.getByText('Select your first half', { exact: false });
    await firstHalfTrigger.waitFor({ state: 'visible', timeout: 20000 });
    await firstHalfTrigger.click();

    const pizza1 = this.dialog.getByText(item.FirstHalf, { exact: false }).filter({ visible: true }).first();
    await pizza1.waitFor({ state: 'visible' });
    await pizza1.click();

    if (item.FirstHalfOption) {
      await this.dialog.getByText(item.FirstHalfOption, { exact: true }).filter({ visible: true }).first().click();
    }

    // FIRST HALF TOPPING REMOVAL
    if (Array.isArray(item.FirstHalfRemovals) && item.FirstHalfRemovals.length > 0) {
      await this.toppingHandler.removeToppingsByLabel(item.FirstHalfRemovals);
    }

    const nextBtn1 = this.dialog.getByRole('button', { name: 'Next', exact: true });
    if (await nextBtn1.isVisible()) {
      await nextBtn1.click();
      await nextBtn1.waitFor({ state: 'hidden' }); 
    }

    // SECOND HALF 
    const secondHalfTrigger = this.dialog.getByText('Select your second half', { exact: false });
    await secondHalfTrigger.waitFor({ state: 'visible' });
    await secondHalfTrigger.click();
 
    const pizza2 = this.dialog.getByText(item.SecondHalf, { exact: false }).filter({ visible: true }).first();
    await pizza2.waitFor({ state: 'visible' });
    await pizza2.click();

    if (item.SecondHalfOption) {
      await this.dialog.getByText(item.SecondHalfOption, { exact: true }).filter({ visible: true }).first().click();
    }

    // SECOND HALF TOPPING REMOVAL
    if (Array.isArray(item.SecondHalfRemovals) && item.SecondHalfRemovals.length > 0) {
      await this.toppingHandler.removeToppingsByLabel(item.SecondHalfRemovals);
    }

    const nextBtn2 = this.dialog.getByRole('button', { name: 'Next', exact: true });
    if (await nextBtn2.isVisible()) {
      await nextBtn2.click();
      await nextBtn2.waitFor({ state: 'hidden' });
    }

    // FINALIZE
    const addBtn = this.dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    await expect(this.dialog).not.toBeVisible({ timeout: 15000 });
  }
}