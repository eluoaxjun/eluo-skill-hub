'use client';

import { useSearchParams } from 'next/navigation';
import { parseSearchParamsToRange } from './AnalyticsDateFilter';
import AnalyticsDateFilter from './AnalyticsDateFilter';
import AnalyticsSummaryCards from './AnalyticsSummaryCards';
import DailyTrendChart from './DailyTrendChart';
import SkillRankingsTable from './SkillRankingsTable';
import UserBehaviorSection from './UserBehaviorSection';
import { useAnalyticsOverview, useDailyTrend, useSkillRankings, useUserBehavior } from '@/event-log/hooks/use-analytics-queries';

export default function AnalyticsDashboard() {
  const searchParams = useSearchParams();
  const range = parseSearchParamsToRange(searchParams);

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview(range);
  const { data: dailyTrend, isLoading: trendLoading } = useDailyTrend(range);
  const { data: skillRankings, isLoading: rankingsLoading } = useSkillRankings(range);
  const { data: userBehavior, isLoading: behaviorLoading } = useUserBehavior(range);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#000080]">통계분석</h2>
        <AnalyticsDateFilter range={range} />
      </div>

      {overviewLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl h-[120px] animate-pulse"
              style={{ background: 'rgba(0,0,128,0.05)' }}
            />
          ))}
        </div>
      ) : overview ? (
        <AnalyticsSummaryCards overview={overview} />
      ) : null}

      {trendLoading ? (
        <div
          className="rounded-2xl h-[380px] animate-pulse"
          style={{ background: 'rgba(0,0,128,0.05)' }}
        />
      ) : dailyTrend ? (
        <DailyTrendChart data={dailyTrend} />
      ) : null}

      {rankingsLoading ? (
        <div
          className="rounded-2xl h-[300px] animate-pulse"
          style={{ background: 'rgba(0,0,128,0.05)' }}
        />
      ) : skillRankings ? (
        <SkillRankingsTable data={skillRankings} />
      ) : null}

      {behaviorLoading ? (
        <div
          className="rounded-2xl h-[340px] animate-pulse"
          style={{ background: 'rgba(0,0,128,0.05)' }}
        />
      ) : userBehavior ? (
        <UserBehaviorSection data={userBehavior} />
      ) : null}
    </div>
  );
}
