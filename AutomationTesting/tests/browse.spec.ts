import { test, expect } from '@playwright/test';

test('Add multiple items dynamically with complimentary popup handling', async ({ page }) => {
  test.setTimeout(120_000);

  // Go to menu page
  await page.goto('https://orderonline.demo.deliverit.com.au/gamma/');
  await page.waitForLoadState('domcontentloaded');
  
  // Accept any dialogs automatically
  page.on('dialog', (d) => d.accept().catch(() => null));

  // Close banner if it exists
  try {
    const bannerClose = page.locator('#webalert_close');
    await bannerClose.waitFor({ state: 'visible', timeout: 3000 });
    await bannerClose.click();
    await page.locator('#webalert_container').waitFor({ state: 'hidden' });
  } catch {}

  // Scroll to menu section
  await page.locator('#single-item-block').scrollIntoViewIfNeeded();

  // Helper: dismiss overlays and modals
  async function dismissOverlays() {
    const popupQty = page.locator('#add-popup-qty');
    const backdrop = page.locator('.modal-backdrop');
    const customModal = page.locator('.custom-modal-overlay').first();

    // Close custom modals
    if (await customModal.isVisible({ timeout: 1500 }).catch(() => false)) {
      const primaryBtn = customModal.getByRole('button', { name: /ok|close|continue|cancel/i }).first();
      if (await primaryBtn.isVisible({ timeout: 1500 }).catch(() => false)) await primaryBtn.click();
      else await page.keyboard.press('Escape').catch(() => null);
      await customModal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
    }

    if (await popupQty.isVisible({ timeout: 1500 }).catch(() => false)) {
      await page.keyboard.press('Escape').catch(() => null);
    }

    await popupQty.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
    await backdrop.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
  }

  async function handleComplimentaryPopup() {
    const popup = page.locator('text=You have received a free item!');
    const awesomeBtn = page.getByRole('button', { name: 'Awesome!' });

    if (await popup.isVisible({ timeout: 1500 }).catch(() => false)) {
      await popup.click().catch(() => null);
      if (await awesomeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await awesomeBtn.click();
        await expect(awesomeBtn).toBeHidden({ timeout: 5000 }).catch(() => null);
      }
    }
  }

  // Helper: add single item
  async function addSingleItem(itemName: string, qty = 1) {
    await dismissOverlays();
    const item = page.locator(`#single-item-block li[data-item-name="${itemName}"]`).first();
    await expect(item, `Item not found in Single item list: ${itemName}`).toBeVisible({ timeout: 15_000 });
    await item.scrollIntoViewIfNeeded();

    // Shared qty modal (#add-popup-qty)
    if ((await item.getAttribute('data-target')) === '#add-popup-qty') {
      await item.click({ force: true });
      const modal = page.locator('#add-popup-qty');
      
      try {
        await expect(modal).toBeVisible({ timeout: 8_000 });
      } catch {
        await item.dispatchEvent('click');
        await expect(modal).toBeVisible({ timeout: 25_000 });
      }
      
      await expect(modal).toContainText(itemName);

      if (qty > 1) {
        const plusBtn = modal.getByRole('button', { name: '+' });
        for (let i = 1; i < qty; i++) await plusBtn.click();
      }

      await modal.getByRole('button', { name: /^(Add|Add to Order)$/ }).click();
      await expect(modal).toBeHidden({ timeout: 25_000 });
    } 
    else {
      // Item has its own popup
      const openBtn = item.locator('input.add-button-popup[data-toggle="modal"]').first();
      await expect(openBtn, `No popup trigger found for item: ${itemName}`).toHaveCount(1, { timeout: 10_000 });
      
      const target = await openBtn.getAttribute('data-target');
      if (!target) throw new Error(`Missing data-target on add button for: ${itemName}`);

      await item.hover().catch(() => null);
      
      await page.evaluate((name) => {
        const li = document.querySelector(`#single-item-block li[data-item-name="${name}"]`);
        const btn = li?.querySelector('input.add-button-popup[data-toggle="modal"]');
        (btn instanceof HTMLElement ? btn : null)?.click();
      }, itemName);

      const modal = page.locator(target);
      await expect(modal).toBeVisible({ timeout: 15_000 });
      await expect(modal).toContainText(itemName);

      const firstOptionLabel = modal.locator('.item-option-input-group label, label[for^="item-option-"]').first();
      if (await firstOptionLabel.isVisible({ timeout: 500 }).catch(() => false)) await firstOptionLabel.click();

      if (qty > 1) {
        const plusBtn = modal.locator('button.qty-btn-popup-plus').first();
        if (await plusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          for (let i = 1; i < qty; i++) await plusBtn.click();
        }
      }

      const addBtn = modal.locator('input.add-button[value="Add"], button:has-text("Add")').first();
      await expect(addBtn).toBeVisible({ timeout: 10_000 });
      await addBtn.click();
      await expect(modal).toBeHidden({ timeout: 25_000 });
    }

    // Handle complimentary item popup if it appears
    await handleComplimentaryPopup();

    await dismissOverlays();
  }

  // Add items
  await addSingleItem('Chocolate Mousse', 2);
  await addSingleItem('Chocolate Mousse Cup - Flourless', 2);
  await addSingleItem('1.1L Lemonade - Zero Sugar', 1);

  // Go to cart and checkout
  await page.locator('#show_cart').click();
  await page.getByRole('button', { name: 'CHECK OUT' }).click();
});