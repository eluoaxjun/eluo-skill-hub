import { test, expect } from "@playwright/test";

test.describe("회원가입 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("페이지가 정상 로드된다", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: "회원가입" })).toBeVisible();
  });

  test("이메일, 비밀번호 입력 필드와 회원가입 버튼이 표시된다", async ({ page }) => {
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "회원가입" })).toBeVisible();
  });

  test("로그인 페이지 링크가 표시된다", async ({ page }) => {
    const loginLink = page.locator("form ~ div").getByRole("link", { name: "로그인" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/signin");
  });

  test("이메일을 입력하지 않으면 필수 입력 오류가 표시된다", async ({ page }) => {
    await page.getByRole("button", { name: "회원가입" }).click();
    await expect(page.getByText("이메일을 입력해 주세요")).toBeVisible();
  });

  test("eluocnc.com 외 도메인 이메일 입력 시 도메인 오류가 표시된다", async ({
    page,
  }) => {
    await page.getByLabel("이메일").fill("test@gmail.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: "회원가입" }).click();
    await expect(
      page.getByText("eluocnc.com 이메일만 사용할 수 있습니다")
    ).toBeVisible();
  });

  test("비밀번호가 8자 미만이면 길이 오류가 표시된다", async ({ page }) => {
    await page.getByLabel("이메일").fill("test@eluocnc.com");
    await page.locator("#password").fill("1234567");
    await page.getByRole("button", { name: "회원가입" }).click();
    await expect(
      page.getByText("비밀번호는 최소 8자 이상이어야 합니다")
    ).toBeVisible();
  });

  test("로그인 링크 클릭 시 /signin 페이지로 이동한다", async ({ page }) => {
    await page.locator("form ~ div").getByRole("link", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("비인증 사용자는 /signup 페이지에 접근할 수 있다", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/signup/);
  });
});
