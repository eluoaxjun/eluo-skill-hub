import { GetAllUsersUseCase } from '@/user-account/application/GetAllUsersUseCase';
import type { GetAllUsersResult } from '@/user-account/application/GetAllUsersUseCase';
import type { UserRepository } from '@/user-account/domain/UserRepository';
import { UserProfile } from '@/user-account/domain/UserProfile';
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

/**
 * 테스트용 UserProfile 생성 헬퍼
 */
function createTestUserProfile(params: {
  id: string;
  email: string;
  roleName?: string;
  createdAt?: Date;
}): UserProfile {
  return UserProfile.create({
    id: params.id,
    email: params.email,
    roleName: params.roleName ?? 'user',
    createdAt: params.createdAt ?? new Date('2026-01-15T00:00:00Z'),
  });
}

describe('GetAllUsersUseCase', () => {
  describe('정상적으로 사용자 목록을 반환하는 경우', () => {
    it('status가 success이고 users 배열에 전체 사용자 목록이 포함되어야 한다', async () => {
      const users: ReadonlyArray<UserProfile> = [
        createTestUserProfile({
          id: 'user-1',
          email: 'admin@eluocnc.com',
          roleName: 'admin',
        }),
        createTestUserProfile({
          id: 'user-2',
          email: 'user@eluocnc.com',
          roleName: 'user',
        }),
        createTestUserProfile({
          id: 'user-3',
          email: 'another@eluocnc.com',
          roleName: 'user',
        }),
      ];
      const mockRepo = createMockUserRepository({
        findAll: jest.fn().mockResolvedValue(users),
      });
      const useCase = new GetAllUsersUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.users).toHaveLength(3);
        expect(result.users[0].email).toBe('admin@eluocnc.com');
        expect(result.users[0].role.isAdmin()).toBe(true);
        expect(result.users[1].email).toBe('user@eluocnc.com');
        expect(result.users[1].role.isAdmin()).toBe(false);
      }
    });

    it('UserRepository.findAll이 정확히 한 번 호출되어야 한다', async () => {
      const mockFindAll = jest.fn().mockResolvedValue([]);
      const mockRepo = createMockUserRepository({ findAll: mockFindAll });
      const useCase = new GetAllUsersUseCase(mockRepo);

      await useCase.execute();

      expect(mockFindAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('빈 배열을 반환하는 경우', () => {
    it('status가 success이고 users가 빈 배열이어야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAll: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetAllUsersUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.users).toHaveLength(0);
        expect(result.users).toEqual([]);
      }
    });
  });

  describe('Repository가 에러를 throw하는 경우', () => {
    it('status가 error이고 code가 fetch_failed인 결과를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAll: jest.fn().mockRejectedValue(new Error('Supabase 연결 실패')),
      });
      const useCase = new GetAllUsersUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('fetch_failed');
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('에러 메시지에 원본 에러 정보가 포함되어야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAll: jest
          .fn()
          .mockRejectedValue(new Error('네트워크 타임아웃 발생')),
      });
      const useCase = new GetAllUsersUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('fetch_failed');
        expect(result.message).toContain('네트워크 타임아웃 발생');
      }
    });

    it('에러가 Error 인스턴스가 아닌 경우에도 fetch_failed를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAll: jest.fn().mockRejectedValue('문자열 에러'),
      });
      const useCase = new GetAllUsersUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('fetch_failed');
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('반환값 타입 검증', () => {
    it('반환값은 GetAllUsersResult 타입이어야 한다 (status 필드 존재)', async () => {
      const mockRepo = createMockUserRepository({
        findAll: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetAllUsersUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result).toHaveProperty('status');
    });

    it('성공 시 반환값에 users 필드가 존재해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findAll: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetAllUsersUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result).toHaveProperty('users');
        expect(Array.isArray(result.users)).toBe(true);
      }
    });
  });
});
