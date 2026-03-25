import { Page, expect } from '@playwright/test';

export class MenuPage {
  constructor(private page: Page) {}

  async selectCategory(categoryName: string) {
    
    const categoryLink = this.page.getByRole('link').filter({ 
        hasText: new RegExp(`^${categoryName.trim()}`, 'i') 
    }).first();

    await categoryLink.scrollIntoViewIfNeeded();
    await categoryLink.waitFor({ state: 'visible', timeout: 10000 });
    await categoryLink.click();
   
    await this.page.waitForTimeout(500); 
  }

  async openItem(itemName: string) {
    const itemCard = this.page.locator('.item-title').filter({ hasText: itemName }).first();
    await itemCard.scrollIntoViewIfNeeded();
    await itemCard.waitFor({ state: 'visible', timeout: 15000 });
    await itemCard.click();
  }
}