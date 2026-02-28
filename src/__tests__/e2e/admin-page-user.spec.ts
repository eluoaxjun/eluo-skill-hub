import { test, expect } from '@playwright/test';

test.describe('어드민 페이지 - 일반 사용자 접근', () => {
  test('일반 사용자 → /admin → 접근 불가 안내 메시지', async ({ page }) => {
    await page.goto('/admin');

    // 접근 불가 안내 메시지 확인
    await expect(
      page.getByRole('heading', { name: '접근 권한이 없습니다' })
    ).toBeVisible();
    await expect(
      page.getByText('관리자만 접근할 수 있는 페이지입니다.')
    ).toBeVisible();

    // 메인으로 돌아가기 링크 확인
    await expect(
      page.getByRole('link', { name: '메인으로 돌아가기' })
    ).toBeVisible();
  });
});
