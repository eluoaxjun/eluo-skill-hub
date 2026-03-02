import { test, expect } from "@playwright/test";

test.describe("Root Page - 비로그인 사용자", () => {
  test("비로그인 시 랜딩 페이지가 표시된다", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "AI 스킬 허브" })
    ).toBeVisible();
  });

  test("서비스 소개 문구가 표시된다", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("워크플로우를 자동화하는")).toBeVisible();
  });

  test("로그인 버튼이 표시되고 올바른 경로로 연결된다", async ({ page }) => {
    await page.goto("/");

    const loginLink = page.getByRole("link", { name: "로그인" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("회원가입 버튼이 표시되고 올바른 경로로 연결된다", async ({ page }) => {
    await page.goto("/");

    const signupLink = page.getByRole("link", { name: "회원가입" });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute("href", "/signup");
  });
});
