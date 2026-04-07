import { Page, expect, Locator } from '@playwright/test';

export class PromoHandler {
  readonly promoInput: Locator;
  readonly applyBtn: Locator;
  readonly okBtn: Locator;

  constructor(private page: Page) {
    this.promoInput = page.getByRole('textbox', { name: /enter promotional code/i });
    this.applyBtn = page.getByRole('button', { name: /apply/i });
    this.okBtn = page.getByRole('button', { name: /ok/i });
  }

  async applyPromoCode(code: string) {
   
    await this.promoInput.clear();
    await this.promoInput.fill(code);
    
    await this.page.keyboard.press('Tab');
    
    await expect(this.applyBtn).toBeEnabled({ timeout: 10000 });
    await this.applyBtn.click();
  }

  async verifySuccess(successMessage: string) {
    const successRegex = new RegExp(successMessage, 'i');
    const successPopup = this.page.getByText(successRegex);
    
    await expect(successPopup).toBeVisible({ timeout: 15000 });
    await this.okBtn.click({ force: true });
    await expect(successPopup).not.toBeVisible();
    await this.page.waitForTimeout(1000); 
  }

  async verifyFailure(errorMessage: string) {
    const errorPattern = new RegExp(errorMessage.replace('$', '\\$'), 'i');
    const errorPopup = this.page.getByText(errorPattern);

    await expect(errorPopup.first()).toBeVisible({ timeout: 15000 });
    
    if (await this.okBtn.isVisible()) {
      await this.okBtn.click({ force: true });
    }
    await this.page.waitForTimeout(1000);
  }
}