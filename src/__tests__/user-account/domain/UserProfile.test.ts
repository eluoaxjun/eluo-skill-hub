import { UserProfile } from '@/user-account/domain/UserProfile';
import { UserRole } from '@/user-account/domain/UserRole';

describe('UserProfile 엔티티', () => {
  const validParams = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'user@eluocnc.com',
    createdAt: new Date('2026-01-15T09:00:00Z'),
  };

  describe('create()', () => {
    describe('유효한 프로필 생성 성공', () => {
      it('유효한 id, email, createdAt으로 인스턴스를 생성할 수 있어야 한다', () => {
        const profile = UserProfile.create(validParams);
        expect(profile).toBeInstanceOf(UserProfile);
      });

      it('생성된 인스턴스의 id가 입력한 id와 동일해야 한다', () => {
        const profile = UserProfile.create(validParams);
        expect(profile.id).toBe(validParams.id);
      });

      it('생성된 인스턴스의 email getter가 입력한 이메일을 반환해야 한다', () => {
        const profile = UserProfile.create(validParams);
        expect(profile.email).toBe(validParams.email);
      });

      it('생성된 인스턴스의 createdAt getter가 입력한 날짜를 반환해야 한다', () => {
        const profile = UserProfile.create(validParams);
        expect(profile.createdAt).toEqual(validParams.createdAt);
      });

      it('role 파라미터 없이 생성 시 기본 역할이 user여야 한다', () => {
        const profile = UserProfile.create(validParams);
        expect(profile.role.equals(UserRole.fromName('user'))).toBe(true);
        expect(profile.role.toString()).toBe('user');
      });

      it('roleName 파라미터를 admin으로 지정하여 생성할 수 있어야 한다', () => {
        const profile = UserProfile.create({ ...validParams, roleName: 'admin' });
        expect(profile.role.equals(UserRole.fromName('admin'))).toBe(true);
        expect(profile.role.toString()).toBe('admin');
      });

      it('roleName 파라미터를 user로 명시적으로 지정하여 생성할 수 있어야 한다', () => {
        const profile = UserProfile.create({ ...validParams, roleName: 'user' });
        expect(profile.role.equals(UserRole.fromName('user'))).toBe(true);
      });
    });

    describe('잘못된 입력 거부', () => {
      it('빈 id로 생성 시 예외를 발생시켜야 한다', () => {
        expect(() =>
          UserProfile.create({ ...validParams, id: '' })
        ).toThrow('UserProfile id는 비어 있을 수 없습니다');
      });

      it('공백만 있는 id로 생성 시 예외를 발생시켜야 한다', () => {
        expect(() =>
          UserProfile.create({ ...validParams, id: '   ' })
        ).toThrow('UserProfile id는 비어 있을 수 없습니다');
      });

      it('빈 email로 생성 시 예외를 발생시켜야 한다', () => {
        expect(() =>
          UserProfile.create({ ...validParams, email: '' })
        ).toThrow('UserProfile email은 비어 있을 수 없습니다');
      });

      it('공백만 있는 email로 생성 시 예외를 발생시켜야 한다', () => {
        expect(() =>
          UserProfile.create({ ...validParams, email: '   ' })
        ).toThrow('UserProfile email은 비어 있을 수 없습니다');
      });

      it('유효하지 않은 roleName 값으로 생성 시 예외를 발생시켜야 한다', () => {
        expect(() =>
          UserProfile.create({ ...validParams, roleName: 'moderator' })
        ).toThrow();
      });
    });
  });

  describe('reconstruct()', () => {
    it('role을 포함한 프로필 데이터로 인스턴스를 복원할 수 있어야 한다', () => {
      const profile = UserProfile.reconstruct(validParams.id, {
        email: validParams.email,
        role: UserRole.fromName('admin'),
        createdAt: validParams.createdAt,
      });

      expect(profile).toBeInstanceOf(UserProfile);
      expect(profile.id).toBe(validParams.id);
      expect(profile.email).toBe(validParams.email);
      expect(profile.role.equals(UserRole.fromName('admin'))).toBe(true);
      expect(profile.createdAt).toEqual(validParams.createdAt);
    });

    it('reconstruct로 복원한 프로필의 속성이 원본과 동일해야 한다', () => {
      const original = UserProfile.create({ ...validParams, roleName: 'admin' });
      const reconstructed = UserProfile.reconstruct(original.id, {
        email: original.email,
        role: original.role,
        createdAt: original.createdAt,
      });

      expect(reconstructed.id).toBe(original.id);
      expect(reconstructed.email).toBe(original.email);
      expect(reconstructed.role.equals(original.role)).toBe(true);
      expect(reconstructed.createdAt).toEqual(original.createdAt);
    });

    it('user 역할로 복원한 프로필의 role이 user여야 한다', () => {
      const profile = UserProfile.reconstruct(validParams.id, {
        email: validParams.email,
        role: UserRole.fromName('user'),
        createdAt: validParams.createdAt,
      });

      expect(profile.role.equals(UserRole.fromName('user'))).toBe(true);
      expect(profile.role.isAdmin()).toBe(false);
    });
  });

  describe('changeRole()', () => {
    it('user 역할을 admin으로 변경할 수 있어야 한다', () => {
      const profile = UserProfile.create(validParams);
      expect(profile.role.equals(UserRole.fromName('user'))).toBe(true);

      profile.changeRole(UserRole.fromName('admin'));

      expect(profile.role.equals(UserRole.fromName('admin'))).toBe(true);
      expect(profile.role.isAdmin()).toBe(true);
    });

    it('admin 역할을 user로 변경할 수 있어야 한다', () => {
      const profile = UserProfile.create({ ...validParams, roleName: 'admin' });
      expect(profile.role.equals(UserRole.fromName('admin'))).toBe(true);

      profile.changeRole(UserRole.fromName('user'));

      expect(profile.role.equals(UserRole.fromName('user'))).toBe(true);
      expect(profile.role.isAdmin()).toBe(false);
    });

    it('동일한 역할로 변경해도 정상적으로 처리되어야 한다', () => {
      const profile = UserProfile.create(validParams);
      profile.changeRole(UserRole.fromName('user'));
      expect(profile.role.equals(UserRole.fromName('user'))).toBe(true);
    });

    it('역할 변경 후에도 id와 email은 변경되지 않아야 한다', () => {
      const profile = UserProfile.create(validParams);
      profile.changeRole(UserRole.fromName('admin'));

      expect(profile.id).toBe(validParams.id);
      expect(profile.email).toBe(validParams.email);
      expect(profile.createdAt).toEqual(validParams.createdAt);
    });
  });

  describe('role getter', () => {
    it('role getter가 UserRole 인스턴스를 반환해야 한다', () => {
      const profile = UserProfile.create(validParams);
      const role = profile.role;

      expect(role).toBeInstanceOf(UserRole);
    });

    it('admin으로 생성된 프로필의 role.isAdmin()이 true를 반환해야 한다', () => {
      const profile = UserProfile.create({ ...validParams, roleName: 'admin' });
      expect(profile.role.isAdmin()).toBe(true);
    });

    it('기본 역할로 생성된 프로필의 role.isAdmin()이 false를 반환해야 한다', () => {
      const profile = UserProfile.create(validParams);
      expect(profile.role.isAdmin()).toBe(false);
    });
  });
});
