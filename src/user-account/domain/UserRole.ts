export type UserRoleValue = 'user' | 'admin';

const VALID_ROLES: ReadonlyArray<string> = ['user', 'admin'];

export class UserRole {
  private readonly _id: string;
  private readonly _name: UserRoleValue;

  private constructor(id: string, name: UserRoleValue) {
    this._id = id;
    this._name = name;
  }

  static create(id: string, name: string): UserRole {
    if (!VALID_ROLES.includes(name)) {
      throw new Error(
        `유효하지 않은 역할 값입니다: '${name}'. 허용되는 값: ${VALID_ROLES.join(', ')}`
      );
    }
    return new UserRole(id, name as UserRoleValue);
  }

  static fromName(name: string): UserRole {
    if (!VALID_ROLES.includes(name)) {
      throw new Error(
        `유효하지 않은 역할 값입니다: '${name}'. 허용되는 값: ${VALID_ROLES.join(', ')}`
      );
    }
    return new UserRole('', name as UserRoleValue);
  }

  static user(id: string): UserRole {
    return new UserRole(id, 'user');
  }

  static admin(id: string): UserRole {
    return new UserRole(id, 'admin');
  }

  get id(): string {
    return this._id;
  }

  equals(other: UserRole): boolean {
    if (this._id && other._id) {
      return this._id === other._id;
    }
    return this._name === other._name;
  }

  isAdmin(): boolean {
    return this._name === 'admin';
  }

  toString(): UserRoleValue {
    return this._name;
  }
}
