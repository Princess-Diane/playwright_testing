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

    if (item.Size) {
      const sizeTrigger = this.dialog.getByText('Select Size', { exact: false });
      if (await sizeTrigger.isVisible()) {
        await sizeTrigger.click();
        await this.dialog.getByText(item.Size, { exact: true }).click();
      }
    }

    // FIRST HALF
    const firstHalfTrigger = this.dialog.getByText('Select your first half', { exact: false });
    await firstHalfTrigger.waitFor({ state: 'visible', timeout: 20000 });
    await firstHalfTrigger.click();

    const pizza1 = this.dialog.getByText(item.FirstHalf, { exact: false }).filter({ visible: true }).first();
    await pizza1.waitFor({ state: 'visible' });
    await pizza1.click();

    await this.page.waitForTimeout(1000);
  
    const itemOptionTrigger = this.dialog.getByText('Item Option', { exact: true });
    if (await itemOptionTrigger.isVisible()) {
      await itemOptionTrigger.click();
      const defaultOption = this.dialog.locator('text').filter({ hasText: /regular|standard|normal/i }).first();
      if (await defaultOption.isVisible()) {
        await defaultOption.click();
      } else {
      
        const firstOption = this.dialog.locator('button, [role="option"]').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }
    }

    if (item.FirstHalfOption) {
      await this.dialog.getByText(item.FirstHalfOption, { exact: true }).filter({ visible: true }).first().click();
    }

    if (Array.isArray(item.FirstHalfRemovals) && item.FirstHalfRemovals.length > 0) {
      await this.toppingHandler.removeToppingsByLabel(item.FirstHalfRemovals);
    }

    const nextBtn1 = this.dialog.getByRole('button', { name: 'Next', exact: true });
    if (await nextBtn1.isVisible()) {
      await nextBtn1.click();
      await nextBtn1.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
      await this.dialog.getByText(/second half/i).waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }

    const secondHalfTrigger = this.dialog.getByText('Select your second half', { exact: false });
    await secondHalfTrigger.waitFor({ state: 'visible' });

    const pizza2 = this.dialog.getByText(item.SecondHalf, { exact: false }).filter({ visible: true }).first();
 
    if (!(await pizza2.isVisible())) {
      await secondHalfTrigger.click();
    }
 
    await pizza2.waitFor({ state: 'visible' });
    await pizza2.click();

    if (item.SecondHalfOption) {
      await this.dialog.getByText(item.SecondHalfOption, { exact: true }).filter({ visible: true }).first().click();
    }

    if (Array.isArray(item.SecondHalfRemovals) && item.SecondHalfRemovals.length > 0) {
      await this.toppingHandler.removeToppingsByLabel(item.SecondHalfRemovals);
    }

    const nextBtn2 = this.dialog.getByRole('button', { name: 'Next', exact: true });
    if (await nextBtn2.isVisible()) {
      await nextBtn2.click();
      await nextBtn2.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }

    const addBtn = this.dialog.getByRole('button', { name: /^Add$/i, exact: true });
    
    if (await addBtn.isVisible()) {
      await expect(addBtn).toBeEnabled();
      await addBtn.click();
     
      await expect(this.dialog).not.toBeVisible({ timeout: 15000 });
    } else {
      
      console.log('Final "Add" button not found; assuming Meal Deal flow completed.');
    }
  }
}