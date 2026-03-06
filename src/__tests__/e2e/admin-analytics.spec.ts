import { test, expect } from '@playwright/test';

test.describe('Admin Analytics Page', () => {
  test('통계분석 페이지에 접근하면 주요 섹션이 표시된다', async ({ page }) => {
    await page.goto('/admin/analytics');

    // 페이지 제목 확인
    await expect(page.getByText('통계분석')).toBeVisible();

    // 기간 필터 프리셋 버튼 확인
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '7일' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30일' })).toBeVisible();

    // 요약 카드 3개 확인
    await expect(page.getByText('활성 사용자')).toBeVisible();
    await expect(page.getByText('스킬 조회')).toBeVisible();
    await expect(page.getByText('템플릿 다운로드')).toBeVisible();
  });

  test('기간 필터 변경 시 데이터가 갱신된다', async ({ page }) => {
    await page.goto('/admin/analytics');

    // 30일 버튼 클릭
    await page.getByRole('button', { name: '30일' }).click();

    // URL이 변경되었는지 확인
    await expect(page).toHaveURL(/preset=30d/);

    // 요약 카드가 여전히 표시되는지 확인
    await expect(page.getByText('활성 사용자')).toBeVisible();
  });

  test('일별 추이 차트 섹션이 표시된다', async ({ page }) => {
    await page.goto('/admin/analytics');

    await expect(page.getByText('일별 추이')).toBeVisible();
  });

  test('스킬 랭킹 테이블이 표시된다', async ({ page }) => {
    await page.goto('/admin/analytics');

    await expect(page.getByText('스킬 인기도 순위')).toBeVisible();
  });
});
