import { SupabaseUserRepository } from '@/user-account/infrastructure/SupabaseUserRepository';
import { UserProfile } from '@/user-account/domain/UserProfile';
import { UserRole } from '@/user-account/domain/UserRole';
import type { DashboardStats } from '@/user-account/domain/UserRepository';
import type { SupabaseClient } from '@supabase/supabase-js';

const ADMIN_ROLE_ID = 'a0000000-0000-0000-0000-000000000001';
const USER_ROLE_ID = 'a0000000-0000-0000-0000-000000000002';

function createMockSupabaseClient(overrides?: {
  select?: jest.Mock;
  update?: jest.Mock;
}): SupabaseClient {
  const mockSingle = jest.fn();
  const mockEqForSelect = jest.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = (overrides?.select ?? jest.fn()).mockReturnValue({
    eq: mockEqForSelect,
  });

  const mockEqForUpdate = jest.fn();
  const mockUpdate = (overrides?.update ?? jest.fn()).mockReturnValue({
    eq: mockEqForUpdate,
  });

  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
  });

  return {
    from: mockFrom,
    _mocks: { mockFrom, mockSelect, mockEqForSelect, mockSingle, mockUpdate, mockEqForUpdate },
  } as unknown as SupabaseClient & { _mocks: Record<string, jest.Mock> };
}

describe('SupabaseUserRepository', () => {
  describe('findById()', () => {
    it('프로필이 존재하면 UserProfile 엔티티를 반환해야 한다', async () => {
      const profileData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@eluocnc.com',
        role_id: USER_ROLE_ID,
        created_at: '2026-01-15T09:00:00Z',
        roles: { id: USER_ROLE_ID, name: 'user' },
      };

      const client = createMockSupabaseClient();
      const mocks = (client as unknown as { _mocks: Record<string, jest.Mock> })._mocks;
      mocks.mockSingle.mockResolvedValue({ data: profileData, error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findById(profileData.id);

      expect(result).toBeInstanceOf(UserProfile);
      expect(result?.id).toBe(profileData.id);
      expect(result?.email).toBe(profileData.email);
      expect(result?.role.toString()).toBe('user');
      expect(result?.role.id).toBe(USER_ROLE_ID);
      expect(result?.createdAt).toEqual(new Date(profileData.created_at));
    });

    it('프로필이 존재하지 않으면 null을 반환해야 한다', async () => {
      const client = createMockSupabaseClient();
      const mocks = (client as unknown as { _mocks: Record<string, jest.Mock> })._mocks;
      mocks.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('profiles 테이블에서 roles JOIN으로 id로 조회해야 한다', async () => {
      const targetId = '550e8400-e29b-41d4-a716-446655440000';
      const client = createMockSupabaseClient();
      const mocks = (client as unknown as { _mocks: Record<string, jest.Mock> })._mocks;
      mocks.mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const repository = new SupabaseUserRepository(client);
      await repository.findById(targetId);

      expect(mocks.mockFrom).toHaveBeenCalledWith('profiles');
      expect(mocks.mockSelect).toHaveBeenCalledWith('*, roles(id, name)');
      expect(mocks.mockEqForSelect).toHaveBeenCalledWith('id', targetId);
    });
  });

  describe('update()', () => {
    it('프로필 데이터를 role_id와 함께 전달해야 한다', async () => {
      const profile = UserProfile.create({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'updated@eluocnc.com',
        roleId: USER_ROLE_ID,
        roleName: 'user',
        createdAt: new Date('2026-01-15T09:00:00Z'),
      });

      const client = createMockSupabaseClient();
      const mocks = (client as unknown as { _mocks: Record<string, jest.Mock> })._mocks;
      mocks.mockEqForUpdate.mockResolvedValue({ error: null });

      const repository = new SupabaseUserRepository(client);
      await repository.update(profile);

      expect(mocks.mockFrom).toHaveBeenCalledWith('profiles');
      expect(mocks.mockUpdate).toHaveBeenCalledWith({
        email: 'updated@eluocnc.com',
        role_id: USER_ROLE_ID,
      });
      expect(mocks.mockEqForUpdate).toHaveBeenCalledWith('id', profile.id);
    });

    it('Supabase가 에러를 반환하면 예외를 발생시켜야 한다', async () => {
      const profile = UserProfile.create({
        id: 'nonexistent-id',
        email: 'user@eluocnc.com',
        roleId: USER_ROLE_ID,
        roleName: 'user',
        createdAt: new Date(),
      });

      const client = createMockSupabaseClient();
      const mocks = (client as unknown as { _mocks: Record<string, jest.Mock> })._mocks;
      mocks.mockEqForUpdate.mockResolvedValue({
        error: { message: 'Row not found' },
      });

      const repository = new SupabaseUserRepository(client);

      await expect(repository.update(profile)).rejects.toThrow('프로필 수정에 실패했습니다');
    });

    it('update 성공 시 void를 반환해야 한다', async () => {
      const profile = UserProfile.create({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@eluocnc.com',
        roleId: USER_ROLE_ID,
        roleName: 'user',
        createdAt: new Date(),
      });

      const client = createMockSupabaseClient();
      const mocks = (client as unknown as { _mocks: Record<string, jest.Mock> })._mocks;
      mocks.mockEqForUpdate.mockResolvedValue({ error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.update(profile);

      expect(result).toBeUndefined();
    });
  });

  describe('findByEmail()', () => {
    function createFindByEmailMock() {
      const mockSingle = jest.fn();
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      const client = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      return { client, mocks: { mockFrom, mockSelect, mockEq, mockSingle } };
    }

    it('이메일로 프로필을 조회하여 UserProfile을 반환해야 한다', async () => {
      const profileData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@eluocnc.com',
        role_id: ADMIN_ROLE_ID,
        created_at: '2026-01-15T09:00:00Z',
        roles: { id: ADMIN_ROLE_ID, name: 'admin' },
      };

      const { client, mocks } = createFindByEmailMock();
      mocks.mockSingle.mockResolvedValue({ data: profileData, error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findByEmail('admin@eluocnc.com');

      expect(result).toBeInstanceOf(UserProfile);
      expect(result?.id).toBe(profileData.id);
      expect(result?.email).toBe(profileData.email);
      expect(result?.role.isAdmin()).toBe(true);
      expect(result?.role.id).toBe(ADMIN_ROLE_ID);
      expect(result?.createdAt).toEqual(new Date(profileData.created_at));
    });

    it('존재하지 않는 이메일이면 null을 반환해야 한다', async () => {
      const { client, mocks } = createFindByEmailMock();
      mocks.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findByEmail('nonexistent@eluocnc.com');

      expect(result).toBeNull();
    });

    it('profiles 테이블에서 roles JOIN으로 email로 조회해야 한다', async () => {
      const targetEmail = 'admin@eluocnc.com';
      const { client, mocks } = createFindByEmailMock();
      mocks.mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const repository = new SupabaseUserRepository(client);
      await repository.findByEmail(targetEmail);

      expect(mocks.mockFrom).toHaveBeenCalledWith('profiles');
      expect(mocks.mockSelect).toHaveBeenCalledWith('*, roles(id, name)');
      expect(mocks.mockEq).toHaveBeenCalledWith('email', targetEmail);
    });
  });

  describe('findAll()', () => {
    function createFindAllMock() {
      const mockSelect = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      const client = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      return { client, mocks: { mockFrom, mockSelect } };
    }

    it('전체 사용자 목록을 UserProfile 배열로 반환해야 한다', async () => {
      const profilesData = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'admin@eluocnc.com',
          role_id: ADMIN_ROLE_ID,
          created_at: '2026-01-10T09:00:00Z',
          roles: { id: ADMIN_ROLE_ID, name: 'admin' },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'user1@eluocnc.com',
          role_id: USER_ROLE_ID,
          created_at: '2026-01-15T09:00:00Z',
          roles: { id: USER_ROLE_ID, name: 'user' },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          email: 'user2@eluocnc.com',
          role_id: USER_ROLE_ID,
          created_at: '2026-01-20T09:00:00Z',
          roles: { id: USER_ROLE_ID, name: 'user' },
        },
      ];

      const { client, mocks } = createFindAllMock();
      mocks.mockSelect.mockResolvedValue({ data: profilesData, error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findAll();

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(UserProfile);
      expect(result[0].email).toBe('admin@eluocnc.com');
      expect(result[0].role.isAdmin()).toBe(true);
      expect(result[1].email).toBe('user1@eluocnc.com');
      expect(result[1].role.isAdmin()).toBe(false);
      expect(result[2].email).toBe('user2@eluocnc.com');
    });

    it('데이터가 없으면 빈 배열을 반환해야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockSelect.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });

    it('data가 null이면 빈 배열을 반환해야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockSelect.mockResolvedValue({ data: null, error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });

    it('Supabase가 에러를 반환하면 예외를 발생시켜야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockSelect.mockResolvedValue({
        data: null,
        error: { message: 'permission denied' },
      });

      const repository = new SupabaseUserRepository(client);

      await expect(repository.findAll()).rejects.toThrow('사용자 목록 조회에 실패했습니다');
    });

    it('profiles 테이블에서 roles JOIN으로 전체 조회해야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockSelect.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseUserRepository(client);
      await repository.findAll();

      expect(mocks.mockFrom).toHaveBeenCalledWith('profiles');
      expect(mocks.mockSelect).toHaveBeenCalledWith('*, roles(id, name)');
    });
  });

  describe('getDashboardStats()', () => {
    function createGetDashboardStatsMock() {
      const mockSelect = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      const client = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      return { client, mocks: { mockFrom, mockSelect } };
    }

    it('역할별 사용자 수 통계를 반환해야 한다', async () => {
      const rolesData = [
        { roles: { name: 'admin' } },
        { roles: { name: 'user' } },
        { roles: { name: 'user' } },
        { roles: { name: 'user' } },
      ];

      const { client, mocks } = createGetDashboardStatsMock();
      mocks.mockSelect.mockResolvedValue({ data: rolesData, error: null });

      const repository = new SupabaseUserRepository(client);
      const result: DashboardStats = await repository.getDashboardStats();

      expect(result.totalUsers).toBe(4);
      expect(result.adminCount).toBe(1);
      expect(result.userCount).toBe(3);
    });

    it('사용자가 없으면 모든 카운트가 0이어야 한다', async () => {
      const { client, mocks } = createGetDashboardStatsMock();
      mocks.mockSelect.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.getDashboardStats();

      expect(result.totalUsers).toBe(0);
      expect(result.adminCount).toBe(0);
      expect(result.userCount).toBe(0);
    });

    it('data가 null이면 모든 카운트가 0이어야 한다', async () => {
      const { client, mocks } = createGetDashboardStatsMock();
      mocks.mockSelect.mockResolvedValue({ data: null, error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.getDashboardStats();

      expect(result.totalUsers).toBe(0);
      expect(result.adminCount).toBe(0);
      expect(result.userCount).toBe(0);
    });

    it('Supabase가 에러를 반환하면 예외를 발생시켜야 한다', async () => {
      const { client, mocks } = createGetDashboardStatsMock();
      mocks.mockSelect.mockResolvedValue({
        data: null,
        error: { message: 'connection refused' },
      });

      const repository = new SupabaseUserRepository(client);

      await expect(repository.getDashboardStats()).rejects.toThrow(
        '대시보드 통계 조회에 실패했습니다'
      );
    });

    it('profiles 테이블에서 roles(name) JOIN으로 조회해야 한다', async () => {
      const { client, mocks } = createGetDashboardStatsMock();
      mocks.mockSelect.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseUserRepository(client);
      await repository.getDashboardStats();

      expect(mocks.mockFrom).toHaveBeenCalledWith('profiles');
      expect(mocks.mockSelect).toHaveBeenCalledWith('roles(name)');
    });

    it('모든 사용자가 관리자인 경우 userCount가 0이어야 한다', async () => {
      const rolesData = [
        { roles: { name: 'admin' } },
        { roles: { name: 'admin' } },
      ];

      const { client, mocks } = createGetDashboardStatsMock();
      mocks.mockSelect.mockResolvedValue({ data: rolesData, error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.getDashboardStats();

      expect(result.totalUsers).toBe(2);
      expect(result.adminCount).toBe(2);
      expect(result.userCount).toBe(0);
    });
  });

  describe('findAllRoles()', () => {
    function createFindAllRolesMock() {
      const mockSelect = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      const client = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      return { client, mocks: { mockFrom, mockSelect } };
    }

    it('역할 목록을 UserRole 배열로 반환해야 한다', async () => {
      const rolesData = [
        { id: ADMIN_ROLE_ID, name: 'admin' },
        { id: USER_ROLE_ID, name: 'user' },
      ];

      const { client, mocks } = createFindAllRolesMock();
      mocks.mockSelect.mockResolvedValue({ data: rolesData, error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findAllRoles();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserRole);
      expect(result[0].isAdmin()).toBe(true);
      expect(result[0].id).toBe(ADMIN_ROLE_ID);
      expect(result[1].toString()).toBe('user');
      expect(result[1].id).toBe(USER_ROLE_ID);
    });

    it('roles 테이블에서 id, name을 조회해야 한다', async () => {
      const { client, mocks } = createFindAllRolesMock();
      mocks.mockSelect.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseUserRepository(client);
      await repository.findAllRoles();

      expect(mocks.mockFrom).toHaveBeenCalledWith('roles');
      expect(mocks.mockSelect).toHaveBeenCalledWith('id, name');
    });

    it('Supabase가 에러를 반환하면 예외를 발생시켜야 한다', async () => {
      const { client, mocks } = createFindAllRolesMock();
      mocks.mockSelect.mockResolvedValue({
        data: null,
        error: { message: 'permission denied' },
      });

      const repository = new SupabaseUserRepository(client);

      await expect(repository.findAllRoles()).rejects.toThrow('역할 목록 조회에 실패했습니다');
    });

    it('데이터가 없으면 빈 배열을 반환해야 한다', async () => {
      const { client, mocks } = createFindAllRolesMock();
      mocks.mockSelect.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseUserRepository(client);
      const result = await repository.findAllRoles();

      expect(result).toHaveLength(0);
    });
  });
});
