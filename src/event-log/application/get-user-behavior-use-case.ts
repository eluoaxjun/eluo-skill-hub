import type { AnalyticsDateRange, AnalyticsRepository, UserBehaviorData } from '@/event-log/domain/types';

export class GetUserBehaviorUseCase {
  constructor(private readonly repository: AnalyticsRepository) {}

  async execute(range: AnalyticsDateRange): Promise<UserBehaviorData> {
    return this.repository.getUserBehavior(range);
  }
}
