import { GetUserBehaviorUseCase } from '../get-user-behavior-use-case';
import type { AnalyticsDateRange, AnalyticsRepository, UserBehaviorData } from '@/event-log/domain/types';

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

describe('GetUserBehaviorUseCase', () => {
  const useCase = new GetUserBehaviorUseCase(mockRepository);

  beforeEach(() => jest.clearAllMocks());

  it('정상 조회 시 UserBehaviorData를 반환한다', async () => {
    const expected: UserBehaviorData = {
      sidebarClicks: [
        { tab: '전체', clickCount: 50 },
        { tab: '기획', clickCount: 30 },
      ],
    };
    mockRepository.getUserBehavior.mockResolvedValue(expected);

    const result = await useCase.execute(range);

    expect(result).toEqual(expected);
    expect(mockRepository.getUserBehavior).toHaveBeenCalledWith(range);
  });

  it('빈 sidebarClicks를 처리한다', async () => {
    const empty: UserBehaviorData = {
      sidebarClicks: [],
    };
    mockRepository.getUserBehavior.mockResolvedValue(empty);

    const result = await useCase.execute(range);

    expect(result.sidebarClicks).toEqual([]);
  });
});
