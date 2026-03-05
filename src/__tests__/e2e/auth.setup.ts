import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/signin");

  await page.getByLabel("이메일").fill(process.env.TEST_USER_EMAIL!);
  await page.locator("#password").fill(process.env.TEST_USER_PASSWORD!);
  await page.locator("form").getByRole("button", { name: "로그인" }).click();

  // 로그인 후 /dashboard로 리다이렉트될 때까지 대기
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // 인증 상태 저장
  await page.context().storageState({ path: authFile });
});
