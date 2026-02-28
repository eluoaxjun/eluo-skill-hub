import type { UserRole } from '../domain/UserRole';
import type { UserRepository } from '../domain/UserRepository';

export type GetAllRolesResult =
  | { status: 'success'; roles: ReadonlyArray<UserRole> }
  | { status: 'error'; code: 'fetch_failed'; message: string };

export class GetAllRolesUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<GetAllRolesResult> {
    try {
      const roles = await this.userRepository.findAllRoles();
      return { status: 'success', roles };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : '역할 목록 조회에 실패했습니다.';
      return { status: 'error', code: 'fetch_failed', message };
    }
  }
}
