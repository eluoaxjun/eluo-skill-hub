/**
 * @file mock-skills.ts
 * @description 목 스킬 데이터
 *
 * 5개 직군(기획/디자인/퍼블리싱/개발/QA) 카테고리별 최소 2개 이상의
 * 스킬 데이터를 정적으로 정의한다. 테스트 및 개발용 폴백 데이터로 사용된다.
 * 프로덕션 코드에서는 실제 DB 데이터를 사용한다.
 */

import type { SkillSummary } from "../types/dashboard";

export const mockSkills: readonly SkillSummary[] = [
  // 기획 (3개)
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

  // 디자인 (2개)
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

  // 퍼블리싱 (2개)
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

  // 개발 (3개)
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

  // QA (2개)
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
] as const;
