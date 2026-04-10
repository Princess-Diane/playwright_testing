import { Page, expect } from '@playwright/test';

export class GuestCheckoutPage {
  constructor(private page: Page) {}

  private generateGuestData() {
    const timestamp = Date.now();
    return {
      firstName: `Guest${timestamp.toString().slice(-4)}`,
      email: `guest_${timestamp}@example.com`,
      phone: `04${Math.floor(10000000 + Math.random() * 90000000)}`
    };
  }

 
  private async fillCardDetails(paymentFrame: any) {
    console.log("Selecting Card payment method in Iframe...");
   
    const cardOption = paymentFrame.locator('label').filter({ hasText: /^Card$/ });
    await cardOption.waitFor({ state: 'visible', timeout: 20000 });
    await cardOption.click();

    console.log("Filling Test Card Details...");
  
    await paymentFrame.getByRole('textbox', { name: 'Card Number' }).fill('4111 1111 1111 1111');
    await paymentFrame.getByRole('textbox', { name: 'Expiry date , MM/YY' }).fill('12/26');
    await paymentFrame.getByRole('textbox', { name: 'CVV , 3 digits' }).fill('123');
  }

 
  async guestAndPay() {
    console.log("Starting Automatic Guest Checkout...");

    const checkoutBtn = this.page.getByRole('button', { name: /Checkout/i });
    await checkoutBtn.scrollIntoViewIfNeeded();
    await checkoutBtn.click();

    const guestToggle = this.page.getByText('Guest', { exact: true });
    await guestToggle.waitFor({ state: 'visible' });
    await guestToggle.click();

    const data = this.generateGuestData();
    console.log(`Using Guest Data: ${data.email}`);

    await this.page.getByRole('textbox', { name: 'First Name' }).fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Mobile Number' }).fill(data.phone);
    await this.page.getByRole('textbox', { name: 'Email address' }).fill(data.email);

    const guestSubmitBtn = this.page.getByRole('button', { name: 'Checkout as Guest' });
    await guestSubmitBtn.click();

    await expect(guestSubmitBtn).not.toBeVisible({ timeout: 15000 });

    console.log("Waiting for Gr4vy Payment Frame...");
    const paymentFrame = this.page.frameLocator('iframe[title*="Gr4vy"]');
  
    await this.fillCardDetails(paymentFrame);

    const confirmBtn = this.page.getByRole('button', { name: /Confirm Order/i });
  
    await expect(confirmBtn).toBeEnabled({ timeout: 10000 });
    await confirmBtn.click();

    await this.page.waitForURL('**/table-menu/?page=confirm_order2', { timeout: 30000 });
    console.log("SUCCESS: Guest Order placed successfully.");
  }
}