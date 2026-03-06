import { createClient } from '@/shared/infrastructure/supabase/client';
import type {
  AnalyticsDateRange,
  AnalyticsOverview,
  AnalyticsRepository,
  DailyTrendItem,
  SkillRankingItem,
  UserBehaviorData,
} from '@/event-log/domain/types';

export class SupabaseAnalyticsRepositoryClient implements AnalyticsRepository {
  async getOverview(range: AnalyticsDateRange): Promise<AnalyticsOverview> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_analytics_overview', {
      start_date: range.startDate,
      end_date: range.endDate,
    });
    if (error) throw error;
    return data as AnalyticsOverview;
  }

  async getDailyTrend(range: AnalyticsDateRange): Promise<readonly DailyTrendItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_daily_trend', {
      start_date: range.startDate,
      end_date: range.endDate,
    });
    if (error) throw error;
    return (data as DailyTrendItem[]) ?? [];
  }

  async getSkillRankings(range: AnalyticsDateRange, limit = 10): Promise<readonly SkillRankingItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_skill_rankings', {
      start_date: range.startDate,
      end_date: range.endDate,
      result_limit: limit,
    });
    if (error) throw error;
    return (data as SkillRankingItem[]) ?? [];
  }

  async getUserBehavior(range: AnalyticsDateRange): Promise<UserBehaviorData> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_user_behavior', {
      start_date: range.startDate,
      end_date: range.endDate,
    });
    if (error) throw error;
    return data as UserBehaviorData;
  }
}
