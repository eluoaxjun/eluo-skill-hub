import type { AnalyticsDateRange, AnalyticsRepository, SkillRankingItem } from '@/event-log/domain/types';

export class GetSkillRankingsUseCase {
  constructor(private readonly repository: AnalyticsRepository) {}

  async execute(range: AnalyticsDateRange, limit?: number): Promise<readonly SkillRankingItem[]> {
    return this.repository.getSkillRankings(range, limit);
  }
}
