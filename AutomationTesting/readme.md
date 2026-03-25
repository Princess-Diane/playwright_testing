first version 
import { test, expect, devices } from '@playwright/test';
import items from '../data/items.json';

test.use({ 
  ...devices['iPhone 13 Pro'], 
  isMobile: true,
  hasTouch: true,
  ignoreHTTPSErrors: true,
  viewport: { width: 390, height: 844 },
});

for (const item of items) {
  const itemCode = item.ItemCode;
  const itemName = item.OOItem;
  const itemOption = item.ItemOption;

  if (!itemName || itemName.includes('SKIPPED')) continue;

  test(`Ordering Item ${itemCode}: ${itemName}`, async ({ page }) => {
    const landingURL = 'https://staging.localserves.com.au/order/robots-only-wpay/table-menu/';

    await page.goto(landingURL, { waitUntil: 'networkidle' });

    const tableInput = page.getByRole('textbox', { name: 'Table Number' });
    await tableInput.fill('1');
    await page.keyboard.press('Enter');

    const startBtn = page.locator('#table-btn');
    await expect(startBtn).toBeEnabled({ timeout: 10000 });
    await startBtn.tap();

    await page.waitForURL('**/table-menu/**', { timeout: 30000 });
    await page.waitForLoadState('networkidle'); 
  
    await page.waitForTimeout(1000); 

    console.log("Menu page loaded. Selecting category...");
    console.log("Selecting category...");
  
    const categoryLink = page.getByRole('link').filter({ hasText: /^Grills/i }).first();
    await categoryLink.scrollIntoViewIfNeeded();
    await categoryLink.click(); 
    console.log(`Waiting for item: ${itemName}`);
 
    const itemCard = page.locator('.item-title').filter({ hasText: itemName }).first();
    await itemCard.waitFor({ state: 'visible', timeout: 15000 });
    await itemCard.click();

    console.log("Waiting for customization modal...");
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const spinner = page.locator('.loading-spinner, .spinner, .v-loading, .loading-arc');
    await spinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
        console.log("No spinner found or it disappeared quickly.");
    });

    const sideOption = dialog.getByText('Scalloped Potato and Salad').first();
    
    await expect(sideOption).toBeVisible({ timeout: 10000 });
    
    console.log("Selecting side option...");
    await sideOption.scrollIntoViewIfNeeded();
    await sideOption.click();

    // --- Start of new topping removal lines ---
    await page.locator('#current-toppings-list-ul').getByRole('listitem').filter({ hasText: 'Mozzarella' }).locator('span').first().click();
    await page.locator('label').filter({ hasText: 'Cheese' }).locator('span').first().click();
    await page.locator('#current-toppings-list-ul').getByRole('listitem').filter({ hasText: 'Chicken' }).locator('span').first().click();
    await page.locator('#current-toppings-list-ul').getByRole('listitem').filter({ hasText: 'Napoli Sauce' }).locator('span').first().click();
    await page.getByText('Current Toppings').click();
    // --- End of new topping removal lines ---

    const addBtn = dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeEnabled();
    
    console.log("Clicking Add to Cart...");
    await addBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });
}

working version 

import { test, expect, devices } from '@playwright/test';
import items from '../data/items.json';

test.use({ 
  ...devices['iPhone 13 Pro'], 
  isMobile: true,
  hasTouch: true,
  ignoreHTTPSErrors: true,
  viewport: { width: 390, height: 844 },
});

for (const item of items) {
  const itemCode = item.ItemCode;
  const itemName = item.OOItem;

  if (!itemName || itemName.includes('SKIPPED')) continue;

  test(`Ordering Item ${itemCode}: ${itemName}`, async ({ page }) => {
    test.slow(); 

    const landingURL = 'https://staging.localserves.com.au/order/robots-only-wpay/table-menu/';

    await page.goto(landingURL, { waitUntil: 'networkidle' });

    // Table Selection
    const tableInput = page.getByRole('textbox', { name: 'Table Number' });
    await tableInput.fill('1');
    await page.keyboard.press('Enter');

    const startBtn = page.locator('#table-btn');
    await expect(startBtn).toBeEnabled({ timeout: 10000 });
    await startBtn.tap();

    await page.waitForURL('**/table-menu/**', { timeout: 30000 });
    await page.waitForLoadState('networkidle'); 
    await page.waitForTimeout(1000); 

    // Category Selection
    const categoryLink = page.getByRole('link').filter({ hasText: /^Grills/i }).first();
    await categoryLink.scrollIntoViewIfNeeded();
    await categoryLink.click(); 
 
    // Item Selection
    const itemCard = page.locator('.item-title').filter({ hasText: itemName }).first();
    await itemCard.waitFor({ state: 'visible', timeout: 15000 });
    await itemCard.click();

    // Dialog & Customization
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const spinner = page.locator('.loading-spinner, .spinner, .v-loading, .loading-arc');
    await spinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    const sideOption = dialog.getByText('Scalloped Potato and Salad').first();
    await expect(sideOption).toBeVisible({ timeout: 10000 });
    await sideOption.scrollIntoViewIfNeeded();
    await sideOption.click();

    // Topping removal
    await page.locator('#current-toppings-list-ul').getByRole('listitem').filter({ hasText: 'Mozzarella' }).locator('span').first().click();
    await page.locator('label').filter({ hasText: 'Cheese' }).locator('span').first().click();
    await page.locator('#current-toppings-list-ul').getByRole('listitem').filter({ hasText: 'Chicken' }).locator('span').first().click();
    await page.locator('#current-toppings-list-ul').getByRole('listitem').filter({ hasText: 'Napoli Sauce' }).locator('span').first().click();
    
    // Add to Cart
    const addBtn = dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Checkout Flow
    const checkoutBtn = page.getByRole('button', { name: /Checkout/i });
    await checkoutBtn.scrollIntoViewIfNeeded();
    await checkoutBtn.click();

    const loginToggle = page.locator('p', { hasText: /Have an account/i })
                            .getByText('Login', { exact: true })
                            .filter({ visible: true });
                            
    await loginToggle.scrollIntoViewIfNeeded();
    await loginToggle.click();

    const loginSubmitBtn = page.getByRole('button', { name: 'Login', exact: true });
    await expect(loginSubmitBtn).toBeVisible({ timeout: 10000 });

    // Fill credentials
    const emailField = page.getByRole('textbox', { name: 'Email Address / Phone Number' });
    await emailField.fill('ezpos.tester@gmail.com');

    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await passwordField.fill('123123123');

    // Submit Login
    await loginSubmitBtn.click();
    await page.waitForLoadState('networkidle');

    const paymentHeading = page.getByRole('heading', { name: 'Payment Method' });
    await expect(paymentHeading).toBeVisible({ timeout: 15000 });

    const paymentFrame = page.frameLocator('iframe[title*="Gr4vy"]');

    const radioBtn = paymentFrame.getByRole('radio').first();

    console.log("Waiting for payment frame and radio button...");

    await paymentHeading.scrollIntoViewIfNeeded();
    await expect(radioBtn).toBeVisible({ timeout: 20000 });
    console.log("Selecting payment method...");

    await radioBtn.click({ force: true });
    const confirmBtn = page.getByRole('button', { name: /Confirm Order/i });
    
    await expect(confirmBtn).toBeEnabled({ timeout: 15000 });
    await confirmBtn.click();

    console.log("Waiting for order confirmation page...");
    await page.waitForURL('**/table-menu/?page=confirm_order2', { timeout: 30000 });
    
    await expect(page).toHaveURL(/.*confirm_order2/);
    console.log("Test Passed: Order successfully placed!");
  });

  
}

  {
    "ItemCode": "IT 4",
     "Category": "Grills",
    "ItemType": "Single Item",
    "ItemOption": "With Item Option",
    "ExtraToppings": "With Extra Toppings",
    "OOItem": "Bolognese Chicken Parmigiana"
  },