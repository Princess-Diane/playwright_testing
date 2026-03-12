import { test, expect } from '@playwright/test';

test('Add multiple items dynamically', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('https://orderonline.demo.deliverit.com.au/gamma/');
  await page.waitForLoadState('domcontentloaded');
  page.on('dialog', (d) => d.accept().catch(() => null));

  try {
    const bannerClose = page.locator('#webalert_close');
    await bannerClose.waitFor({ state: 'visible', timeout: 3000 });
    await bannerClose.click();
    await page.locator('#webalert_container').waitFor({ state: 'hidden' });
  } catch {
   
  }

  // Scroll to menu section before adding items
  await page.locator('#single-item-block').scrollIntoViewIfNeeded();

  async function dismissOverlays() {
    const popupQty = page.locator('#add-popup-qty');
    const backdrop = page.locator('.modal-backdrop');
    const customModal = page.locator('.custom-modal-overlay').first();

    // Close custom modals if present.
    if (await customModal.isVisible({ timeout: 500 }).catch(() => false)) {
      const primaryBtn = customModal.getByRole('button', { name: /ok|close|continue|cancel/i }).first();
      if (await primaryBtn.isVisible({ timeout: 500 }).catch(() => false)) await primaryBtn.click();
      else await page.keyboard.press('Escape').catch(() => null);
      await customModal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
    }

    if (await popupQty.isVisible({ timeout: 500 }).catch(() => false)) {
      await page.keyboard.press('Escape').catch(() => null);
    }

    await popupQty.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
    await backdrop.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
  }

  async function addSingleItem(itemName: string, qty = 1) {
    await dismissOverlays();
    const item = page.locator(`#single-item-block li[data-item-name="${itemName}"]`).first();
    await expect(item, `Item not found in Single item list: ${itemName}`).toBeVisible({ timeout: 15_000 });
    await item.scrollIntoViewIfNeeded();

    // item uses the shared qty modal (#add-popup-qty)
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
      // item has its own popup trigger inside the card (input.add-button-popup)
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

    // complimentary item popup.
    const okBtn = page.getByRole('button', { name: 'OK', exact: true });
    const awesomeBtn = page.getByRole('button', { name: 'Awesome!', exact: true });
    const postAddPopupBtn = okBtn.or(awesomeBtn).first();

    if (await postAddPopupBtn.isVisible({ timeout: 3500 }).catch(() => false)) {
      await postAddPopupBtn.click();
      // Ensure the popup goes away before continuing
      await expect(postAddPopupBtn).toBeHidden({ timeout: 5000 }).catch(() => null);
    }

    await dismissOverlays();
  }

  // Add the items
  await addSingleItem('Chocolate Mousse', 2);
  await addSingleItem('Chocolate Mousse Cup - Flourless', 2);
  await addSingleItem('1.1L Lemonade - Zero Sugar', 1);

  // Go to cart
  await page.locator('#show_cart').click();
  await page.getByRole('button', { name: 'CHECK OUT' }).click();
});