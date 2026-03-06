# Implementation Plan: 어드민 통계분석 페이지

**Branch**: `023-admin-analytics-page` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-admin-analytics-page/spec.md`

## Summary

event_logs 테이블의 이벤트 데이터를 집계하여 어드민 통계분석 대시보드(`/admin/analytics`)를 구현한다. 기존 Clean Architecture 패턴(domain → application → infrastructure)을 따르며, Shadcn UI의 내장 차트 컴포넌트(Recharts 기반)를 활용하여 요약 카드, 일별 추이 차트, 스킬 인기도 테이블, 사용자 행동 분석을 제공한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, @tanstack/react-query, Shadcn UI (Radix UI), Recharts (Shadcn Charts 내장), @supabase/ssr ^0.8.0, @supabase/supabase-js ^2.98.0, lucide-react ^0.576.0, date-fns (날짜 유틸리티)
**Storage**: Supabase (PostgreSQL) — event_logs 테이블 (기존), skills 테이블 (조인용)
**Testing**: Jest + React Testing Library (단위), Playwright (E2E)
**Target Platform**: Web (관리자 전용 페이지)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 초기 로딩 5초 이내, 필터 변경 시 3초 이내 갱신
**Constraints**: 대량 데이터(10만 건+) 처리 시에도 합리적 응답 시간 유지
**Scale/Scope**: admin 역할 사용자만 접근, event_logs 현재 210건 (성장 예상)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | 모든 타입 명시적 정의, `any` 사용 금지 |
| II. Clean Architecture | PASS | event-log 모듈에 analytics 레이어 추가 (domain → application → infrastructure) |
| III. Test Coverage | PASS | 유스케이스 단위 테스트 + E2E 테스트 계획 포함 |
| IV. Feature Module Isolation | PASS | analytics는 event-log 모듈 내 도메인으로, admin UI는 features/admin에 위치 |
| V. Security-First | PASS | 기존 admin layout의 서버 사이드 권한 체크 활용, RLS 유지 |

## Project Structure

### Documentation (this feature)

```text
specs/023-admin-analytics-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── event-log/
│   ├── domain/
│   │   └── types.ts                    # AnalyticsQuery, AnalyticsOverview 등 타입 추가
│   ├── application/
│   │   ├── get-analytics-overview-use-case.ts    # P1: 요약 지표 조회
│   │   ├── get-daily-trend-use-case.ts           # P1: 일별 추이 조회
│   │   ├── get-skill-rankings-use-case.ts        # P2: 스킬 인기도 순위
│   │   └── get-user-behavior-use-case.ts         # P3: 사용자 행동 분석
│   ├── infrastructure/
│   │   ├── supabase-event-log-repository.ts      # 기존 (insert 전용)
│   │   └── supabase-analytics-repository.ts      # 신규: 집계 쿼리 구현
│   └── hooks/
│       ├── use-track-event.ts                    # 기존
│       ├── use-session-id.ts                     # 기존
│       └── use-analytics-queries.ts              # 신규: React Query 훅
├── features/admin/
│   ├── AdminSidebar.tsx                          # 수정: 통계분석 메뉴 추가
│   ├── analytics/
│   │   ├── AnalyticsDashboard.tsx                # 메인 대시보드 컨테이너
│   │   ├── AnalyticsDateFilter.tsx               # 기간 필터 컴포넌트
│   │   ├── AnalyticsSummaryCards.tsx             # 요약 카드 그리드
│   │   ├── DailyTrendChart.tsx                   # 일별 추이 라인 차트
│   │   ├── SkillRankingsTable.tsx                # 스킬 인기도 테이블
│   │   └── UserBehaviorSection.tsx               # 사용자 행동 분석 섹션
│   └── SummaryCard.tsx                           # 기존 (재사용)
├── app/admin/analytics/
│   └── page.tsx                                  # 서버 컴포넌트 (SSR + Hydration)
└── shared/infrastructure/tanstack-query/
    └── query-keys.ts                             # analytics 쿼리 키 추가
```

**Structure Decision**: 기존 Clean Architecture 패턴을 준수하여 `event-log` 모듈에 analytics 도메인/애플리케이션/인프라 레이어를 추가한다. UI 컴포넌트는 `features/admin/analytics/` 하위에 배치하여 Feature Module Isolation 원칙을 따른다. 기존 `SummaryCard` 컴포넌트를 재사용한다.

## Complexity Tracking

> No constitution violations detected. No deviations required.
