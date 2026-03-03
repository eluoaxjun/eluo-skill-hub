import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// 성능 테스트 헬퍼: CLS(Cumulative Layout Shift) 측정
// ─────────────────────────────────────────────────────────────────────────────
async function measureCLS(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      // 페이지 안정화 대기 후 측정값 반환
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 2000);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// US1: 로그인 페이지 빠른 진입
// ─────────────────────────────────────────────────────────────────────────────
test.describe("US1: 로그인 페이지 성능", () => {
  test("로그인 페이지 TTI ≤ 2000ms — 이메일 필드가 2초 이내에 인터랙션 가능해야 한다", async ({
    page,
  }) => {
    const start = Date.now();
    await page.goto("/login");
    await page.waitForSelector('input[name="email"]', { state: "visible" });
    const elapsed = Date.now() - start;

    expect(elapsed, `이메일 필드 표시까지 ${elapsed}ms 소요 (목표: 2000ms 이하)`).toBeLessThanOrEqual(2000);
  });

  test("로그인 페이지 CLS < 0.1 — 레이아웃 이동이 허용 범위 이내여야 한다", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForSelector('input[name="email"]', { state: "visible" });

    const cls = await measureCLS(page);
    expect(cls, `CLS 점수 ${cls.toFixed(3)} (목표: 0.1 미만)`).toBeLessThan(0.1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US2: 회원가입 페이지 빠른 진입
// ─────────────────────────────────────────────────────────────────────────────
test.describe("US2: 회원가입 페이지 성능", () => {
  test("회원가입 페이지 TTI ≤ 2000ms — 이메일 필드가 2초 이내에 인터랙션 가능해야 한다", async ({
    page,
  }) => {
    const start = Date.now();
    await page.goto("/signup");
    await page.waitForSelector('input[name="email"]', { state: "visible" });
    const elapsed = Date.now() - start;

    expect(elapsed, `이메일 필드 표시까지 ${elapsed}ms 소요 (목표: 2000ms 이하)`).toBeLessThanOrEqual(2000);
  });

  test("회원가입 페이지 CLS < 0.1 — 레이아웃 이동이 허용 범위 이내여야 한다", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.waitForSelector('input[name="email"]', { state: "visible" });

    const cls = await measureCLS(page);
    expect(cls, `CLS 점수 ${cls.toFixed(3)} (목표: 0.1 미만)`).toBeLessThan(0.1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US3: 인증 페이지 간 원활한 이동
// ─────────────────────────────────────────────────────────────────────────────
test.describe("US3: 인증 페이지 간 전환 성능", () => {
  test("로그인 → 회원가입 전환 ≤ 1000ms — 링크 클릭 후 폼이 1초 이내에 표시되어야 한다", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForSelector('input[name="email"]', { state: "visible" });

    const start = Date.now();
    await page.getByRole("link", { name: "회원가입" }).click();
    await page.waitForSelector('input[name="email"]', { state: "visible" });
    const elapsed = Date.now() - start;

    await expect(page).toHaveURL(/\/signup/);
    expect(elapsed, `회원가입 폼 표시까지 ${elapsed}ms 소요 (목표: 1000ms 이하)`).toBeLessThanOrEqual(1000);
  });

  test("회원가입 → 로그인 전환 ≤ 1000ms — 링크 클릭 후 폼이 1초 이내에 표시되어야 한다", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.waitForSelector('input[name="email"]', { state: "visible" });

    const start = Date.now();
    await page.getByRole("link", { name: "로그인" }).click();
    await page.waitForSelector('input[name="email"]', { state: "visible" });
    const elapsed = Date.now() - start;

    await expect(page).toHaveURL(/\/login/);
    expect(elapsed, `로그인 폼 표시까지 ${elapsed}ms 소요 (목표: 1000ms 이하)`).toBeLessThanOrEqual(1000);
  });
});
