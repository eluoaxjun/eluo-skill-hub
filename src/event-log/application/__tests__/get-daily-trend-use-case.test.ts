import { GetDailyTrendUseCase } from '../get-daily-trend-use-case';
import type { AnalyticsDateRange, AnalyticsRepository, DailyTrendItem } from '@/event-log/domain/types';

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

describe('GetDailyTrendUseCase', () => {
  const useCase = new GetDailyTrendUseCase(mockRepository);

  beforeEach(() => jest.clearAllMocks());

  it('정상 조회 시 DailyTrendItem[]을 반환한다', async () => {
    const expected: DailyTrendItem[] = [
      { date: '2026-03-01', skillViews: 5, templateDownloads: 2 },
      { date: '2026-03-02', skillViews: 8, templateDownloads: 3 },
    ];
    mockRepository.getDailyTrend.mockResolvedValue(expected);

    const result = await useCase.execute(range);

    expect(result).toEqual(expected);
    expect(mockRepository.getDailyTrend).toHaveBeenCalledWith(range);
  });

  it('빈 기간 케이스를 처리한다', async () => {
    mockRepository.getDailyTrend.mockResolvedValue([]);

    const result = await useCase.execute(range);

    expect(result).toEqual([]);
  });
});
