import { MemberProfile } from '../entities/MemberProfile';

const baseProps = {
  id: 'user-001',
  email: 'test@example.com',
  roleId: 'role-001',
  roleName: 'user',
  createdAt: new Date('2026-01-01'),
};

describe('MemberProfile', () => {
  it('create(props) → MemberProfile 인스턴스 반환', () => {
    const member = MemberProfile.create(baseProps);
    expect(member).toBeInstanceOf(MemberProfile);
  });

  it('getter: email 정상 반환', () => {
    const member = MemberProfile.create(baseProps);
    expect(member.email).toBe('test@example.com');
  });

  it('getter: roleId 정상 반환', () => {
    const member = MemberProfile.create(baseProps);
    expect(member.roleId).toBe('role-001');
  });

  it('getter: roleName 정상 반환', () => {
    const member = MemberProfile.create(baseProps);
    expect(member.roleName).toBe('user');
  });

  it('getter: createdAt 정상 반환', () => {
    const member = MemberProfile.create(baseProps);
    expect(member.createdAt).toEqual(new Date('2026-01-01'));
  });

  it('changeRole(newRoleId, newRoleName) → 새로운 MemberProfile 인스턴스 반환 (원본 불변)', () => {
    const original = MemberProfile.create(baseProps);
    const updated = original.changeRole('role-002', 'admin');
    expect(updated).toBeInstanceOf(MemberProfile);
    expect(updated).not.toBe(original);
  });

  it('changeRole 후 .roleId, .roleName 변경 확인', () => {
    const original = MemberProfile.create(baseProps);
    const updated = original.changeRole('role-002', 'admin');
    expect(updated.roleId).toBe('role-002');
    expect(updated.roleName).toBe('admin');
  });

  it('changeRole 후 원본의 .roleId, .roleName 불변 확인', () => {
    const original = MemberProfile.create(baseProps);
    original.changeRole('role-002', 'admin');
    expect(original.roleId).toBe('role-001');
    expect(original.roleName).toBe('user');
  });
});
