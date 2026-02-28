import { test as setup, expect } from '@playwright/test';
import path from 'path';

const ADMIN_AUTH_FILE = path.join(
  process.cwd(),
  '.playwright',
  'admin-auth.json'
);
const USER_AUTH_FILE = path.join(
  process.cwd(),
  '.playwright',
  'user-auth.json'
);

setup('관리자 계정 인증', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('이메일').fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel('패스워드').fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: '로그인' }).click();

  // 로그인 성공 후 루트 페이지로 리다이렉트 대기
  await expect(page).toHaveURL('/', { timeout: 15000 });

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

setup('일반 사용자 계정 인증', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('이메일').fill(process.env.E2E_USER_EMAIL!);
  await page.getByLabel('패스워드').fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole('button', { name: '로그인' }).click();

  // 로그인 성공 후 루트 페이지로 리다이렉트 대기
  await expect(page).toHaveURL('/', { timeout: 15000 });

  await page.context().storageState({ path: USER_AUTH_FILE });
});
