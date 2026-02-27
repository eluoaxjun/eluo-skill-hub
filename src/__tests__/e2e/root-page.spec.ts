import { test, expect } from "@playwright/test";

test.describe("루트 페이지 대시보드", () => {
  test("카테고리 선택 시 스킬 필터링 및 제목 변경", async ({ page }) => {
    await page.goto("/");

    // 기본 상태 확인: 제목이 "대시보드"
    const pageTitle = page.locator("header h2");
    await expect(pageTitle).toHaveText("대시보드");

    // 히어로 섹션이 표시되는지 확인 (전체 카테고리 기본 상태)
    await expect(
      page.getByText("Eluo Skill Hub에 오신 것을 환영합니다")
    ).toBeVisible();

    // 사이드바에서 "개발" 카테고리 클릭
    const sidebar = page.locator('nav[aria-label="메인 내비게이션"]');
    await sidebar.getByRole("button", { name: "개발" }).click();

    // 페이지 제목이 "개발"로 변경되었는지 확인
    await expect(pageTitle).toHaveText("개발");

    // 히어로 섹션이 사라졌는지 확인
    await expect(
      page.getByText("Eluo Skill Hub에 오신 것을 환영합니다")
    ).not.toBeVisible();

    // "개발" 카테고리 스킬만 표시되는지 확인
    // 개발 카테고리 스킬: "API 스캐폴딩 생성", "테스트 코드 자동 생성", "코드 리뷰 자동화"
    await expect(page.getByText("API 스캐폴딩 생성")).toBeVisible();
    await expect(page.getByText("테스트 코드 자동 생성")).toBeVisible();
    await expect(page.getByText("코드 리뷰 자동화")).toBeVisible();

    // 다른 카테고리 스킬은 표시되지 않는지 확인
    await expect(page.getByText("디자인 토큰 추출")).not.toBeVisible();
    await expect(page.getByText("테스트 시나리오 생성")).not.toBeVisible();

    // "전체" 카테고리 클릭
    await sidebar.getByRole("button", { name: "전체" }).click();

    // 제목이 "대시보드"로 복원되었는지 확인
    await expect(pageTitle).toHaveText("대시보드");

    // 히어로 섹션이 다시 표시되는지 확인
    await expect(
      page.getByText("Eluo Skill Hub에 오신 것을 환영합니다")
    ).toBeVisible();

    // 모든 스킬이 다시 표시되는지 확인
    await expect(page.getByText("API 스캐폴딩 생성")).toBeVisible();
    await expect(page.getByText("디자인 토큰 추출")).toBeVisible();
    await expect(page.getByText("테스트 시나리오 생성")).toBeVisible();
  });

  test("모바일에서 햄버거 메뉴 -> 사이드바 오버레이 -> 외부 클릭 닫기", async ({
    page,
  }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const sidebar = page.locator('nav[aria-label="메인 내비게이션"]');

    // 사이드바가 화면 밖으로 숨겨져 있는지 확인 (translate-x로 숨김)
    await expect(sidebar).toHaveClass(/-translate-x-full/);

    // 오버레이가 보이지 않는지 확인
    const overlay = page.locator('[data-testid="mobile-overlay"]');
    await expect(overlay).not.toBeVisible();

    // 햄버거 메뉴 버튼 클릭
    const menuButton = page.getByRole("button", { name: "메뉴 열기" });
    await menuButton.click();

    // 사이드바가 화면에 표시되는지 확인 (translate-x-0)
    await expect(sidebar).toHaveClass(/translate-x-0/);
    await expect(sidebar).not.toHaveClass(/-translate-x-full/);

    // 오버레이가 표시되는지 확인
    await expect(overlay).toBeVisible();

    // 오버레이 영역 클릭 (사이드바 외부)
    await overlay.click();

    // 사이드바가 다시 숨겨졌는지 확인
    await expect(sidebar).toHaveClass(/-translate-x-full/);

    // 오버레이가 다시 사라졌는지 확인
    await expect(overlay).not.toBeVisible();
  });

  test("다크/라이트 모드 전환 및 유지", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");

    // 초기 테마 확인 (defaultTheme="dark"이므로 dark 클래스가 있을 수 있음)
    const initialTheme = await html.getAttribute("class");
    const isDarkInitially = initialTheme?.includes("dark") ?? false;

    // 테마 전환 토글 버튼 클릭
    const themeToggle = page.getByRole("button", { name: "테마 전환" });
    await themeToggle.click();

    // 테마가 전환되었는지 확인
    if (isDarkInitially) {
      // dark -> light: dark 클래스가 제거되고 light 클래스가 추가됨
      await expect(html).toHaveClass(/light/);
    } else {
      // light -> dark: dark 클래스가 추가됨
      await expect(html).toHaveClass(/dark/);
    }

    // 현재 전환된 테마 저장
    const toggledTheme = await html.getAttribute("class");

    // 페이지 새로고침
    await page.reload();

    // 새로고침 후에도 테마가 유지되는지 확인
    const afterReloadTheme = await html.getAttribute("class");
    const toggledHasDark = toggledTheme?.includes("dark") ?? false;
    const reloadHasDark = afterReloadTheme?.includes("dark") ?? false;
    expect(toggledHasDark).toBe(reloadHasDark);
  });
});
