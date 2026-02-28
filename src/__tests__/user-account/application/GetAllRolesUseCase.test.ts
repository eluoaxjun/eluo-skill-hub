import { GetAllRolesUseCase } from '@/user-account/application/GetAllRolesUseCase';
import type { UserRepository } from '@/user-account/domain/UserRepository';
import { UserRole } from '@/user-account/domain/UserRole';

/**
 * UserRepository 모의 객체(mock) 생성 헬퍼
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

describe('GetAllRolesUseCase', () => {
  describe('정상적으로 역할 목록을 반환하는 경우', () => {
    it('status가 success이고 roles 배열에 전체 역할 목록이 포함되어야 한다', async () => {
      const roles: ReadonlyArray<UserRole> = [
        UserRole.create('role-admin-id', 'admin'),
        UserRole.create('role-user-id', 'user'),
      ];
      const mockRepo = createMockUserRepository({
        findAllRoles: jest.fn().mockResolvedValue(roles),
      });
      const useCase = new GetAllRolesUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.roles).toHaveLength(2);
        expect(result.roles[0].isAdmin()).toBe(true);
        expect(result.roles[1].toString()).toBe('user');
      }
    });

    it('UserRepository.findAllRoles가 정확히 한 번 호출되어야 한다', async () => {
      const mockFindAllRoles = jest.fn().mockResolvedValue([]);
      const mockRepo = createMockUserRepository({ findAllRoles: mockFindAllRoles });
      const useCase = new GetAllRolesUseCase(mockRepo);

      await useCase.execute();

      expect(mockFindAllRoles).toHaveBeenCalledTimes(1);
    });

    it('빈 역할 목록도 정상적으로 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAllRoles: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetAllRolesUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.roles).toHaveLength(0);
      }
    });
  });

  describe('Repository가 에러를 throw하는 경우', () => {
    it('status가 error이고 code가 fetch_failed인 결과를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAllRoles: jest.fn().mockRejectedValue(new Error('Supabase 연결 실패')),
      });
      const useCase = new GetAllRolesUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('fetch_failed');
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('에러가 Error 인스턴스가 아닌 경우에도 fetch_failed를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAllRoles: jest.fn().mockRejectedValue('문자열 에러'),
      });
      const useCase = new GetAllRolesUseCase(mockRepo);

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
      const mockRepo = createMockUserRepository({
        findAllRoles: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetAllRolesUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result).toHaveProperty('status');
    });

    it('성공 시 반환값에 roles 필드가 존재해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAllRoles: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetAllRolesUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result).toHaveProperty('roles');
        expect(Array.isArray(result.roles)).toBe(true);
      }
    });
  });
});
