import { test, expect, devices } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';
import { MenuPage } from '../pages/MenuPage';
import { SingleItem } from '../pages/SingleItem';
import { PromoHandler } from '../pages/PromoHandler';
import { CheckoutPage } from '../pages/CheckoutPage'; // 1. Added Import
import promoData from '../data/promo_code.json';
import * as dotenv from 'dotenv';

dotenv.config();

test.use({ 
  ...devices['iPhone 13 Pro'], 
  ignoreHTTPSErrors: true,
  actionTimeout: 15000 
});

for (const scenario of promoData) {
  // 2. Added 'context' here to allow clearing cookies
  test(`Promo Validation: ${scenario.name}`, async ({ page, context }) => {
    test.setTimeout(90000);

    const landing = new LandingPage(page);
    const menu = new MenuPage(page);
    const singleItem = new SingleItem(page);
    const promo = new PromoHandler(page);
    const checkout = new CheckoutPage(page); // 3. Instantiate CheckoutPage

    await page.goto(process.env.BASE_URL!);
    
    // 4. Added Session Cleanup (Important for testing login/promo fresh)
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // Standard Flow
    await landing.enterTableAndStart(process.env.TABLE_NUMBER || '1');
    await menu.selectCategory(scenario.item.Category);
    await menu.openItem(scenario.item.OOItem);
    await singleItem.configure(scenario.item);

    await page.getByRole('button', { name: /Checkout/i }).first().click();

    // 5. Added Login Process Logic
    if (scenario.requiresLogin) {
      const email = process.env.TEST_EMAIL || process.env.PROMO_EMAIL;
      const password = process.env.TEST_PASSWORD || process.env.PROMO_PASSWORD;
      
      if (!email || !password) {
        throw new Error(`Scenario "${scenario.name}" requires login but credentials are missing in .env`);
      }
      
      await checkout.loginOnly(email, password);
    }

    await expect(promo.promoInput).toBeVisible({ timeout: 15000 });

    if (scenario.name.includes("Limit exceeded")) {
      await promo.applyPromoCode(scenario.code);
      await promo.okBtn.click({ force: true }); 
      await page.waitForTimeout(1500); 

      await promo.applyPromoCode(scenario.code);
      await promo.verifyFailure(scenario.successMessage ?? "already been used");

    } else if (scenario.name.includes("Stacking")) {
      await promo.applyPromoCode(scenario.code);
      await promo.verifySuccess(scenario.successMessage ?? '');

      await promo.applyPromoCode(scenario.code2 ?? '');

      if (scenario.name.includes("enabled")) {
        await promo.verifyFailure(scenario.successMessage2 ?? '');
      } else {
        await promo.verifySuccess(scenario.successMessage2 ?? '');
      }

    } else {
      // REGULAR FLOW
      await promo.applyPromoCode(scenario.code);
      if (scenario.expected === "pass") {
        await promo.verifySuccess(scenario.successMessage ?? '');
      } else {
        await promo.verifyFailure(scenario.errorMessage ?? '');
      }
    }
  });
}