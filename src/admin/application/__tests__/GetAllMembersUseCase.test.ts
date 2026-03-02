import { GetAllMembersUseCase } from '../GetAllMembersUseCase';
import { MemberProfile } from '@/admin/domain/entities/MemberProfile';
import type { MemberRepository } from '../ports/MemberRepository';

const mockRoles = [
  { id: 'role-001', name: 'user' },
  { id: 'role-002', name: 'admin' },
];

const mockMembers = [
  MemberProfile.create({
    id: 'user-001',
    email: 'a@example.com',
    roleId: 'role-001',
    roleName: 'user',
    createdAt: new Date('2026-01-01'),
  }),
];

function createMockRepository(overrides?: Partial<MemberRepository>): MemberRepository {
  return {
    findAll: jest.fn().mockResolvedValue(mockMembers),
    updateRole: jest.fn().mockResolvedValue(undefined),
    findAllRoles: jest.fn().mockResolvedValue(mockRoles),
    ...overrides,
  };
}

describe('GetAllMembersUseCase', () => {
  it('execute() → { members, roles } 반환', async () => {
    const repository = createMockRepository();
    const useCase = new GetAllMembersUseCase(repository);

    const result = await useCase.execute();

    expect(result.members).toEqual(mockMembers);
    expect(result.roles).toEqual(mockRoles);
  });

  it('findAll()과 findAllRoles()가 각각 호출된다', async () => {
    const repository = createMockRepository();
    const useCase = new GetAllMembersUseCase(repository);

    await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAllRoles).toHaveBeenCalledTimes(1);
  });

  it('빈 회원 목록 반환 시 { members: [], roles: [...] } 정상 처리', async () => {
    const repository = createMockRepository({
      findAll: jest.fn().mockResolvedValue([]),
    });
    const useCase = new GetAllMembersUseCase(repository);

    const result = await useCase.execute();

    expect(result.members).toEqual([]);
    expect(result.roles).toEqual(mockRoles);
  });
});
