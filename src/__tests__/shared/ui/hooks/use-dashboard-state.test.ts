import { renderHook, act } from "@testing-library/react";
import { useDashboardState } from "@/shared/ui/hooks/use-dashboard-state";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

// useMediaQuery 훅을 모의(mock)한다
jest.mock("@/shared/ui/hooks/use-media-query", () => ({
  useMediaQuery: jest.fn(() => false),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useMediaQuery } = require("@/shared/ui/hooks/use-media-query");

const testSkills: readonly SkillSummary[] = [
  {
    id: "1",
    title: "화면설계서 자동 생성",
    category: "기획",
    createdAt: "2026-01-01T00:00:00.000Z",
    markdownFilePath: "1.md",
  },
  {
    id: "2",
    title: "요구사항 정의서 작성",
    category: "기획",
    createdAt: "2026-01-02T00:00:00.000Z",
    markdownFilePath: "2.md",
  },
  {
    id: "3",
    title: "사용자 플로우 다이어그램",
    category: "기획",
    createdAt: "2026-01-03T00:00:00.000Z",
    markdownFilePath: "3.md",
  },
  {
    id: "4",
    title: "디자인 토큰 추출",
    category: "디자인",
    createdAt: "2026-01-04T00:00:00.000Z",
    markdownFilePath: "4.md",
  },
  {
    id: "5",
    title: "컴포넌트 명세서 생성",
    category: "디자인",
    createdAt: "2026-01-05T00:00:00.000Z",
    markdownFilePath: "5.md",
  },
  {
    id: "6",
    title: "반응형 레이아웃 생성",
    category: "퍼블리싱",
    createdAt: "2026-01-06T00:00:00.000Z",
    markdownFilePath: "6.md",
  },
  {
    id: "7",
    title: "크로스브라우저 검증",
    category: "퍼블리싱",
    createdAt: "2026-01-07T00:00:00.000Z",
    markdownFilePath: "7.md",
  },
  {
    id: "8",
    title: "API 스캐폴딩 생성",
    category: "개발",
    createdAt: "2026-01-08T00:00:00.000Z",
    markdownFilePath: "8.md",
  },
  {
    id: "9",
    title: "테스트 코드 자동 생성",
    category: "개발",
    createdAt: "2026-01-09T00:00:00.000Z",
    markdownFilePath: "9.md",
  },
  {
    id: "10",
    title: "코드 리뷰 자동화",
    category: "개발",
    createdAt: "2026-01-10T00:00:00.000Z",
    markdownFilePath: "10.md",
  },
  {
    id: "11",
    title: "테스트 시나리오 생성",
    category: "QA",
    createdAt: "2026-01-11T00:00:00.000Z",
    markdownFilePath: "11.md",
  },
  {
    id: "12",
    title: "버그 리포트 자동 작성",
    category: "QA",
    createdAt: "2026-01-12T00:00:00.000Z",
    markdownFilePath: "12.md",
  },
];

describe("useDashboardState", () => {
  beforeEach(() => {
    // 기본값: 데스크톱 모드 (isMobile = false)
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("초기 상태", () => {
    it('selectedCategory 초기값이 "전체"이다', () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.selectedCategory).toBe("전체");
    });

    it('searchQuery 초기값이 ""이다', () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.searchQuery).toBe("");
    });

    it("isMobileMenuOpen 초기값이 false이다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.isMobileMenuOpen).toBe(false);
    });
  });

  describe("pageTitle 파생 상태", () => {
    it('"전체" 선택 시 pageTitle이 "대시보드"이다', () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.pageTitle).toBe("대시보드");
    });

    it("카테고리 선택 시 pageTitle이 해당 카테고리명으로 변경된다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      act(() => {
        result.current.setSelectedCategory("기획");
      });

      expect(result.current.pageTitle).toBe("기획");
    });
  });

  describe("filteredSkills 파생 상태", () => {
    it('"전체" 선택 시 모든 스킬을 반환한다', () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.filteredSkills).toHaveLength(testSkills.length);
    });

    it("카테고리 선택 시 해당 카테고리의 스킬만 필터링한다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      act(() => {
        result.current.setSelectedCategory("기획");
      });

      const expectedCount = testSkills.filter(
        (s) => s.category === "기획"
      ).length;
      expect(result.current.filteredSkills).toHaveLength(expectedCount);
      expect(
        result.current.filteredSkills.every((s) => s.category === "기획")
      ).toBe(true);
    });

    it("검색어로 스킬 제목을 대소문자 무시 부분 일치 필터링한다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      act(() => {
        result.current.setSearchQuery("API");
      });

      // "API 스캐폴딩 생성" 스킬이 매칭되어야 한다
      expect(result.current.filteredSkills.length).toBeGreaterThan(0);
      expect(
        result.current.filteredSkills.some((s) =>
          s.title.toLowerCase().includes("api")
        )
      ).toBe(true);
    });

    it("검색어로 스킬 제목을 부분 일치 필터링한다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      act(() => {
        result.current.setSearchQuery("디자인");
      });

      // 디자인 관련 제목을 가진 스킬이 매칭되어야 한다
      expect(result.current.filteredSkills.length).toBeGreaterThan(0);
      expect(
        result.current.filteredSkills.some((s) =>
          s.title.toLowerCase().includes("디자인")
        )
      ).toBe(true);
    });

    it("카테고리와 검색어를 결합하여 필터링한다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      act(() => {
        result.current.setSelectedCategory("개발");
      });

      act(() => {
        result.current.setSearchQuery("API");
      });

      // "개발" 카테고리 AND "API" 검색어에 매칭되는 스킬만 반환
      expect(result.current.filteredSkills.length).toBeGreaterThan(0);
      expect(
        result.current.filteredSkills.every((s) => s.category === "개발")
      ).toBe(true);
      expect(
        result.current.filteredSkills.every((s) =>
          s.title.toLowerCase().includes("api")
        )
      ).toBe(true);
    });
  });

  describe("모바일 메뉴 동작", () => {
    it("toggleMobileMenu 호출 시 isMobileMenuOpen이 토글된다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.isMobileMenuOpen).toBe(false);

      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(true);

      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(false);
    });

    it("closeMobileMenu 호출 시 isMobileMenuOpen이 false로 설정된다", () => {
      const { result } = renderHook(() => useDashboardState(testSkills));

      // 먼저 메뉴를 연다
      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(true);

      act(() => {
        result.current.closeMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(false);
    });

    it("데스크톱으로 전환 시 모바일 메뉴가 자동으로 닫힌다", () => {
      // 모바일 모드로 시작
      (useMediaQuery as jest.Mock).mockReturnValue(true);

      const { result, rerender } = renderHook(() =>
        useDashboardState(testSkills)
      );

      // 모바일 메뉴를 연다
      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(true);

      // 데스크톱으로 전환
      (useMediaQuery as jest.Mock).mockReturnValue(false);

      rerender();

      expect(result.current.isMobileMenuOpen).toBe(false);
    });
  });

  describe("isMobile 상태", () => {
    it("useMediaQuery가 false를 반환하면 isMobile이 false이다", () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.isMobile).toBe(false);
    });

    it("useMediaQuery가 true를 반환하면 isMobile이 true이다", () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useDashboardState(testSkills));

      expect(result.current.isMobile).toBe(true);
    });
  });
});
