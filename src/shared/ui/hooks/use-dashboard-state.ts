import { useState, useMemo, useEffect, useCallback } from "react";
import { useMediaQuery } from "./use-media-query";
import { mockSkills } from "../data/mock-skills";
import type {
  DashboardState,
  DashboardActions,
  CategorySelection,
} from "../types/dashboard";

/**
 * 대시보드 레이아웃의 모든 클라이언트 상태를 관리하고, 파생 상태(pageTitle, filteredSkills)를 계산한다.
 *
 * - selectedCategory, searchQuery, isMobileMenuOpen 3개의 원시 상태를 관리한다
 * - pageTitle을 selectedCategory로부터 파생한다 ("전체" -> "대시보드", 그 외 -> 카테고리명)
 * - filteredSkills를 selectedCategory와 searchQuery로부터 useMemo로 계산한다
 * - useMediaQuery를 사용하여 isMobile 상태를 판별한다
 * - 데스크톱으로 전환 시 isMobileMenuOpen을 자동으로 false로 설정한다
 *
 * @returns DashboardState & DashboardActions
 */
export function useDashboardState(): DashboardState & DashboardActions {
  const [selectedCategory, setSelectedCategory] =
    useState<CategorySelection>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const pageTitle =
    selectedCategory === "전체" ? "대시보드" : selectedCategory;

  const filteredSkills = useMemo(() => {
    let result = [...mockSkills];

    if (selectedCategory !== "전체") {
      result = result.filter((skill) => skill.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  // 데스크톱으로 전환 시 모바일 메뉴를 자동으로 닫는다
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return {
    selectedCategory,
    searchQuery,
    isMobileMenuOpen,
    isMobile,
    pageTitle,
    filteredSkills,
    setSelectedCategory,
    setSearchQuery,
    toggleMobileMenu,
    closeMobileMenu,
  };
}
