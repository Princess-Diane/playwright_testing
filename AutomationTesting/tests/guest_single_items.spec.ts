import { test, expect, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import itemsRaw from '../data/items.json';
import { LandingPage } from '../pages/LandingPage';
import { MenuPage } from '../pages/MenuPage';
import { SingleItem } from '../pages/SingleItem';
import { GroupItem } from '../pages/GroupItem';
import { GuestCheckoutPage } from '../pages/GuestCheckoutPage';

dotenv.config();
const items = itemsRaw as any[];

test.use({ ...devices['iPhone 13 Pro'], ignoreHTTPSErrors: true, hasTouch: true });

for (const item of items) {
  if (!item.OOItem || item.OOItem.includes('SKIPPED')) continue;

  test(`Guest Order Flow for ${item.ItemCode}: ${item.OOItem}`, async ({ page }) => {
    test.slow();
    
    const landing = new LandingPage(page);
    const menu = new MenuPage(page);
    const singleItem = new SingleItem(page);
    const groupItem = new GroupItem(page); 
  
    const guestCheckout = new GuestCheckoutPage(page);

    await page.goto(process.env.BASE_URL!);
    
    // Start Order
    await landing.enterTableAndStart(process.env.TABLE_NUMBER || '1');

    // Select Category and Item
    console.log(`Guest Navigating to Category: ${item.Category}`);
    await menu.selectCategory(item.Category || 'Grills'); 
    await menu.openItem(item.OOItem);

    // Configuration
    if (item.ItemType === 'Single Item') {
      await singleItem.configure(item);
    } 
    else if (item.ItemType === 'Group Item') {
      await groupItem.configure(item);
    }

    // Guest Checkout (Automatic Data Generation)
    console.log("Proceeding with Automatic Guest Checkout...");
    await guestCheckout.guestAndPay();

    //Verification
    await expect(page).toHaveURL(/.*confirm_order2/, { timeout: 30000 });
    console.log(`SUCCESS: Guest Order ${item.ItemCode} placed successfully.`);
  });
}