import { test, expect, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import itemsRaw from '../data/group_items.json';  
import { LandingPage } from '../pages/LandingPage';
import { MenuPage } from '../pages/MenuPage';
import { GroupItem } from '../pages/GroupItem';
import { GuestCheckoutPage } from '../pages/GuestCheckoutPage';  

dotenv.config();
const items = itemsRaw as any[];

test.use({ 
  ...devices['iPhone 13 Pro'], 
  ignoreHTTPSErrors: true, 
  hasTouch: true 
});

for (const item of items) {
   
  if (!item.OOItem || item.OOItem.includes('SKIPPED')) continue;
  if (item.ItemType !== 'Group Item') continue;  

  test(`Guest Group Order Flow: ${item.ItemCode} - ${item.OOItem}`, async ({ page }) => {
     
    test.slow();
    
    const landing = new LandingPage(page);
    const menu = new MenuPage(page);
    const groupItem = new GroupItem(page); 
    const guestCheckout = new GuestCheckoutPage(page);  

    
    await page.goto(process.env.BASE_URL!);
    await landing.enterTableAndStart(process.env.TABLE_NUMBER || '1');
 
    console.log(`Navigating to Category: ${item.Category}`);
    await menu.selectCategory(item.Category); 
    
    await page.waitForLoadState('networkidle');
    await menu.openItem(item.OOItem);
    await groupItem.configure(item);
 
    console.log("Item added. Stabilizing before Guest Checkout...");
    await page.waitForTimeout(1500);
 
    console.log("Proceeding with Guest Checkout...");
    await guestCheckout.guestAndPay();
 
    await expect(page).toHaveURL(/.*confirm_order2/, { timeout: 30000 });
    console.log(`SUCCESS: Guest Group Order for ${item.ItemCode} placed successfully.`);
  });
}