import {
  GetCurrentUserRoleUseCase,
  type GetCurrentUserRoleInput,
  type GetCurrentUserRoleResult,
} from '@/user-account/application/GetCurrentUserRoleUseCase';
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

describe('GetCurrentUserRoleUseCase', () => {
  describe('성공 시나리오', () => {
    it('존재하는 사용자의 역할을 성공적으로 조회하여 반환해야 한다', async () => {
      const userId = 'user-123-uuid';
      const userProfile = UserProfile.create({
        id: userId,
        email: 'user@eluocnc.com',
        roleName: 'user',
        createdAt: new Date('2026-01-01'),
      });
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(userProfile),
      });
      const useCase = new GetCurrentUserRoleUseCase(mockRepo);

      const result = await useCase.execute({ userId });

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.role.equals(UserRole.fromName('user'))).toBe(true);
      }
    });

    it('관리자 역할을 가진 사용자의 역할을 정확히 반환해야 한다', async () => {
      const userId = 'admin-456-uuid';
      const adminProfile = UserProfile.create({
        id: userId,
        email: 'admin@eluocnc.com',
        roleName: 'admin',
        createdAt: new Date('2026-01-01'),
      });
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(adminProfile),
      });
      const useCase = new GetCurrentUserRoleUseCase(mockRepo);

      const result = await useCase.execute({ userId });

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.role.isAdmin()).toBe(true);
        expect(result.role.equals(UserRole.fromName('admin'))).toBe(true);
      }
    });

    it('UserRepository.findById가 올바른 userId로 호출되어야 한다', async () => {
      const userId = 'user-789-uuid';
      const userProfile = UserProfile.create({
        id: userId,
        email: 'test@eluocnc.com',
        roleName: 'user',
        createdAt: new Date('2026-01-01'),
      });
      const mockFindById = jest.fn().mockResolvedValue(userProfile);
      const mockRepo = createMockUserRepository({ findById: mockFindById });
      const useCase = new GetCurrentUserRoleUseCase(mockRepo);

      await useCase.execute({ userId });

      expect(mockFindById).toHaveBeenCalledTimes(1);
      expect(mockFindById).toHaveBeenCalledWith(userId);
    });
  });

  describe('사용자 미존재 시나리오', () => {
    it('사용자가 존재하지 않을 경우 user_not_found 에러를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(null),
      });
      const useCase = new GetCurrentUserRoleUseCase(mockRepo);

      const result = await useCase.execute({ userId: 'nonexistent-user-id' });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('user_not_found');
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('execute() 반환값 타입 검증', () => {
    it('성공 시 반환값은 status와 role 필드를 포함해야 한다', async () => {
      const userProfile = UserProfile.create({
        id: 'user-type-check',
        email: 'type@eluocnc.com',
        roleName: 'user',
        createdAt: new Date('2026-01-01'),
      });
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(userProfile),
      });
      const useCase = new GetCurrentUserRoleUseCase(mockRepo);

      const result = await useCase.execute({ userId: 'user-type-check' });

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result).toHaveProperty('role');
        expect(result.role).toBeInstanceOf(UserRole);
      }
    });

    it('에러 시 반환값은 status, code, message 필드를 포함해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(null),
      });
      const useCase = new GetCurrentUserRoleUseCase(mockRepo);

      const result = await useCase.execute({ userId: 'nonexistent-id' });

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('message');
    });
  });
});
