# Quickstart: 어드민 통계분석 페이지

**Branch**: `023-admin-analytics-page` | **Date**: 2026-03-06

## Prerequisites

- Node.js 18+, pnpm
- Supabase 프로젝트 접근 권한 (MCP 설정 완료)
- admin 역할 계정

## Setup Steps

### 1. 의존성 설치

```bash
# Shadcn Charts 컴포넌트 추가 (Recharts 자동 설치)
npx shadcn@latest add chart

# date-fns 설치
pnpm add date-fns
```

### 2. DB 마이그레이션 (Supabase MCP)

인덱스와 RPC 함수를 생성하는 마이그레이션을 적용한다:

- `idx_event_logs_created_at` — 기간 필터 성능
- `idx_event_logs_event_name_created_at` — 이벤트 타입 + 기간 복합 조건
- `get_analytics_overview` RPC 함수
- `get_daily_trend` RPC 함수
- `get_skill_rankings` RPC 함수
- `get_user_behavior` RPC 함수

### 3. 개발 서버 실행

```bash
pnpm dev
```

`http://localhost:3000/admin/analytics`에서 통계분석 페이지 확인.

## Implementation Order

1. **P1 - 인프라**: DB 인덱스 + RPC 함수 생성
2. **P1 - 도메인**: AnalyticsRepository 인터페이스 + 타입 정의
3. **P1 - 인프라**: SupabaseAnalyticsRepository 구현
4. **P1 - 앱**: 유스케이스 (GetAnalyticsOverview, GetDailyTrend)
5. **P1 - UI**: Shadcn Charts 설치, 기간 필터, 요약 카드, 일별 추이 차트
6. **P1 - 통합**: /admin/analytics 페이지 + 사이드바 메뉴 추가
7. **P2 - 스킬 분석**: 스킬 인기도 유스케이스 + 랭킹 테이블 UI
8. **P3 - 사용자 행동**: 행동 분석 유스케이스 + 사이드바 클릭/페이지뷰 UI
9. **테스트**: 단위 테스트 + E2E 테스트

## Key Files

| File | Purpose |
|------|---------|
| `src/event-log/domain/types.ts` | Analytics 타입 정의 추가 |
| `src/event-log/infrastructure/supabase-analytics-repository.ts` | RPC 호출 구현 |
| `src/event-log/application/get-analytics-overview-use-case.ts` | 요약 지표 유스케이스 |
| `src/features/admin/analytics/AnalyticsDashboard.tsx` | 메인 대시보드 컨테이너 |
| `src/app/admin/analytics/page.tsx` | 라우트 페이지 (SSR) |
| `src/features/admin/AdminSidebar.tsx` | 사이드바 메뉴 항목 추가 |

## Verification

```bash
# 타입 체크
pnpm tsc --noEmit

# 단위 테스트
pnpm test

# E2E 테스트
pnpm playwright test
```
