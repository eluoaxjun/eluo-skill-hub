import type { AnalyticsDateRange, AnalyticsRepository, DailyTrendItem } from '@/event-log/domain/types';

export class GetDailyTrendUseCase {
  constructor(private readonly repository: AnalyticsRepository) {}

  async execute(range: AnalyticsDateRange): Promise<readonly DailyTrendItem[]> {
    return this.repository.getDailyTrend(range);
  }
}
