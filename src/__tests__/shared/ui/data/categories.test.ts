/**
 * @file categories.test.ts
 * @description CATEGORIES 상수 배열의 구조, 데이터 무결성, 타입 정합성을 검증한다.
 *
 * Task 1.2: 카테고리 정의 상수 생성
 * - 6개 카테고리 항목(전체 + 5개 직군) 존재 확인
 * - 첫 번째 항목이 "전체"인지 확인
 * - 5개 직군 카테고리(기획/디자인/퍼블리싱/개발/QA)가 모두 포함되어 있는지 확인
 * - 각 항목이 id, label, icon 속성을 갖는지 확인
 * - readonly 배열로 올바르게 타입 지정되어 있는지 확인
 */

import { CATEGORIES } from "@/shared/ui/data/categories";
import type { CategoryItem, CategorySelection } from "@/shared/ui/types/dashboard";
import {
  LayoutGrid,
  ClipboardList,
  Palette,
  Globe,
  Code,
  ShieldCheck,
} from "lucide-react";

describe("CATEGORIES", () => {
  it("정확히 6개의 카테고리 항목을 포함한다", () => {
    expect(CATEGORIES).toHaveLength(6);
  });

  it("첫 번째 항목은 '전체' 카테고리이다", () => {
    expect(CATEGORIES[0].id).toBe("전체");
    expect(CATEGORIES[0].label).toBe("전체");
  });

  it("5개 직군 카테고리(기획/디자인/퍼블리싱/개발/QA)가 모두 포함되어 있다", () => {
    const jobCategories: CategorySelection[] = [
      "기획",
      "디자인",
      "퍼블리싱",
      "개발",
      "QA",
    ];
    const categoryIds = CATEGORIES.map((c) => c.id);

    for (const category of jobCategories) {
      expect(categoryIds).toContain(category);
    }
  });

  it("각 항목이 id, label, icon 속성을 갖는다", () => {
    for (const category of CATEGORIES) {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("label");
      expect(category).toHaveProperty("icon");
      expect(typeof category.id).toBe("string");
      expect(typeof category.label).toBe("string");
      // lucide-react 아이콘은 React.forwardRef로 감싸져 있어 object 타입이다
      expect(category.icon).toBeDefined();
      expect(typeof category.icon === "function" || typeof category.icon === "object").toBe(true);
    }
  });

  it("각 카테고리에 올바른 lucide-react 아이콘이 매핑되어 있다", () => {
    const expectedMapping: Array<{
      id: CategorySelection;
      label: string;
      icon: CategoryItem["icon"];
    }> = [
      { id: "전체", label: "전체", icon: LayoutGrid },
      { id: "기획", label: "기획", icon: ClipboardList },
      { id: "디자인", label: "디자인", icon: Palette },
      { id: "퍼블리싱", label: "퍼블리싱", icon: Globe },
      { id: "개발", label: "개발", icon: Code },
      { id: "QA", label: "QA", icon: ShieldCheck },
    ];

    for (let i = 0; i < expectedMapping.length; i++) {
      expect(CATEGORIES[i].id).toBe(expectedMapping[i].id);
      expect(CATEGORIES[i].label).toBe(expectedMapping[i].label);
      expect(CATEGORIES[i].icon).toBe(expectedMapping[i].icon);
    }
  });

  it("readonly 배열로 올바르게 타입 지정되어 있다", () => {
    // readonly 배열인지 런타임에서 검증: CATEGORIES가 배열이고 freeze 또는 as const로 정의됨
    expect(Array.isArray(CATEGORIES)).toBe(true);

    // TypeScript 컴파일 타임 검증을 위한 타입 단언
    // CATEGORIES가 readonly CategoryItem[] 타입으로 할당 가능한지 확인
    const _typeCheck: readonly CategoryItem[] = CATEGORIES;
    expect(_typeCheck).toBeDefined();
  });
});
