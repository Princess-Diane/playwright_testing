import { Page, expect } from '@playwright/test';

export class CheckoutPage{
  constructor(private page: Page) {}

  async loginAndPay(email: string, pass: string) {
    // Navigate to Checkout
    const checkoutBtn = this.page.getByRole('button', { name: /Checkout/i });
    await checkoutBtn.scrollIntoViewIfNeeded();
    await checkoutBtn.click();

    // Handle Login
    const loginToggle = this.page.locator('p', { hasText: /Have an account/i }).getByText('Login');
    await loginToggle.click();
    await this.page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(pass);
    await this.page.getByRole('button', { name: 'Login', exact: true }).click();

    // Payment Logic
    const paymentFrame = this.page.frameLocator('iframe[title*="Gr4vy"]');
    const radioBtn = paymentFrame.getByRole('radio').first();
    await expect(radioBtn).toBeVisible({ timeout: 20000 });
    await radioBtn.click({ force: true });

    // Confirm Order
    const confirmBtn = this.page.getByRole('button', { name: /Confirm Order/i });
    await confirmBtn.click();
    await this.page.waitForURL('**/table-menu/?page=confirm_order2', { timeout: 30000 });
  }

  async loginOnly(email: string, pass: string) {
    const loginToggle = this.page.locator('p', { hasText: /Have an account/i }).getByText('Login');
    await loginToggle.click();
    await this.page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(pass);
    await this.page.getByRole('button', { name: 'Login', exact: true }).click();

    // wait for checkout promo input 
    await expect(this.page.getByRole('textbox', { name: /enter promotional code/i })).toBeVisible({ timeout: 15000 });
  }
}