/**
 * @file dashboard.test.ts
 * @description 대시보드 공유 타입 정의에 대한 컴파일 타임 + 런타임 타입 검증 테스트
 *
 * 모든 타입이 올바르게 정의되고 export 되는지 검증한다.
 */

import type { LucideIcon } from "lucide-react";
import { Circle } from "lucide-react";

import type {
  JobCategory,
  CategorySelection,
  CategoryItem,
  SkillSummary,
  DashboardState,
  DashboardActions,
} from "@/shared/ui/types/dashboard";

describe("Dashboard 공유 타입 정의", () => {
  describe("JobCategory", () => {
    it("5개 직군 카테고리 값을 허용해야 한다", () => {
      const planning: JobCategory = "기획";
      const design: JobCategory = "디자인";
      const publishing: JobCategory = "퍼블리싱";
      const development: JobCategory = "개발";
      const qa: JobCategory = "QA";

      expect(planning).toBe("기획");
      expect(design).toBe("디자인");
      expect(publishing).toBe("퍼블리싱");
      expect(development).toBe("개발");
      expect(qa).toBe("QA");
    });
  });

  describe("CategorySelection", () => {
    it('"전체"와 JobCategory 값을 모두 허용해야 한다', () => {
      const all: CategorySelection = "전체";
      const category: CategorySelection = "기획";

      expect(all).toBe("전체");
      expect(category).toBe("기획");
    });
  });

  describe("CategoryItem", () => {
    it("id, label, icon 속성을 가져야 한다", () => {
      const item: CategoryItem = {
        id: "전체",
        label: "전체",
        icon: Circle,
      };

      expect(item.id).toBe("전체");
      expect(item.label).toBe("전체");
      expect(item.icon).toBe(Circle);
    });

    it("id는 CategorySelection 타입이어야 한다", () => {
      const item: CategoryItem = {
        id: "개발",
        label: "개발",
        icon: Circle,
      };

      expect(item.id).toBe("개발");
    });

    it("icon은 LucideIcon 타입이어야 한다", () => {
      const iconRef: LucideIcon = Circle;
      const item: CategoryItem = {
        id: "QA",
        label: "QA",
        icon: iconRef,
      };

      expect(item.icon).toBe(Circle);
    });
  });

  describe("SkillSummary", () => {
    it("id, title, category, createdAt, markdownFilePath 속성을 가져야 한다", () => {
      const skill: SkillSummary = {
        id: "skill-1",
        title: "테스트 스킬",
        category: "개발",
        createdAt: "2026-01-01T00:00:00.000Z",
        markdownFilePath: "test.md",
      };

      expect(skill.id).toBe("skill-1");
      expect(skill.title).toBe("테스트 스킬");
      expect(skill.category).toBe("개발");
      expect(skill.createdAt).toBe("2026-01-01T00:00:00.000Z");
      expect(skill.markdownFilePath).toBe("test.md");
    });

    it("category는 JobCategory 타입이어야 한다", () => {
      const skill: SkillSummary = {
        id: "skill-2",
        title: "디자인 스킬",
        category: "디자인",
        createdAt: "2026-01-01T00:00:00.000Z",
        markdownFilePath: "design.md",
      };

      expect(skill.category).toBe("디자인");
    });
  });

  describe("DashboardState", () => {
    it("모든 상태 속성을 가져야 한다", () => {
      const mockSkills: readonly SkillSummary[] = [
        {
          id: "1",
          title: "스킬1",
          category: "개발",
          createdAt: "2026-01-01T00:00:00.000Z",
          markdownFilePath: "1.md",
        },
      ];

      const state: DashboardState = {
        selectedCategory: "전체",
        searchQuery: "",
        isMobileMenuOpen: false,
        isMobile: false,
        pageTitle: "대시보드",
        filteredSkills: mockSkills,
      };

      expect(state.selectedCategory).toBe("전체");
      expect(state.searchQuery).toBe("");
      expect(state.isMobileMenuOpen).toBe(false);
      expect(state.isMobile).toBe(false);
      expect(state.pageTitle).toBe("대시보드");
      expect(state.filteredSkills).toHaveLength(1);
    });

    it("selectedCategory는 CategorySelection 타입이어야 한다", () => {
      const state: DashboardState = {
        selectedCategory: "디자인",
        searchQuery: "검색어",
        isMobileMenuOpen: true,
        isMobile: true,
        pageTitle: "디자인",
        filteredSkills: [],
      };

      expect(state.selectedCategory).toBe("디자인");
    });

    it("filteredSkills는 readonly SkillSummary[] 타입이어야 한다", () => {
      const skills: readonly SkillSummary[] = [];
      const state: DashboardState = {
        selectedCategory: "전체",
        searchQuery: "",
        isMobileMenuOpen: false,
        isMobile: false,
        pageTitle: "대시보드",
        filteredSkills: skills,
      };

      expect(state.filteredSkills).toEqual([]);
    });
  });

  describe("DashboardActions", () => {
    it("4개의 액션 함수를 가져야 한다", () => {
      const actions: DashboardActions = {
        setSelectedCategory: (_category: CategorySelection) => {},
        setSearchQuery: (_query: string) => {},
        toggleMobileMenu: () => {},
        closeMobileMenu: () => {},
      };

      expect(typeof actions.setSelectedCategory).toBe("function");
      expect(typeof actions.setSearchQuery).toBe("function");
      expect(typeof actions.toggleMobileMenu).toBe("function");
      expect(typeof actions.closeMobileMenu).toBe("function");
    });

    it("setSelectedCategory는 CategorySelection을 인자로 받아야 한다", () => {
      let captured: CategorySelection | undefined;
      const actions: DashboardActions = {
        setSelectedCategory: (category: CategorySelection) => {
          captured = category;
        },
        setSearchQuery: () => {},
        toggleMobileMenu: () => {},
        closeMobileMenu: () => {},
      };

      actions.setSelectedCategory("QA");
      expect(captured).toBe("QA");
    });

    it("setSearchQuery는 string을 인자로 받아야 한다", () => {
      let captured: string | undefined;
      const actions: DashboardActions = {
        setSelectedCategory: () => {},
        setSearchQuery: (query: string) => {
          captured = query;
        },
        toggleMobileMenu: () => {},
        closeMobileMenu: () => {},
      };

      actions.setSearchQuery("검색어");
      expect(captured).toBe("검색어");
    });

    it("toggleMobileMenu와 closeMobileMenu는 인자 없이 호출 가능해야 한다", () => {
      let toggleCalled = false;
      let closeCalled = false;

      const actions: DashboardActions = {
        setSelectedCategory: () => {},
        setSearchQuery: () => {},
        toggleMobileMenu: () => {
          toggleCalled = true;
        },
        closeMobileMenu: () => {
          closeCalled = true;
        },
      };

      actions.toggleMobileMenu();
      actions.closeMobileMenu();

      expect(toggleCalled).toBe(true);
      expect(closeCalled).toBe(true);
    });
  });
});
