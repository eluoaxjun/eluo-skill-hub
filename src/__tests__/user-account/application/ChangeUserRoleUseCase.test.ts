import {
  ChangeUserRoleUseCase,
  type ChangeUserRoleInput,
  type ChangeUserRoleResult,
} from '@/user-account/application/ChangeUserRoleUseCase';
import type { UserRepository } from '@/user-account/domain/UserRepository';
import { UserProfile } from '@/user-account/domain/UserProfile';
import { UserRole } from '@/user-account/domain/UserRole';

const ADMIN_ROLE_ID = 'role-admin-id';
const USER_ROLE_ID = 'role-user-id';
const MOCK_ROLES: ReadonlyArray<UserRole> = [
  UserRole.create(ADMIN_ROLE_ID, 'admin'),
  UserRole.create(USER_ROLE_ID, 'user'),
];

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
    findAllRoles: jest.fn().mockResolvedValue(MOCK_ROLES),
    ...overrides,
  };
}

/**
 * 테스트용 UserProfile 생성 헬퍼
 */
function createTestProfile(params: {
  id: string;
  email?: string;
  roleName?: string;
  roleId?: string;
}): UserProfile {
  return UserProfile.create({
    id: params.id,
    email: params.email ?? 'test@eluocnc.com',
    roleName: params.roleName ?? 'user',
    roleId: params.roleId ?? USER_ROLE_ID,
    createdAt: new Date('2026-01-01'),
  });
}

describe('ChangeUserRoleUseCase', () => {
  describe('자기 자신의 역할 변경 시도 시', () => {
    it('self_role_change 에러를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository();
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'admin-123',
        newRoleId: USER_ROLE_ID,
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('self_role_change');
        expect(result.message).toBe('본인의 관리자 역할은 변경할 수 없습니다.');
      }
    });

    it('self_role_change 시 repository 메서드가 호출되지 않아야 한다', async () => {
      const mockFindById = jest.fn();
      const mockUpdate = jest.fn();
      const mockFindAllRoles = jest.fn();
      const mockRepo = createMockUserRepository({
        findById: mockFindById,
        update: mockUpdate,
        findAllRoles: mockFindAllRoles,
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      await useCase.execute({
        adminUserId: 'same-user-id',
        targetUserId: 'same-user-id',
        newRoleId: USER_ROLE_ID,
      });

      expect(mockFindById).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockFindAllRoles).not.toHaveBeenCalled();
    });
  });

  describe('잘못된 역할 ID 전달 시', () => {
    it('invalid_role 에러를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository();
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: 'nonexistent-role-id',
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('invalid_role');
        expect(result.message).toBe('유효하지 않은 역할 값입니다.');
      }
    });

    it('빈 문자열 역할 ID에 대해서도 invalid_role 에러를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository();
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: '',
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('invalid_role');
        expect(result.message).toBe('유효하지 않은 역할 값입니다.');
      }
    });
  });

  describe('존재하지 않는 사용자에 대한 역할 변경 시', () => {
    it('user_not_found 에러를 반환해야 한다', async () => {
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(null),
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'nonexistent-user',
        newRoleId: ADMIN_ROLE_ID,
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('user_not_found');
        expect(result.message).toBe('해당 사용자를 찾을 수 없습니다.');
      }
    });

    it('findById가 targetUserId로 호출되어야 한다', async () => {
      const mockFindById = jest.fn().mockResolvedValue(null);
      const mockRepo = createMockUserRepository({
        findById: mockFindById,
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: ADMIN_ROLE_ID,
      });

      expect(mockFindById).toHaveBeenCalledTimes(1);
      expect(mockFindById).toHaveBeenCalledWith('target-456');
    });
  });

  describe('리포지토리 update 실패 시', () => {
    it('update_failed 에러를 반환해야 한다', async () => {
      const targetProfile = createTestProfile({
        id: 'target-456',
        email: 'target@eluocnc.com',
        roleName: 'user',
        roleId: USER_ROLE_ID,
      });
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(targetProfile),
        update: jest.fn().mockRejectedValue(new Error('DB 업데이트 실패')),
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: ADMIN_ROLE_ID,
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.code).toBe('update_failed');
        expect(result.message).toBe('역할 변경에 실패했습니다.');
      }
    });
  });

  describe('정상적인 역할 변경 시', () => {
    it('success 결과를 반환해야 한다', async () => {
      const targetProfile = createTestProfile({
        id: 'target-456',
        email: 'target@eluocnc.com',
        roleName: 'user',
        roleId: USER_ROLE_ID,
      });
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(targetProfile),
        update: jest.fn().mockResolvedValue(undefined),
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: ADMIN_ROLE_ID,
      });

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('changeRole()이 Aggregate Root를 통해 호출되어야 한다', async () => {
      const targetProfile = createTestProfile({
        id: 'target-456',
        email: 'target@eluocnc.com',
        roleName: 'user',
        roleId: USER_ROLE_ID,
      });
      const changeRoleSpy = jest.spyOn(targetProfile, 'changeRole');
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(targetProfile),
        update: jest.fn().mockResolvedValue(undefined),
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: ADMIN_ROLE_ID,
      });

      expect(changeRoleSpy).toHaveBeenCalledTimes(1);
      const calledWithRole = changeRoleSpy.mock.calls[0][0];
      expect(calledWithRole).toBeInstanceOf(UserRole);
      expect(calledWithRole.isAdmin()).toBe(true);
      expect(calledWithRole.id).toBe(ADMIN_ROLE_ID);

      changeRoleSpy.mockRestore();
    });

    it('repository.update()가 변경된 프로필로 호출되어야 한다', async () => {
      const targetProfile = createTestProfile({
        id: 'target-456',
        email: 'target@eluocnc.com',
        roleName: 'user',
        roleId: USER_ROLE_ID,
      });
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(targetProfile),
        update: mockUpdate,
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: ADMIN_ROLE_ID,
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(targetProfile);
      // changeRole이 호출된 후 update가 호출되므로 프로필의 역할이 변경되었어야 한다
      expect(targetProfile.role.isAdmin()).toBe(true);
    });
  });

  describe('execute() 반환값 타입 검증', () => {
    it('성공 시 반환값은 status와 message 필드를 포함해야 한다', async () => {
      const targetProfile = createTestProfile({
        id: 'target-456',
        roleName: 'user',
        roleId: USER_ROLE_ID,
      });
      const mockRepo = createMockUserRepository({
        findById: jest.fn().mockResolvedValue(targetProfile),
        update: jest.fn().mockResolvedValue(undefined),
      });
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'admin-123',
        targetUserId: 'target-456',
        newRoleId: ADMIN_ROLE_ID,
      });

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result.status).toBe('success');
    });

    it('에러 시 반환값은 status, code, message 필드를 포함해야 한다', async () => {
      const mockRepo = createMockUserRepository();
      const useCase = new ChangeUserRoleUseCase(mockRepo);

      const result = await useCase.execute({
        adminUserId: 'same-id',
        targetUserId: 'same-id',
        newRoleId: USER_ROLE_ID,
      });

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('message');
    });
  });
});
