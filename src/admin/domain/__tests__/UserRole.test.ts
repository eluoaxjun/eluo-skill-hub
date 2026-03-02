import { UserRole } from '../value-objects/UserRole';

describe('UserRole', () => {
  it("create('admin') → UserRole 인스턴스 반환", () => {
    const role = UserRole.create('admin');
    expect(role).toBeInstanceOf(UserRole);
    expect(role.value).toBe('admin');
  });

  it("create('user') → UserRole 인스턴스 반환", () => {
    const role = UserRole.create('user');
    expect(role).toBeInstanceOf(UserRole);
    expect(role.value).toBe('user');
  });

  it("create('unknown') → Error('Invalid role: unknown') throw", () => {
    expect(() => UserRole.create('unknown')).toThrow('Invalid role: unknown');
  });

  it("create('ADMIN') → Error throw (대소문자 구분)", () => {
    expect(() => UserRole.create('ADMIN')).toThrow();
  });

  it('.value getter → 올바른 값 반환', () => {
    expect(UserRole.create('admin').value).toBe('admin');
    expect(UserRole.create('user').value).toBe('user');
  });

  it('equals(other) → 동일 값이면 true', () => {
    const role1 = UserRole.create('admin');
    const role2 = UserRole.create('admin');
    expect(role1.equals(role2)).toBe(true);
  });

  it('equals(other) → 다른 값이면 false', () => {
    const admin = UserRole.create('admin');
    const user = UserRole.create('user');
    expect(admin.equals(user)).toBe(false);
  });
});
