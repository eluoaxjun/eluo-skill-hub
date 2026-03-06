# Contract: AnalyticsRepository Interface

**Module**: `src/event-log/domain/types.ts`

## Interface Definition

```typescript
interface AnalyticsDateRange {
  readonly startDate: string; // ISO 8601 timestamptz
  readonly endDate: string;   // ISO 8601 timestamptz
}

interface AnalyticsOverview {
  readonly totalPageViews: number;
  readonly activeUsers: number;
  readonly skillViews: number;
  readonly templateDownloads: number;
  readonly pageViewsChange: number;       // percentage, e.g. 15.5 = +15.5%
  readonly activeUsersChange: number;
  readonly skillViewsChange: number;
  readonly templateDownloadsChange: number;
}

interface DailyTrendItem {
  readonly date: string; // YYYY-MM-DD
  readonly pageViews: number;
  readonly skillViews: number;
  readonly templateDownloads: number;
}

interface SkillRankingItem {
  readonly skillId: string;
  readonly skillTitle: string;
  readonly viewCount: number;
  readonly downloadCount: number;
  readonly bookmarkCount: number;
}

interface SidebarClickItem {
  readonly tab: string;
  readonly clickCount: number;
}

interface PageViewItem {
  readonly path: string;
  readonly viewCount: number;
}

interface UserBehaviorData {
  readonly sidebarClicks: readonly SidebarClickItem[];
  readonly pageViews: readonly PageViewItem[];
}

interface AnalyticsRepository {
  getOverview(range: AnalyticsDateRange): Promise<AnalyticsOverview>;
  getDailyTrend(range: AnalyticsDateRange): Promise<readonly DailyTrendItem[]>;
  getSkillRankings(range: AnalyticsDateRange, limit?: number): Promise<readonly SkillRankingItem[]>;
  getUserBehavior(range: AnalyticsDateRange): Promise<UserBehaviorData>;
}
```

## Behavior Contract

### getOverview
- Returns aggregated metrics for the specified date range
- Change percentages compare current range vs previous range of equal length
- If previous range has zero events, change is reported as 0
- activeUsers counts distinct non-null user_id values

### getDailyTrend
- Returns one entry per day in the date range, ordered ascending by date
- Days with no events return counts of 0
- Date format: YYYY-MM-DD (local timezone)

### getSkillRankings
- Returns skills ordered by viewCount descending
- Default limit: 10
- skillTitle is resolved by joining with skills table
- Skills that have been deleted are excluded

### getUserBehavior
- sidebarClicks: ordered by clickCount descending
- pageViews: ordered by viewCount descending
- Both arrays may be empty if no matching events exist
