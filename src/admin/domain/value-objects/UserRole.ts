const VALID_ROLES = ['admin', 'user'] as const;
type RoleName = typeof VALID_ROLES[number];

export class UserRole {
  private constructor(private readonly _value: RoleName) {}

  static create(value: string): UserRole {
    if (!VALID_ROLES.includes(value as RoleName)) {
      throw new Error(`Invalid role: ${value}`);
    }
    return new UserRole(value as RoleName);
  }

  get value(): RoleName {
    return this._value;
  }

  equals(other: UserRole): boolean {
    return this._value === other._value;
  }
}
