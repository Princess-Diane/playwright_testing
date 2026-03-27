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
   
    await this.page.waitForTimeout(1000); 
  }

  async openItem(itemName: string) {
  
    const itemTitle = this.page.locator('.item-title').filter({ hasText: itemName, visible: true }).first();

    if (await itemTitle.isVisible()) {
      console.log(`Opening item via .item-title: ${itemName}`);
      await itemTitle.scrollIntoViewIfNeeded();
      await itemTitle.click();
    } 
    else {
      console.log(`Item .item-title not found. Using generic fallback for: ${itemName}`);
      
      const genericItem = this.page.locator('div, h3, span')
                              .filter({ hasText: itemName, visible: true })
                              .last(); 
      
      await genericItem.scrollIntoViewIfNeeded();
      await genericItem.waitFor({ state: 'visible', timeout: 10000 });
      await genericItem.click({ force: true });
    }
  }
}