'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { SupabaseAnalyticsRepositoryClient } from '@/event-log/infrastructure/supabase-analytics-repository.client';
import { GetAnalyticsOverviewUseCase } from '@/event-log/application/get-analytics-overview-use-case';
import { GetDailyTrendUseCase } from '@/event-log/application/get-daily-trend-use-case';
import { GetSkillRankingsUseCase } from '@/event-log/application/get-skill-rankings-use-case';
import { GetUserBehaviorUseCase } from '@/event-log/application/get-user-behavior-use-case';
import type { AnalyticsDateRange } from '@/event-log/domain/types';

const repository = new SupabaseAnalyticsRepositoryClient();

export function useAnalyticsOverview(range: AnalyticsDateRange) {
  const useCase = new GetAnalyticsOverviewUseCase(repository);
  return useQuery({
    queryKey: queryKeys.admin.analytics.overview(range),
    queryFn: () => useCase.execute(range),
    staleTime: 60 * 1000,
  });
}

export function useDailyTrend(range: AnalyticsDateRange) {
  const useCase = new GetDailyTrendUseCase(repository);
  return useQuery({
    queryKey: queryKeys.admin.analytics.dailyTrend(range),
    queryFn: () => useCase.execute(range),
    staleTime: 60 * 1000,
  });
}

export function useSkillRankings(range: AnalyticsDateRange) {
  const useCase = new GetSkillRankingsUseCase(repository);
  return useQuery({
    queryKey: queryKeys.admin.analytics.skillRankings(range),
    queryFn: () => useCase.execute(range),
    staleTime: 60 * 1000,
  });
}

export function useUserBehavior(range: AnalyticsDateRange) {
  const useCase = new GetUserBehaviorUseCase(repository);
  return useQuery({
    queryKey: queryKeys.admin.analytics.userBehavior(range),
    queryFn: () => useCase.execute(range),
    staleTime: 60 * 1000,
  });
}
