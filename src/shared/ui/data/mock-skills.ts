/**
 * @file mock-skills.ts
 * @description 목 스킬 데이터
 *
 * 5개 직군(기획/디자인/퍼블리싱/개발/QA) 카테고리별 최소 2개 이상의
 * 스킬 데이터를 정적으로 정의한다. 향후 Supabase 데이터 연동 시 교체된다.
 */

import type { SkillSummary } from "../types/dashboard";

export const mockSkills: readonly SkillSummary[] = [
  // 기획 (3개)
  {
    id: "1",
    name: "화면설계서 자동 생성",
    description:
      "피그마 디자인을 기반으로 화면설계서를 자동으로 생성합니다.",
    category: "기획",
    tags: ["화면설계", "피그마", "문서화"],
    icon: "📋",
  },
  {
    id: "2",
    name: "요구사항 정의서 작성",
    description:
      "프로젝트 브리핑 문서를 분석하여 요구사항 정의서를 자동 작성합니다.",
    category: "기획",
    tags: ["요구사항", "PRD", "문서화"],
    icon: "📝",
  },
  {
    id: "3",
    name: "사용자 플로우 다이어그램",
    description:
      "화면 구조를 분석하여 사용자 플로우 다이어그램을 자동 생성합니다.",
    category: "기획",
    tags: ["플로우", "UX", "다이어그램"],
    icon: "🔀",
  },

  // 디자인 (2개)
  {
    id: "4",
    name: "디자인 토큰 추출",
    description:
      "피그마 파일에서 색상, 타이포그래피, 간격 등 디자인 토큰을 자동 추출합니다.",
    category: "디자인",
    tags: ["디자인토큰", "피그마", "스타일가이드"],
    icon: "🎨",
  },
  {
    id: "5",
    name: "컴포넌트 명세서 생성",
    description:
      "디자인 컴포넌트의 상태, 속성, 인터랙션을 명세서로 자동 정리합니다.",
    category: "디자인",
    tags: ["컴포넌트", "명세서", "디자인시스템"],
    icon: "🧩",
  },

  // 퍼블리싱 (2개)
  {
    id: "6",
    name: "반응형 레이아웃 생성",
    description:
      "디자인 시안을 기반으로 반응형 HTML/CSS 레이아웃 코드를 자동 생성합니다.",
    category: "퍼블리싱",
    tags: ["반응형", "HTML", "CSS"],
    icon: "📱",
  },
  {
    id: "7",
    name: "크로스브라우저 검증",
    description:
      "퍼블리싱 결과물의 크로스브라우저 호환성을 자동으로 검증하고 리포트합니다.",
    category: "퍼블리싱",
    tags: ["크로스브라우저", "호환성", "검증"],
    icon: "🌐",
  },

  // 개발 (3개)
  {
    id: "8",
    name: "API 스캐폴딩 생성",
    description:
      "API 명세를 기반으로 엔드포인트 코드와 타입 정의를 자동 생성합니다.",
    category: "개발",
    tags: ["API", "스캐폴딩", "TypeScript"],
    icon: "⚙️",
  },
  {
    id: "9",
    name: "테스트 코드 자동 생성",
    description:
      "소스 코드를 분석하여 단위 테스트와 통합 테스트를 자동 생성합니다.",
    category: "개발",
    tags: ["테스트", "Jest", "자동화"],
    icon: "🧪",
  },
  {
    id: "10",
    name: "코드 리뷰 자동화",
    description:
      "PR 변경 사항을 분석하여 코드 리뷰 코멘트를 자동으로 생성합니다.",
    category: "개발",
    tags: ["코드리뷰", "PR", "품질"],
    icon: "🔍",
  },

  // QA (2개)
  {
    id: "11",
    name: "테스트 시나리오 생성",
    description:
      "요구사항과 화면설계서를 기반으로 QA 테스트 시나리오를 자동 생성합니다.",
    category: "QA",
    tags: ["테스트시나리오", "QA", "자동화"],
    icon: "✅",
  },
  {
    id: "12",
    name: "버그 리포트 자동 작성",
    description:
      "테스트 실행 결과를 분석하여 표준 양식의 버그 리포트를 자동 작성합니다.",
    category: "QA",
    tags: ["버그리포트", "QA", "문서화"],
    icon: "🐛",
  },
] as const;
