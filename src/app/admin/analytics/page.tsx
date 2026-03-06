import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/infrastructure/tanstack-query/get-query-client';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { SupabaseAnalyticsRepository } from '@/event-log/infrastructure/supabase-analytics-repository';
import { GetAnalyticsOverviewUseCase } from '@/event-log/application/get-analytics-overview-use-case';
import { GetDailyTrendUseCase } from '@/event-log/application/get-daily-trend-use-case';
import { GetSkillRankingsUseCase } from '@/event-log/application/get-skill-rankings-use-case';
import { GetUserBehaviorUseCase } from '@/event-log/application/get-user-behavior-use-case';
import AnalyticsDashboard from '@/features/admin/analytics/AnalyticsDashboard';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const metadata: Metadata = {
  title: '통계분석',
};

function getDefaultRange() {
  const now = new Date();
  return {
    startDate: startOfDay(subDays(now, 6)).toISOString(),
    endDate: endOfDay(now).toISOString(),
  };
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const startDate = typeof params.startDate === 'string' ? params.startDate : undefined;
  const endDate = typeof params.endDate === 'string' ? params.endDate : undefined;

  const range = startDate && endDate
    ? { startDate, endDate }
    : getDefaultRange();

  const repository = new SupabaseAnalyticsRepository();
  const overviewUseCase = new GetAnalyticsOverviewUseCase(repository);
  const dailyTrendUseCase = new GetDailyTrendUseCase(repository);
  const skillRankingsUseCase = new GetSkillRankingsUseCase(repository);
  const userBehaviorUseCase = new GetUserBehaviorUseCase(repository);

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.analytics.overview(range),
      queryFn: () => overviewUseCase.execute(range),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.analytics.dailyTrend(range),
      queryFn: () => dailyTrendUseCase.execute(range),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.analytics.skillRankings(range),
      queryFn: () => skillRankingsUseCase.execute(range),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.analytics.userBehavior(range),
      queryFn: () => userBehaviorUseCase.execute(range),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsDashboard />
    </HydrationBoundary>
  );
}
