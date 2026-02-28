import { GetDashboardStatsUseCase } from '@/user-account/application/GetDashboardStatsUseCase';
import type { UserRepository, DashboardStats } from '@/user-account/domain/UserRepository';
import type { UserProfile } from '@/user-account/domain/UserProfile';

/**
 * UserRepository mock 생성 헬퍼
 */
function createMockUserRepository(
  overrides: Partial<UserRepository> = {}
): UserRepository {
  return {
    findById: jest.fn(),
    update: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    getDashboardStats: jest.fn(),
    findAllRoles: jest.fn(),
    ...overrides,
  };
}

describe('GetDashboardStatsUseCase', () => {
  describe('정상적으로 통계 데이터를 반환하는 경우', () => {
    it('status가 success이고 stats에 전체 사용자 수, 관리자 수, 일반 사용자 수를 포함해야 한다', async () => {
      const mockStats: DashboardStats = {
        totalUsers: 10,
        adminCount: 2,
        userCount: 8,
      };
      const mockRepo = createMockUserRepository({
        getDashboardStats: jest.fn().mockResolvedValue(mockStats),
      });
      const useCase = new GetDashboardStatsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result).toEqual({
        status: 'success',
        stats: {
          totalUsers: 10,
          adminCount: 2,
          userCount: 8,
        },
      });
    });

    it('UserRepository.getDashboardStats가 정확히 한 번 호출되어야 한다', async () => {
      const mockStats: DashboardStats = {
        totalUsers: 5,
        adminCount: 1,
        userCount: 4,
      };
      const mockGetDashboardStats = jest.fn().mockResolvedValue(mockStats);
      const mockRepo = createMockUserRepository({
        getDashboardStats: mockGetDashboardStats,
      });
      const useCase = new GetDashboardStatsUseCase(mockRepo);

      await useCase.execute();

      expect(mockGetDashboardStats).toHaveBeenCalledTimes(1);
    });

    it('사용자가 0명인 경우에도 정상적으로 통계를 반환해야 한다', async () => {
      const emptyStats: DashboardStats = {
        totalUsers: 0,
        adminCount: 0,
        userCount: 0,
      };
      const mockRepo = createMockUserRepository({
        getDashboardStats: jest.fn().mockResolvedValue(emptyStats),
      });
      const useCase = new GetDashboardStatsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.stats.totalUsers).toBe(0);
        expect(result.stats.adminCount).toBe(0);
        expect(result.stats.userCount).toBe(0);
      }
    });
  });

  describe('Repository가 에러를 throw하는 경우', () => {
    it('status가 error이고 code가 fetch_failed인 결과를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        getDashboardStats: jest.fn().mockRejectedValue(new Error('Supabase 통신 실패')),
      });
      const useCase = new GetDashboardStatsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('fetch_failed');
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('에러 메시지에 원본 에러 정보가 포함되어야 한다', async () => {
      const originalError = new Error('Connection timeout');
      const mockRepo = createMockUserRepository({
        getDashboardStats: jest.fn().mockRejectedValue(originalError),
      });
      const useCase = new GetDashboardStatsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('fetch_failed');
        expect(result.message).toContain('Connection timeout');
      }
    });

    it('Error가 아닌 값이 throw된 경우에도 fetch_failed를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        getDashboardStats: jest.fn().mockRejectedValue('문자열 에러'),
      });
      const useCase = new GetDashboardStatsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('fetch_failed');
        expect(typeof result.message).toBe('string');
      }
    });
  });

  describe('execute() 반환값 타입 검증', () => {
    it('반환값은 status 필드를 가져야 한다', async () => {
      const mockStats: DashboardStats = {
        totalUsers: 3,
        adminCount: 1,
        userCount: 2,
      };
      const mockRepo = createMockUserRepository({
        getDashboardStats: jest.fn().mockResolvedValue(mockStats),
      });
      const useCase = new GetDashboardStatsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result).toHaveProperty('status');
    });
  });
});
