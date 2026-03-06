import type { AnalyticsDateRange, AnalyticsOverview, AnalyticsRepository } from '@/event-log/domain/types';

export class GetAnalyticsOverviewUseCase {
  constructor(private readonly repository: AnalyticsRepository) {}

  async execute(range: AnalyticsDateRange): Promise<AnalyticsOverview> {
    return this.repository.getOverview(range);
  }
}
