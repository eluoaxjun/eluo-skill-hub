import type { UserRepository } from '../domain/UserRepository';
import type { UserRole } from '../domain/UserRole';

export interface GetCurrentUserRoleInput {
  readonly userId: string;
}

export type GetCurrentUserRoleResult =
  | { status: 'success'; role: UserRole }
  | { status: 'error'; code: 'user_not_found'; message: string };

export class GetCurrentUserRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: GetCurrentUserRoleInput
  ): Promise<GetCurrentUserRoleResult> {
    const profile = await this.userRepository.findById(input.userId);

    if (profile === null) {
      return {
        status: 'error',
        code: 'user_not_found',
        message: '해당 사용자를 찾을 수 없습니다.',
      };
    }

    return {
      status: 'success',
      role: profile.role,
    };
  }
}
