import { test, expect, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import itemsRaw from '../data/items.json';
import { LandingPage } from '../pages/LandingPage';
import { MenuPage } from '../pages/MenuPage';
import { SingleItem } from '../pages/SingleItem';
import { GroupItem } from '../pages/GroupItem';
import { CheckoutPage } from '../pages/CheckoutPage';

dotenv.config();
const items = itemsRaw as any[];

test.use({ ...devices['iPhone 13 Pro'], ignoreHTTPSErrors: true, hasTouch: true });

for (const item of items) {
  if (!item.OOItem || item.OOItem.includes('SKIPPED')) continue;

  test(`Order Flow for ${item.ItemCode}: ${item.OOItem}`, async ({ page }) => {
    test.slow();
    
    const landing = new LandingPage(page);
    const menu = new MenuPage(page);
    const singleItem = new SingleItem(page);
    const groupItem = new GroupItem(page); 
    const checkout = new CheckoutPage(page);

    await page.goto(process.env.BASE_URL!);
    await landing.enterTableAndStart(process.env.TABLE_NUMBER || '1');

    await menu.selectCategory(item.Category || 'Grills'); 
    await menu.openItem(item.OOItem);

    if (item.ItemType === 'Single Item') {
      await singleItem.configure(item);
    } 
    else if (item.ItemType === 'Group Item') {
      await groupItem.configure(item);
    }

    await checkout.loginAndPay(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);

    await expect(page).toHaveURL(/.*confirm_order2/);
    console.log(`PASS: Item ${item.ItemCode} successfully ordered.`);
  });
}