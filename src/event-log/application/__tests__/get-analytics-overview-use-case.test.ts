import { GetAnalyticsOverviewUseCase } from '../get-analytics-overview-use-case';
import type { AnalyticsDateRange, AnalyticsOverview, AnalyticsRepository } from '@/event-log/domain/types';

const mockRepository: jest.Mocked<AnalyticsRepository> = {
  getOverview: jest.fn(),
  getDailyTrend: jest.fn(),
  getSkillRankings: jest.fn(),
  getUserBehavior: jest.fn(),
};

const range: AnalyticsDateRange = {
  startDate: '2026-03-01T00:00:00.000Z',
  endDate: '2026-03-07T23:59:59.999Z',
};

describe('GetAnalyticsOverviewUseCase', () => {
  const useCase = new GetAnalyticsOverviewUseCase(mockRepository);

  beforeEach(() => jest.clearAllMocks());

  it('정상 조회 시 AnalyticsOverview를 반환한다', async () => {
    const expected: AnalyticsOverview = {
      activeUsers: 20,
      skillViews: 50,
      templateDownloads: 10,
      activeUsersChange: -5.0,
      skillViewsChange: 20.0,
      templateDownloadsChange: 0,
    };
    mockRepository.getOverview.mockResolvedValue(expected);

    const result = await useCase.execute(range);

    expect(result).toEqual(expected);
    expect(mockRepository.getOverview).toHaveBeenCalledWith(range);
  });

  it('빈 데이터(0값) 케이스를 처리한다', async () => {
    const empty: AnalyticsOverview = {
      activeUsers: 0,
      skillViews: 0,
      templateDownloads: 0,
      activeUsersChange: 0,
      skillViewsChange: 0,
      templateDownloadsChange: 0,
    };
    mockRepository.getOverview.mockResolvedValue(empty);

    const result = await useCase.execute(range);

    expect(result.activeUsers).toBe(0);
    expect(result.skillViewsChange).toBe(0);
  });
});
