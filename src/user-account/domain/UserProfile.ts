import { Entity } from '@/shared/domain/types/Entity';
import { UserRole } from '@/user-account/domain/UserRole';

export interface UserProfileProps {
  readonly email: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

export class UserProfile extends Entity<string> {
  private props: UserProfileProps;

  private constructor(id: string, props: UserProfileProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    id: string;
    email: string;
    roleId?: string;
    roleName?: string;
    createdAt: Date;
  }): UserProfile {
    if (!params.id || params.id.trim() === '') {
      throw new Error('UserProfile id는 비어 있을 수 없습니다');
    }
    if (!params.email || params.email.trim() === '') {
      throw new Error('UserProfile email은 비어 있을 수 없습니다');
    }
    const role = UserRole.create(
      params.roleId ?? '',
      params.roleName ?? 'user'
    );
    return new UserProfile(params.id, {
      email: params.email,
      role,
      createdAt: params.createdAt,
    });
  }

  static reconstruct(id: string, props: UserProfileProps): UserProfile {
    return new UserProfile(id, props);
  }

  get email(): string {
    return this.props.email;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  changeRole(newRole: UserRole): void {
    this.props = {
      ...this.props,
      role: newRole,
    };
  }
}
