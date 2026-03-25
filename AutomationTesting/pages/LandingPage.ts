import { Page, expect } from '@playwright/test';

export class LandingPage {
  constructor(private page: Page) {}

  async enterTableAndStart(tableNum: string) {
    const tableInput = this.page.getByRole('textbox', { name: 'Table Number' });
    await tableInput.fill(tableNum);
    await this.page.keyboard.press('Enter');

    const startBtn = this.page.locator('#table-btn');
    await expect(startBtn).toBeEnabled({ timeout: 10000 });
    await startBtn.tap();

    await this.page.waitForURL('**/table-menu/**', { timeout: 30000 });
    await this.page.waitForLoadState('networkidle');
  }
}