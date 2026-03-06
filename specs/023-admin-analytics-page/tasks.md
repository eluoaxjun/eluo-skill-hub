# Tasks: 어드민 통계분석 페이지

**Input**: Design documents from `/specs/023-admin-analytics-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 테스트 태스크는 Constitution 원칙 III (Test Coverage by Layer)에 따라 포함.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 차트 라이브러리 및 날짜 유틸리티 설치, Shadcn Charts 컴포넌트 추가

- [x] T001 Shadcn Charts 컴포넌트 추가 (`npx shadcn@latest add chart`) 및 date-fns 의존성 설치 (`pnpm add date-fns`)
- [x] T002 [P] analytics 쿼리 키 추가 in `src/shared/infrastructure/tanstack-query/query-keys.ts` — admin.analytics.overview, dailyTrend, skillRankings, userBehavior 키 정의

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB 인덱스, RPC 함수, 도메인 타입, 리포지토리 인터페이스 — 모든 User Story가 의존하는 인프라

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Supabase 마이그레이션: event_logs 테이블에 분석 인덱스 생성 — `idx_event_logs_created_at` (created_at), `idx_event_logs_event_name_created_at` (event_name, created_at), `idx_event_logs_properties_skill_id` (partial index on properties->>'skill_id')
- [x] T004 Supabase 마이그레이션: `get_analytics_overview(start_date timestamptz, end_date timestamptz)` RPC 함수 생성 — 현재 기간 및 이전 동일 기간의 page_view/active_users/skill_view/template_download 집계 + 변화율 계산
- [x] T005 [P] Supabase 마이그레이션: `get_daily_trend(start_date timestamptz, end_date timestamptz)` RPC 함수 생성 — DATE_TRUNC('day')로 일별 pageViews, skillViews, templateDownloads 집계, 빈 날짜는 0으로 채움
- [x] T006 [P] Supabase 마이그레이션: `get_skill_rankings(start_date timestamptz, end_date timestamptz, result_limit int DEFAULT 10)` RPC 함수 생성 — properties->>'skill_id'로 GROUP BY, skills 테이블 조인하여 스킬 이름 포함, viewCount/downloadCount/bookmarkCount 집계
- [x] T007 [P] Supabase 마이그레이션: `get_user_behavior(start_date timestamptz, end_date timestamptz)` RPC 함수 생성 — nav.sidebar_click의 tab별 분포 + nav.page_view의 path별 방문수를 JSON으로 반환
- [x] T008 Analytics 도메인 타입 정의 in `src/event-log/domain/types.ts` — AnalyticsDateRange, AnalyticsOverview, DailyTrendItem, SkillRankingItem, SidebarClickItem, PageViewItem, UserBehaviorData 인터페이스 추가 및 AnalyticsRepository 인터페이스 정의 (getOverview, getDailyTrend, getSkillRankings, getUserBehavior 메서드)
- [x] T009 SupabaseAnalyticsRepository 구현 in `src/event-log/infrastructure/supabase-analytics-repository.ts` — 4개 RPC 함수 호출 구현, Supabase 클라이언트로 .rpc() 호출, 응답 타입 매핑

**Checkpoint**: Foundation ready - 모든 RPC 함수, 타입, 리포지토리 구현 완료. User Story 구현 가능.

---

## Phase 3: User Story 1 - 전체 서비스 현황 대시보드 조회 (Priority: P1) MVP

**Goal**: 관리자가 `/admin/analytics`에서 주요 지표 요약 카드와 일별 추이 차트를 확인할 수 있다.

**Independent Test**: `/admin/analytics` 접속 시 요약 카드 4개와 라인 차트가 정상 렌더링되고, 기간 필터 변경 시 데이터가 갱신된다.

### Implementation for User Story 1

- [x] T010 [P] [US1] GetAnalyticsOverviewUseCase 구현 in `src/event-log/application/get-analytics-overview-use-case.ts` — AnalyticsRepository.getOverview(range) 호출, AnalyticsOverview 반환
- [x] T011 [P] [US1] GetDailyTrendUseCase 구현 in `src/event-log/application/get-daily-trend-use-case.ts` — AnalyticsRepository.getDailyTrend(range) 호출, DailyTrendItem[] 반환
- [x] T012 [P] [US1] AnalyticsDateFilter 컴포넌트 생성 in `src/features/admin/analytics/AnalyticsDateFilter.tsx` — 프리셋 버튼(오늘/7일/30일) + 커스텀 날짜 선택 Popover, URL searchParams 기반 상태 관리, Shadcn Button/Popover/Calendar 활용
- [x] T013 [P] [US1] AnalyticsSummaryCards 컴포넌트 생성 in `src/features/admin/analytics/AnalyticsSummaryCards.tsx` — 4개 지표(페이지뷰, 활성 사용자, 스킬 조회, 템플릿 다운로드) 카드 그리드, 기존 SummaryCard 컴포넌트 재사용, 증감률 표시 (양수: 초록, 음수: 빨강)
- [x] T014 [P] [US1] DailyTrendChart 컴포넌트 생성 in `src/features/admin/analytics/DailyTrendChart.tsx` — Shadcn Charts(Recharts) LineChart 활용, pageViews/skillViews/templateDownloads 3개 라인, 반응형 컨테이너, 빈 데이터 시 empty state 표시
- [x] T015 [US1] useAnalyticsQueries 훅 생성 in `src/event-log/hooks/use-analytics-queries.ts` — useAnalyticsOverview(range), useDailyTrend(range) React Query 훅, SupabaseAnalyticsRepository 인스턴스 생성 및 유스케이스 호출
- [x] T016 [US1] AnalyticsDashboard 컨테이너 컴포넌트 생성 in `src/features/admin/analytics/AnalyticsDashboard.tsx` — AnalyticsDateFilter + AnalyticsSummaryCards + DailyTrendChart 조합, 기간 상태를 URL searchParams에서 읽어 하위 컴포넌트에 전달, 로딩/에러 상태 처리
- [x] T017 [US1] `/admin/analytics` 페이지 생성 in `src/app/admin/analytics/page.tsx` — Server Component, SSR로 초기 데이터 프리페칭 (getAnalyticsOverview + getDailyTrend), HydrationBoundary로 React Query 하이드레이션, 기존 admin/page.tsx 패턴 준수
- [x] T018 [US1] AdminSidebar에 통계분석 메뉴 추가 in `src/features/admin/AdminSidebar.tsx` — navItems에 `{ label: '통계분석', href: '/admin/analytics', icon: BarChart3 }` 추가 (lucide-react BarChart3 아이콘)

**Checkpoint**: User Story 1 완료 — `/admin/analytics`에서 요약 카드 + 일별 추이 차트 + 기간 필터가 동작.

---

## Phase 4: User Story 2 - 스킬별 인기도 분석 (Priority: P2)

**Goal**: 관리자가 스킬 조회/다운로드/북마크 순위를 테이블로 확인할 수 있다.

**Independent Test**: 통계분석 페이지에서 스킬 랭킹 테이블이 표시되고, 기간 필터 적용 시 순위가 갱신된다.

### Implementation for User Story 2

- [x] T019 [P] [US2] GetSkillRankingsUseCase 구현 in `src/event-log/application/get-skill-rankings-use-case.ts` — AnalyticsRepository.getSkillRankings(range, limit) 호출, SkillRankingItem[] 반환
- [x] T020 [P] [US2] SkillRankingsTable 컴포넌트 생성 in `src/features/admin/analytics/SkillRankingsTable.tsx` — Shadcn Table 활용, 스킬 이름/조회수/다운로드수/북마크수 컬럼, 순위 번호 표시, 빈 데이터 시 empty state
- [x] T021 [US2] useSkillRankings 훅 추가 in `src/event-log/hooks/use-analytics-queries.ts` — useSkillRankings(range) React Query 훅 추가
- [x] T022 [US2] AnalyticsDashboard에 SkillRankingsTable 통합 in `src/features/admin/analytics/AnalyticsDashboard.tsx` — 일별 추이 차트 아래에 스킬 랭킹 섹션 추가, 기간 필터 공유
- [x] T023 [US2] `/admin/analytics/page.tsx`에 스킬 랭킹 SSR 프리페칭 추가 in `src/app/admin/analytics/page.tsx` — getSkillRankings 유스케이스 프리페칭을 Promise.all에 추가

**Checkpoint**: User Story 2 완료 — 스킬 인기도 테이블이 대시보드에 통합되어 동작.

---

## Phase 5: User Story 3 - 사용자 행동 패턴 분석 (Priority: P3)

**Goal**: 관리자가 사이드바 클릭 분포와 페이지별 방문 현황을 확인할 수 있다.

**Independent Test**: 통계분석 페이지에서 사이드바 클릭 분포 차트와 페이지별 방문 테이블이 표시된다.

### Implementation for User Story 3

- [x] T024 [P] [US3] GetUserBehaviorUseCase 구현 in `src/event-log/application/get-user-behavior-use-case.ts` — AnalyticsRepository.getUserBehavior(range) 호출, UserBehaviorData 반환
- [x] T025 [P] [US3] UserBehaviorSection 컴포넌트 생성 in `src/features/admin/analytics/UserBehaviorSection.tsx` — 사이드바 탭별 클릭 분포 (Shadcn Charts BarChart) + 페이지별 방문수 테이블, 빈 데이터 시 empty state
- [x] T026 [US3] useUserBehavior 훅 추가 in `src/event-log/hooks/use-analytics-queries.ts` — useUserBehavior(range) React Query 훅 추가
- [x] T027 [US3] AnalyticsDashboard에 UserBehaviorSection 통합 in `src/features/admin/analytics/AnalyticsDashboard.tsx` — 스킬 랭킹 아래에 사용자 행동 분석 섹션 추가
- [x] T028 [US3] `/admin/analytics/page.tsx`에 사용자 행동 SSR 프리페칭 추가 in `src/app/admin/analytics/page.tsx` — getUserBehavior 유스케이스 프리페칭을 Promise.all에 추가

**Checkpoint**: User Story 3 완료 — 모든 분석 섹션이 대시보드에 통합.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 테스트, 성능 최적화, 빈 상태 처리 등 품질 보증

- [x] T029 [P] GetAnalyticsOverviewUseCase 단위 테스트 in `src/event-log/application/__tests__/get-analytics-overview-use-case.test.ts` — 정상 조회, 빈 데이터, 변화율 0% 케이스
- [x] T030 [P] GetDailyTrendUseCase 단위 테스트 in `src/event-log/application/__tests__/get-daily-trend-use-case.test.ts` — 정상 조회, 빈 기간 케이스
- [x] T031 [P] GetSkillRankingsUseCase 단위 테스트 in `src/event-log/application/__tests__/get-skill-rankings-use-case.test.ts` — 정상 조회, limit 파라미터, 빈 결과
- [x] T032 [P] GetUserBehaviorUseCase 단위 테스트 in `src/event-log/application/__tests__/get-user-behavior-use-case.test.ts` — 정상 조회, 빈 sidebarClicks/pageViews
- [x] T033 [P] AnalyticsSummaryCards 컴포넌트 테스트 in `src/features/admin/analytics/__tests__/AnalyticsSummaryCards.test.tsx` — 4개 카드 렌더링, 증감률 색상 표시 검증
- [x] T034 [P] AnalyticsDateFilter 컴포넌트 테스트 in `src/features/admin/analytics/__tests__/AnalyticsDateFilter.test.tsx` — 프리셋 버튼 클릭 시 URL 업데이트, 커스텀 날짜 선택
- [x] T035 E2E 테스트: 통계분석 페이지 기본 흐름 in `src/__tests__/e2e/admin-analytics.spec.ts` — admin 로그인 → /admin/analytics 접속 → 요약 카드 표시 확인 → 기간 필터 변경 → 데이터 갱신 확인 → 스킬 랭킹 테이블 확인
- [x] T036 타입 체크 및 린트 검증 — `pnpm tsc --noEmit` 통과, ESLint no-explicit-any 위반 없음 확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1, US2, US3의 유스케이스와 컴포넌트는 병렬 구현 가능하나, AnalyticsDashboard 통합은 순차적
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 완료 후 시작 가능 — 다른 스토리에 의존 없음
- **User Story 2 (P2)**: Phase 2 완료 후 시작 가능 — US1과 AnalyticsDashboard 컨테이너를 공유하므로 US1의 T016 이후 T022 실행 권장
- **User Story 3 (P3)**: Phase 2 완료 후 시작 가능 — US1의 T016 이후 T027 실행 권장

### Within Each User Story

- 유스케이스(application) 먼저 → 컴포넌트(features) → 훅(hooks) → 통합(AnalyticsDashboard) → 페이지(page.tsx)

### Parallel Opportunities

- T010, T011, T012, T013, T014: 모두 별개 파일, 병렬 실행 가능
- T019, T020: 별개 파일, 병렬 실행 가능
- T024, T025: 별개 파일, 병렬 실행 가능
- T029~T034: 모든 단위/컴포넌트 테스트 병렬 실행 가능
- T004, T005, T006, T007: RPC 함수 마이그레이션 병렬 실행 가능

---

## Parallel Example: User Story 1

```bash
# Phase 2 완료 후, 아래 태스크 병렬 실행:
Task T010: "GetAnalyticsOverviewUseCase in src/event-log/application/get-analytics-overview-use-case.ts"
Task T011: "GetDailyTrendUseCase in src/event-log/application/get-daily-trend-use-case.ts"
Task T012: "AnalyticsDateFilter in src/features/admin/analytics/AnalyticsDateFilter.tsx"
Task T013: "AnalyticsSummaryCards in src/features/admin/analytics/AnalyticsSummaryCards.tsx"
Task T014: "DailyTrendChart in src/features/admin/analytics/DailyTrendChart.tsx"

# 위 태스크 완료 후 순차 실행:
Task T015: "useAnalyticsQueries hook (T010, T011에 의존)"
Task T016: "AnalyticsDashboard container (T012~T014에 의존)"
Task T017: "page.tsx SSR (T010, T011, T016에 의존)"
Task T018: "AdminSidebar 메뉴 추가 (독립)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Shadcn Charts + date-fns 설치
2. Complete Phase 2: DB 인덱스 + RPC 함수 + 타입 + 리포지토리
3. Complete Phase 3: 요약 카드 + 일별 추이 차트 + 기간 필터 + 페이지 + 사이드바 메뉴
4. **STOP and VALIDATE**: `/admin/analytics`에서 요약 카드 4개와 차트가 정상 동작하는지 확인
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → 인프라 준비 완료
2. Add User Story 1 → 요약 대시보드 MVP 배포
3. Add User Story 2 → 스킬 인기도 테이블 추가 배포
4. Add User Story 3 → 사용자 행동 분석 추가 배포
5. Polish → 테스트 + 타입 체크 + 코드 품질 검증

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- 기간 필터는 URL searchParams 기반이므로 모든 스토리에서 공유됨
- SummaryCard 컴포넌트는 기존 어드민 대시보드에서 재사용
- RPC 함수는 각각 독립적이므로 마이그레이션 병렬 적용 가능
- 모든 타입은 readonly로 정의하여 불변성 보장
