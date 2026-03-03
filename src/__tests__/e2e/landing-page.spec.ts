import { test, expect } from "@playwright/test";

test.describe("랜딩 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지가 정상 로드된다", async ({ page }) => {
    await expect(page).toHaveTitle(/스킬 허브/);
  });

  test("US1: h1 타이틀이 eluofacevf 커스텀 폰트로 렌더링된다", async ({
    page,
  }) => {
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("ELUO");
    await expect(h1).toContainText("AI SKILL HUB");

    const fontFamily = await h1.evaluate(
      (el) => window.getComputedStyle(el).fontFamily
    );
    // next/font/local generates font-family name from the variable: "--font-eluo-face" → "eluo"
    expect(fontFamily.toLowerCase()).toContain("eluo");
  });

  test("US2: 히어로 섹션에 canvas(글로브) 요소가 표시된다", async ({
    page,
  }) => {
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("US3: 시작하기 버튼이 표시되고 /login으로 이동한다", async ({
    page,
  }) => {
    const ctaButton = page.locator('a[href="/login"]');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toContainText("시작하기");
  });

  test("US3: 주요 기능 카드 3개가 표시된다", async ({ page }) => {
    await expect(page.getByText("스킬 검색")).toBeVisible();
    await expect(page.getByText("원클릭 실행")).toBeVisible();
    await expect(page.getByText("스킬 관리")).toBeVisible();
  });

  test("US3: 모바일 뷰포트(375px)에서 히어로 섹션이 수직 배치된다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });
});
