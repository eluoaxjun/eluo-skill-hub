import type { UserProfile } from '../domain/UserProfile';
import type { UserRepository } from '../domain/UserRepository';

export type GetAllUsersResult =
  | { status: 'success'; users: ReadonlyArray<UserProfile> }
  | { status: 'error'; code: 'fetch_failed'; message: string };

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<GetAllUsersResult> {
    try {
      const users = await this.userRepository.findAll();
      return { status: 'success', users };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `사용자 목록 조회에 실패했습니다: ${error.message}`
          : '사용자 목록 조회에 실패했습니다: 알 수 없는 오류가 발생했습니다.';
      return { status: 'error', code: 'fetch_failed', message };
    }
  }
}
