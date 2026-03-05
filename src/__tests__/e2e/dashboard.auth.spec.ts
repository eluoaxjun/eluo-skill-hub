import { test, expect } from "@playwright/test";

test.describe("Dashboard (인증 필요)", () => {
  test("로그인 후 대시보드 페이지에 접근할 수 있다", async ({ page }) => {
    await page.goto("/dashboard");
    // 로그인 상태이므로 /signin으로 리다이렉트되지 않아야 함
    await expect(page).not.toHaveURL(/signin/);
    await expect(page).toHaveURL(/dashboard/);
  });

  test("인증된 사용자는 /signup 접근 시 /dashboard로 리다이렉트된다", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
