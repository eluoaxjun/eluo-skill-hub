import { GetSkillRankingsUseCase } from '../get-skill-rankings-use-case';
import type { AnalyticsDateRange, AnalyticsRepository, SkillRankingItem } from '@/event-log/domain/types';

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

describe('GetSkillRankingsUseCase', () => {
  const useCase = new GetSkillRankingsUseCase(mockRepository);

  beforeEach(() => jest.clearAllMocks());

  it('정상 조회 시 SkillRankingItem[]을 반환한다', async () => {
    const expected: SkillRankingItem[] = [
      { skillId: '1', skillTitle: 'Skill A', viewCount: 100, downloadCount: 20, bookmarkCount: 5 },
      { skillId: '2', skillTitle: 'Skill B', viewCount: 80, downloadCount: 15, bookmarkCount: 3 },
    ];
    mockRepository.getSkillRankings.mockResolvedValue(expected);

    const result = await useCase.execute(range);

    expect(result).toEqual(expected);
    expect(mockRepository.getSkillRankings).toHaveBeenCalledWith(range, undefined);
  });

  it('limit 파라미터를 전달한다', async () => {
    mockRepository.getSkillRankings.mockResolvedValue([]);

    await useCase.execute(range, 5);

    expect(mockRepository.getSkillRankings).toHaveBeenCalledWith(range, 5);
  });

  it('빈 결과를 처리한다', async () => {
    mockRepository.getSkillRankings.mockResolvedValue([]);

    const result = await useCase.execute(range);

    expect(result).toEqual([]);
  });
});
