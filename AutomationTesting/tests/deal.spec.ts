import { test, expect, devices } from '@playwright/test';
import deals from '../data/deal_items.json';
import { LandingPage } from '../pages/LandingPage';
import { MenuPage } from '../pages/MenuPage';
import { DealItem } from '../pages/DealItem';
import { CheckoutPage } from '../pages/CheckoutPage';
import * as dotenv from 'dotenv';

dotenv.config();

test.use({ 
  ...devices['iPhone 13 Pro'], 
  hasTouch: true, 
  ignoreHTTPSErrors: true  
});

for (const deal of deals) {
  test(`Meal Deal Order: ${deal.ItemCode} - ${deal.OOItem}`, async ({ page }) => {
    test.slow();

    const landing = new LandingPage(page);
    const menu = new MenuPage(page);
    const dealHandler = new DealItem(page);
    const checkout = new CheckoutPage(page);

    await page.goto(process.env.BASE_URL!);

    await landing.enterTableAndStart(process.env.TABLE_NUMBER || '1');

    console.log("Navigating to Meal Deals...");
    await menu.selectCategory('Meal Deals');
    await page.waitForLoadState('networkidle');
    await menu.openItem(deal.OOItem);

    await dealHandler.configure(deal);

    console.log("Stabilizing before checkout...");
    await page.waitForTimeout(2000);

    await checkout.loginAndPay(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);

    await expect(page).toHaveURL(/.*confirm_order2/, { timeout: 30000 });
    console.log(`SUCCESS: ${deal.OOItem} ordered successfully!`);
  });
}