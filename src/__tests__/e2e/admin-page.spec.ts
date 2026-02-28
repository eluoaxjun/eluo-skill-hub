import { test, expect } from '@playwright/test';

test.describe('어드민 페이지 - 비인증 접근', () => {
  test('비인증 사용자 /admin 접근 → /login 리다이렉트', async ({ browser }) => {
    // 인증 상태 없는 새 컨텍스트 생성 (storageState 무시)
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/admin');

    // 미들웨어에 의해 /login으로 리다이렉트
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    await context.close();
  });
});

test.describe('어드민 페이지 - 관리자 접근', () => {
  test('관리자 로그인 → /admin → 대시보드 정상 렌더링', async ({ page }) => {
    await page.goto('/admin');

    // 대시보드 제목 확인
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();

    // 통계 카드 표시 확인
    await expect(page.getByText('전체 사용자')).toBeVisible();
    await expect(page.getByText('관리자', { exact: true })).toBeVisible();
    await expect(page.getByText('일반 사용자')).toBeVisible();
  });

  test('관리자 → 사용자 관리 페이지 네비게이션 → 사용자 목록 테이블 표시', async ({
    page,
  }) => {
    await page.goto('/admin');

    // 사이드바 nav 내부의 사용자 관리 링크 클릭
    await page.locator('nav').getByRole('link', { name: '사용자 관리' }).click();

    // 사용자 관리 페이지로 이동 확인
    await expect(page).toHaveURL('/admin/users');

    // 사용자 관리 제목 확인
    await expect(
      page.getByRole('heading', { name: '사용자 관리' })
    ).toBeVisible();

    // 테이블 헤더 확인
    await expect(page.getByRole('columnheader', { name: '이메일' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '역할' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '가입일' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '작업' })).toBeVisible();
  });

  test('관리자 본인 행의 역할 변경 드롭다운 비활성화 확인', async ({ page }) => {
    await page.goto('/admin/users');

    // 사용자 관리 페이지 로딩 대기
    await expect(
      page.getByRole('heading', { name: '사용자 관리' })
    ).toBeVisible();

    // 관리자 이메일이 포함된 행 찾기
    const adminRow = page.getByRole('row').filter({
      hasText: process.env.E2E_ADMIN_EMAIL!,
    });

    // 해당 행의 Select 드롭다운 trigger가 비활성화 상태인지 확인
    const roleSelect = adminRow.getByRole('combobox');
    await expect(roleSelect).toBeDisabled();
  });
});
