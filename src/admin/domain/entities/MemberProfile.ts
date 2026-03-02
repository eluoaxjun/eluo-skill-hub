import { Entity } from '@/shared/domain/types/Entity';

export interface MemberProfileProps {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  createdAt: Date;
}

export class MemberProfile extends Entity<string> {
  private readonly _email: string;
  private readonly _roleId: string;
  private readonly _roleName: string;
  private readonly _createdAt: Date;

  private constructor(props: MemberProfileProps) {
    super(props.id);
    this._email = props.email;
    this._roleId = props.roleId;
    this._roleName = props.roleName;
    this._createdAt = props.createdAt;
  }

  static create(props: MemberProfileProps): MemberProfile {
    return new MemberProfile(props);
  }

  get email(): string {
    return this._email;
  }

  get roleId(): string {
    return this._roleId;
  }

  get roleName(): string {
    return this._roleName;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  changeRole(newRoleId: string, newRoleName: string): MemberProfile {
    return MemberProfile.create({
      id: this._id,
      email: this._email,
      roleId: newRoleId,
      roleName: newRoleName,
      createdAt: this._createdAt,
    });
  }
}
