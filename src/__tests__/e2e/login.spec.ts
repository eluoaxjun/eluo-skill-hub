import { test, expect } from "@playwright/test";

test.describe("로그인 플로우", () => {
  test("로그인 페이지가 표시된다", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "AI 스킬 허브" })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("유효하지 않은 이메일 입력 시 인라인 에러가 표시된다", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("이메일").fill("invalid");
    await page.getByLabel("이메일").blur();
    await expect(page.getByText("올바른 이메일 형식이 아닙니다")).toBeVisible();
  });

  test("'회원가입' 링크 클릭 시 /signup으로 이동한다", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "회원가입" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});
