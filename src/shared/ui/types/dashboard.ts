/**
 * @file dashboard.ts
 * @description 대시보드 공유 타입 정의
 *
 * 루트 페이지 대시보드 레이아웃에서 사용하는 모든 공유 타입을 정의한다.
 * 5개 직군(기획/디자인/퍼블리싱/개발/QA) 카테고리 기반 스킬 탐색 UI에 필요한
 * 타입, 인터페이스, 상태/액션 계약을 포함한다.
 */

import type { LucideIcon } from "lucide-react";

/** 직군 카테고리 타입 */
export type JobCategory = "기획" | "디자인" | "퍼블리싱" | "개발" | "QA";

/** 전체 포함 카테고리 선택 타입 */
export type CategorySelection = "전체" | JobCategory;

/** 카테고리 정의 항목 */
export interface CategoryItem {
  readonly id: CategorySelection;
  readonly label: string;
  readonly icon: LucideIcon;
}

/** 스킬 카드 데이터 (DB 모델 기반) */
export interface SkillSummary {
  readonly id: string;
  readonly title: string;
  readonly category: JobCategory;
  readonly createdAt: string;
  readonly markdownFilePath: string;
}

/** 대시보드 상태 */
export interface DashboardState {
  readonly selectedCategory: CategorySelection;
  readonly searchQuery: string;
  readonly isMobileMenuOpen: boolean;
  readonly isMobile: boolean;
  readonly pageTitle: string;
  readonly filteredSkills: readonly SkillSummary[];
}

/** 대시보드 상태 액션 */
export interface DashboardActions {
  setSelectedCategory: (category: CategorySelection) => void;
  setSearchQuery: (query: string) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}
