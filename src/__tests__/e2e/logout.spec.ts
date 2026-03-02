import { test, expect } from "@playwright/test";

test.describe("로그아웃 플로우", () => {
  // NOTE: 이 테스트는 실제 인증된 세션이 필요합니다.
  // Playwright 설정에서 storageState를 사용하여 사전 인증된 상태를 구성해야 합니다.

  test.skip("프로필 아바타 클릭 시 드롭다운이 표시된다", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("profile-avatar").click();
    await expect(page.getByText("로그아웃")).toBeVisible();
  });

  test.skip("'로그아웃' 클릭 시 확인 다이얼로그가 표시된다", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("profile-avatar").click();
    await page.getByText("로그아웃").click();
    await expect(page.getByText("정말 로그아웃하시겠습니까?")).toBeVisible();
  });

  test.skip("'취소' 클릭 시 다이얼로그가 닫힌다", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("profile-avatar").click();
    await page.getByText("로그아웃").click();
    await page.getByRole("button", { name: "취소" }).click();
    await expect(page.getByText("정말 로그아웃하시겠습니까?")).not.toBeVisible();
  });
});
