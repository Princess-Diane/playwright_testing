import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('https://orderonline.demo.deliverit.com.au/gamma/');
  try { await page.locator('#webalert_close').click({ timeout: 3000 }); } catch {}
  try { await page.locator('#loyal_close').click({ timeout: 5000 }); } catch {}
  await page.getByRole('button', { name: 'sign in' }).click();
  await page.getByRole('textbox', { name: 'Enter your email or mobile' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}