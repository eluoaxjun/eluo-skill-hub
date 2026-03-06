# Contract: Analytics Query Keys

**Module**: `src/shared/infrastructure/tanstack-query/query-keys.ts`

## Addition to existing queryKeys

```typescript
// 기존 admin 키 하위에 analytics 추가
admin: {
  // ... existing keys ...
  analytics: {
    all: ['admin', 'analytics'] as const,
    overview: (range: { startDate: string; endDate: string }) =>
      ['admin', 'analytics', 'overview', range] as const,
    dailyTrend: (range: { startDate: string; endDate: string }) =>
      ['admin', 'analytics', 'daily-trend', range] as const,
    skillRankings: (range: { startDate: string; endDate: string }) =>
      ['admin', 'analytics', 'skill-rankings', range] as const,
    userBehavior: (range: { startDate: string; endDate: string }) =>
      ['admin', 'analytics', 'user-behavior', range] as const,
  },
}
```

## Invalidation Strategy

- 기간 필터 변경 시: 해당 range의 개별 쿼리가 자동 리패칭 (키 변경)
- 전체 새로고침: `['admin', 'analytics']` prefix로 일괄 무효화
