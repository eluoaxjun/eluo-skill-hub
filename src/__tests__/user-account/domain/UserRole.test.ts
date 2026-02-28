import { UserRole } from '@/user-account/domain/UserRole';

describe('UserRole 값 객체', () => {
  const TEST_ID = 'test-role-id';
  const ADMIN_ID = 'admin-role-id';
  const USER_ID = 'user-role-id';

  describe('create(id, name)', () => {
    describe('유효한 역할 값 생성 성공', () => {
      it("'user' 값으로 UserRole 인스턴스를 생성할 수 있어야 한다", () => {
        const role = UserRole.create(TEST_ID, 'user');
        expect(role).toBeInstanceOf(UserRole);
      });

      it("'admin' 값으로 UserRole 인스턴스를 생성할 수 있어야 한다", () => {
        const role = UserRole.create(TEST_ID, 'admin');
        expect(role).toBeInstanceOf(UserRole);
      });

      it("생성된 역할의 id를 반환해야 한다", () => {
        const role = UserRole.create(TEST_ID, 'user');
        expect(role.id).toBe(TEST_ID);
      });

      it("생성된 'user' 역할의 toString()이 'user'를 반환해야 한다", () => {
        const role = UserRole.create(TEST_ID, 'user');
        expect(role.toString()).toBe('user');
      });

      it("생성된 'admin' 역할의 toString()이 'admin'을 반환해야 한다", () => {
        const role = UserRole.create(TEST_ID, 'admin');
        expect(role.toString()).toBe('admin');
      });
    });

    describe('유효하지 않은 역할 값 거부', () => {
      it("빈 문자열 이름으로 생성 시 에러를 발생시켜야 한다", () => {
        expect(() => UserRole.create(TEST_ID, '')).toThrow();
      });

      it("'moderator' 같은 존재하지 않는 역할 값으로 생성 시 에러를 발생시켜야 한다", () => {
        expect(() => UserRole.create(TEST_ID, 'moderator')).toThrow();
      });

      it("에러 메시지에 유효하지 않은 역할 값 정보가 포함되어야 한다", () => {
        expect(() => UserRole.create(TEST_ID, 'invalid')).toThrow(
          /유효하지 않은 역할/
        );
      });
    });
  });

  describe('fromName()', () => {
    it("이름만으로 UserRole을 생성할 수 있어야 한다", () => {
      const role = UserRole.fromName('admin');
      expect(role).toBeInstanceOf(UserRole);
      expect(role.toString()).toBe('admin');
      expect(role.id).toBe('');
    });

    it("유효하지 않은 이름은 거부해야 한다", () => {
      expect(() => UserRole.fromName('invalid')).toThrow();
    });
  });

  describe('팩토리 메서드', () => {
    it("user(id)가 'user' 역할을 가진 인스턴스를 반환해야 한다", () => {
      const role = UserRole.user(USER_ID);
      expect(role.toString()).toBe('user');
      expect(role.id).toBe(USER_ID);
    });

    it("admin(id)이 'admin' 역할을 가진 인스턴스를 반환해야 한다", () => {
      const role = UserRole.admin(ADMIN_ID);
      expect(role.toString()).toBe('admin');
      expect(role.id).toBe(ADMIN_ID);
    });
  });

  describe('isAdmin()', () => {
    it("'admin' 역할에 대해 true를 반환해야 한다", () => {
      const role = UserRole.create(ADMIN_ID, 'admin');
      expect(role.isAdmin()).toBe(true);
    });

    it("'user' 역할에 대해 false를 반환해야 한다", () => {
      const role = UserRole.create(USER_ID, 'user');
      expect(role.isAdmin()).toBe(false);
    });
  });

  describe('equals()', () => {
    it("동일한 id를 가진 두 인스턴스는 동등해야 한다", () => {
      const role1 = UserRole.create(TEST_ID, 'user');
      const role2 = UserRole.create(TEST_ID, 'user');
      expect(role1.equals(role2)).toBe(true);
    });

    it("다른 id를 가진 두 인스턴스는 동등하지 않아야 한다", () => {
      const role1 = UserRole.create('id-1', 'user');
      const role2 = UserRole.create('id-2', 'user');
      expect(role1.equals(role2)).toBe(false);
    });

    it("id가 없는 경우 name으로 비교해야 한다", () => {
      const role1 = UserRole.fromName('admin');
      const role2 = UserRole.fromName('admin');
      expect(role1.equals(role2)).toBe(true);
    });

    it("id가 없고 name이 다른 경우 동등하지 않아야 한다", () => {
      const role1 = UserRole.fromName('user');
      const role2 = UserRole.fromName('admin');
      expect(role1.equals(role2)).toBe(false);
    });
  });

  describe('불변성', () => {
    it("생성 후 toString() 값이 변하지 않아야 한다", () => {
      const role = UserRole.create(ADMIN_ID, 'admin');
      expect(role.toString()).toBe('admin');
      expect(role.toString()).toBe('admin');
    });

    it("생성 후 id 값이 변하지 않아야 한다", () => {
      const role = UserRole.create(TEST_ID, 'admin');
      expect(role.id).toBe(TEST_ID);
      expect(role.id).toBe(TEST_ID);
    });
  });
});
