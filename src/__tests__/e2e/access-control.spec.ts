import { test, expect } from "@playwright/test";

test.describe("접근 제어", () => {
  test("비로그인 사용자가 /에 접근하면 랜딩 페이지가 표시된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("AI 스킬 허브")).toBeVisible();
  });

  test("비로그인 사용자가 보호 페이지에 접근하면 /login으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirectTo=/);
  });

  test.skip("로그인 사용자가 /login에 접근하면 /로 리다이렉트된다", async ({ page }) => {
    // 사전 인증된 상태 필요
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test.skip("로그인 사용자가 /signup에 접근하면 /로 리다이렉트된다", async ({ page }) => {
    // 사전 인증된 상태 필요
    await page.goto("/signup");
    await expect(page).toHaveURL("/");
  });
});
