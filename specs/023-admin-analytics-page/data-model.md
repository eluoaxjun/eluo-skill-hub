# Data Model: 어드민 통계분석 페이지

**Branch**: `023-admin-analytics-page` | **Date**: 2026-03-06

## Existing Entities (참조용, 변경 없음)

### event_logs (기존 테이블)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | PK, gen_random_uuid() |
| event_name | text | NO | 이벤트 식별자 |
| user_id | uuid | YES | auth.users FK |
| session_id | text | YES | 클라이언트 세션 ID |
| properties | jsonb | YES | 이벤트별 상세 속성 (default: '{}') |
| page_url | text | YES | 이벤트 발생 페이지 URL |
| user_agent | text | YES | 브라우저 User-Agent |
| created_at | timestamptz | NO | 이벤트 발생 시각 (default: now()) |

### skills (기존 테이블, 조인용)

스킬 인기도 분석에서 skill_id → 스킬 이름 매핑에 사용.

## Domain Types (신규)

### AnalyticsDateRange

기간 필터에서 사용하는 날짜 범위.

```
preset: 'today' | '7d' | '30d' | 'custom'
startDate: Date (ISO string)
endDate: Date (ISO string)
```

### AnalyticsOverview

대시보드 요약 카드에 표시할 주요 지표.

```
totalPageViews: number          — nav.page_view 이벤트 수
activeUsers: number             — 기간 내 고유 user_id 수
skillViews: number              — skill.view 이벤트 수
templateDownloads: number       — skill.template_download 이벤트 수
pageViewsChange: number         — 이전 동일 기간 대비 변화율 (%)
activeUsersChange: number       — 이전 동일 기간 대비 변화율 (%)
skillViewsChange: number        — 이전 동일 기간 대비 변화율 (%)
templateDownloadsChange: number — 이전 동일 기간 대비 변화율 (%)
```

### DailyTrendItem

일별 추이 차트의 데이터 포인트.

```
date: string (YYYY-MM-DD)
pageViews: number
skillViews: number
templateDownloads: number
```

### SkillRankingItem

스킬 인기도 순위 테이블의 행.

```
skillId: string
skillTitle: string
viewCount: number
downloadCount: number
bookmarkCount: number
```

### SidebarClickItem

사이드바 탭별 클릭 분포.

```
tab: string
clickCount: number
```

### PageViewItem

페이지별 방문 수.

```
path: string
viewCount: number
```

### UserBehaviorData

사용자 행동 분석 섹션의 집계 데이터.

```
sidebarClicks: SidebarClickItem[]
pageViews: PageViewItem[]
```

## Relationships

- `event_logs.user_id` → `auth.users.id` (기존, nullable)
- `event_logs.properties->>'skill_id'` → `skills.id` (논리적 관계, skill.view/skill.template_download/skill.bookmark_* 이벤트)

## Database Functions (신규 RPC)

### get_analytics_overview(start_date, end_date)

기간 내 주요 지표와 이전 동일 기간 대비 변화율을 반환.

- Input: start_date (timestamptz), end_date (timestamptz)
- Output: AnalyticsOverview 구조의 단일 행
- Logic: 현재 기간과 이전 기간(동일 길이) 각각 집계 후 변화율 계산

### get_daily_trend(start_date, end_date)

기간 내 일별 이벤트 추이를 반환.

- Input: start_date (timestamptz), end_date (timestamptz)
- Output: DailyTrendItem[] — 일별 pageViews, skillViews, templateDownloads
- Logic: DATE_TRUNC('day', created_at)로 그룹핑, 이벤트 타입별 COUNT

### get_skill_rankings(start_date, end_date, limit)

기간 내 스킬별 조회/다운로드/북마크 집계.

- Input: start_date (timestamptz), end_date (timestamptz), limit (int, default 10)
- Output: SkillRankingItem[] — skills 테이블과 조인하여 스킬 이름 포함
- Logic: properties->>'skill_id'로 GROUP BY, skills.title 조인

### get_user_behavior(start_date, end_date)

기간 내 사이드바 클릭 분포 + 페이지별 방문 수.

- Input: start_date (timestamptz), end_date (timestamptz)
- Output: JSON { sidebarClicks: SidebarClickItem[], pageViews: PageViewItem[] }
- Logic: nav.sidebar_click은 properties->>'tab'으로 GROUP BY, nav.page_view는 properties->>'path'로 GROUP BY

## Index Recommendations

기존 event_logs 테이블에 분석 쿼리 성능을 위한 인덱스:

- `idx_event_logs_created_at` on (created_at) — 기간 필터 범위 스캔
- `idx_event_logs_event_name_created_at` on (event_name, created_at) — 이벤트 타입 + 기간 필터 복합 조건
- `idx_event_logs_properties_skill_id` on ((properties->>'skill_id')) WHERE event_name IN ('skill.view', 'skill.template_download', 'skill.bookmark_add', 'skill.bookmark_remove') — 스킬별 집계 최적화
