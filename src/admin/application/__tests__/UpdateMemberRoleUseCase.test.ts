import { UpdateMemberRoleUseCase } from '../UpdateMemberRoleUseCase';
import type { MemberRepository } from '../ports/MemberRepository';

function createMockRepository(overrides?: Partial<MemberRepository>): MemberRepository {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    updateRole: jest.fn().mockResolvedValue(undefined),
    findAllRoles: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('UpdateMemberRoleUseCase', () => {
  it('다른 사용자의 역할 변경 → 정상 완료, repository.updateRole 호출', async () => {
    const repository = createMockRepository();
    const useCase = new UpdateMemberRoleUseCase(repository);

    await useCase.execute({
      targetUserId: 'user-A',
      newRoleId: 'role-001',
      requestingUserId: 'user-B',
    });

    expect(repository.updateRole).toHaveBeenCalledWith('user-A', 'role-001');
  });

  it('자기 자신의 역할 변경 → Error throw', async () => {
    const repository = createMockRepository();
    const useCase = new UpdateMemberRoleUseCase(repository);

    await expect(
      useCase.execute({
        targetUserId: 'user-A',
        newRoleId: 'role-001',
        requestingUserId: 'user-A',
      })
    ).rejects.toThrow('자기 자신의 역할은 변경할 수 없습니다');
  });

  it('자기 자신인 경우 repository.updateRole이 호출되지 않음', async () => {
    const repository = createMockRepository();
    const useCase = new UpdateMemberRoleUseCase(repository);

    await expect(
      useCase.execute({
        targetUserId: 'user-A',
        newRoleId: 'role-001',
        requestingUserId: 'user-A',
      })
    ).rejects.toThrow();

    expect(repository.updateRole).not.toHaveBeenCalled();
  });
});
