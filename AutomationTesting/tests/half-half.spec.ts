import { test, expect, devices } from '@playwright/test';
import items from '../data/half_half_items.json';
import { LandingPage } from '../pages/LandingPage';
import { MenuPage } from '../pages/MenuPage';
import { HalfHalfItem } from '../pages/HalfHalfItem';
import { CheckoutPage } from '../pages/CheckoutPage';
import * as dotenv from 'dotenv';

dotenv.config();
 
test.use({ 
  ...devices['iPhone 13 Pro'], 
  hasTouch: true, 
  ignoreHTTPSErrors: true  
});

for (const item of items) {
  test(`Half-Half Order: ${item.ItemCode} - ${item.FirstHalf} & ${item.SecondHalf}`, async ({ page }) => {
    test.slow();

    const landing = new LandingPage(page);
    const menu = new MenuPage(page);
    const halfHalf = new HalfHalfItem(page);
    const checkout = new CheckoutPage(page);
 
    await page.goto(process.env.BASE_URL!);
    
    // Start Order
    await landing.enterTableAndStart(process.env.TABLE_NUMBER || '1');
 
    // Select Category
    console.log("Navigating to Half/Half category...");
    await menu.selectCategory('Half/Half');
    await page.waitForLoadState('networkidle');
 
    await menu.openItem(item.OOItem);
    await halfHalf.configure(item);

    console.log("Stabilizing before checkout...");
    await page.waitForTimeout(1500);

    //Login and Payment
    await checkout.loginAndPay(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);

    //Verify Final URL
    await expect(page).toHaveURL(/.*confirm_order2/, { timeout: 30000 });
    console.log(`SUCCESS: Half-Half ${item.FirstHalf}/${item.SecondHalf} ordered!`);
  });
}