import { test, expect } from "@playwright/test";

test.describe("회원가입 플로우", () => {
  test("회원가입 페이지가 표시된다", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "AI 스킬 허브" })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호", { exact: true })).toBeVisible();
    await expect(page.getByLabel("비밀번호 확인")).toBeVisible();
    await expect(page.getByRole("button", { name: "회원가입" })).toBeVisible();
  });

  test("eluocnc.com 외 도메인 이메일 입력 시 인라인 에러가 표시된다", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("이메일").fill("user@gmail.com");
    await page.getByLabel("이메일").blur();
    await expect(page.getByText("eluocnc.com 이메일만 사용할 수 있습니다")).toBeVisible();
  });

  test("유효하지 않은 비밀번호 입력 시 인라인 에러가 표시된다", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("비밀번호", { exact: true }).fill("short");
    await page.getByLabel("비밀번호", { exact: true }).blur();
    await expect(page.getByText("비밀번호는 8자 이상이어야 합니다")).toBeVisible();
  });

  test("'로그인' 링크 클릭 시 /login으로 이동한다", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
