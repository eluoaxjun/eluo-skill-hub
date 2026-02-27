/**
 * @file categories.ts
 * @description 대시보드 사이드바 카테고리 정의 상수
 *
 * 5개 직군(기획/디자인/퍼블리싱/개발/QA)과 "전체" 카테고리를 포함하는
 * 불변 배열을 정의한다. 각 카테고리에 lucide-react 아이콘을 매핑한다.
 */

import {
  LayoutGrid,
  ClipboardList,
  Palette,
  Globe,
  Code,
  ShieldCheck,
} from "lucide-react";
import type { CategoryItem } from "../types/dashboard";

export const CATEGORIES: readonly CategoryItem[] = [
  { id: "전체", label: "전체", icon: LayoutGrid },
  { id: "기획", label: "기획", icon: ClipboardList },
  { id: "디자인", label: "디자인", icon: Palette },
  { id: "퍼블리싱", label: "퍼블리싱", icon: Globe },
  { id: "개발", label: "개발", icon: Code },
  { id: "QA", label: "QA", icon: ShieldCheck },
] as const;
