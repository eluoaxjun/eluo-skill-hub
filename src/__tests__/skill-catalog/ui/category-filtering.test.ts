/**
 * @file category-filtering.test.ts
 * @description Task 8.2 - 카테고리별 필터링 기능을 실제 데이터 기반으로 연결하는 테스트
 *
 * useDashboardState 훅이 외부에서 주입받은 skills 데이터를 기반으로
 * 카테고리 필터링과 검색 필터링을 올바르게 수행하는지 검증한다.
 */

import { renderHook, act } from "@testing-library/react";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

// useMediaQuery 훅을 모의(mock)한다
jest.mock("@/shared/ui/hooks/use-media-query", () => ({
  useMediaQuery: jest.fn(() => false),
}));

const testSkills: SkillSummary[] = [
  {
    id: "s1",
    title: "화면설계서 자동 생성",
    category: "기획",
    createdAt: "2026-01-01T00:00:00.000Z",
    markdownFilePath: "s1.md",
  },
  {
    id: "s2",
    title: "디자인 토큰 추출",
    category: "디자인",
    createdAt: "2026-01-02T00:00:00.000Z",
    markdownFilePath: "s2.md",
  },
  {
    id: "s3",
    title: "API 스캐폴딩 생성",
    category: "개발",
    createdAt: "2026-01-03T00:00:00.000Z",
    markdownFilePath: "s3.md",
  },
  {
    id: "s4",
    title: "테스트 코드 자동 생성",
    category: "개발",
    createdAt: "2026-01-04T00:00:00.000Z",
    markdownFilePath: "s4.md",
  },
  {
    id: "s5",
    title: "반응형 레이아웃 생성",
    category: "퍼블리싱",
    createdAt: "2026-01-05T00:00:00.000Z",
    markdownFilePath: "s5.md",
  },
  {
    id: "s6",
    title: "QA 테스트 시나리오 생성",
    category: "QA",
    createdAt: "2026-01-06T00:00:00.000Z",
    markdownFilePath: "s6.md",
  },
];

describe("Task 8.2 - useDashboardState 카테고리 필터링 (실제 데이터 모델)", () => {
  it("전체 선택 시 모든 스킬을 반환한다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    expect(result.current.filteredSkills).toHaveLength(testSkills.length);
  });

  it("카테고리 선택 시 해당 카테고리의 스킬만 필터링한다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSelectedCategory("개발");
    });

    expect(result.current.filteredSkills).toHaveLength(2);
    expect(
      result.current.filteredSkills.every((s) => s.category === "개발")
    ).toBe(true);
  });

  it("기획 카테고리로 필터링할 수 있다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSelectedCategory("기획");
    });

    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].title).toBe("화면설계서 자동 생성");
  });

  it("디자인 카테고리로 필터링할 수 있다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSelectedCategory("디자인");
    });

    expect(result.current.filteredSkills).toHaveLength(1);
  });

  it("퍼블리싱 카테고리로 필터링할 수 있다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSelectedCategory("퍼블리싱");
    });

    expect(result.current.filteredSkills).toHaveLength(1);
  });

  it("QA 카테고리로 필터링할 수 있다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSelectedCategory("QA");
    });

    expect(result.current.filteredSkills).toHaveLength(1);
  });

  it("검색어로 title을 필터링한다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSearchQuery("API");
    });

    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].title).toBe("API 스캐폴딩 생성");
  });

  it("검색어는 대소문자를 무시한다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSearchQuery("api");
    });

    expect(result.current.filteredSkills).toHaveLength(1);
  });

  it("카테고리와 검색어를 동시에 적용한다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState(testSkills));

    act(() => {
      result.current.setSelectedCategory("개발");
    });
    act(() => {
      result.current.setSearchQuery("API");
    });

    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].category).toBe("개발");
    expect(result.current.filteredSkills[0].title).toContain("API");
  });

  it("빈 스킬 배열에서도 정상 동작한다", async () => {
    const { useDashboardState } = await import(
      "@/shared/ui/hooks/use-dashboard-state"
    );

    const { result } = renderHook(() => useDashboardState([]));

    expect(result.current.filteredSkills).toHaveLength(0);
  });
});
