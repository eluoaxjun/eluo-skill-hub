import type { UserRepository, DashboardStats } from '../domain/UserRepository';

export type GetDashboardStatsResult =
  | { status: 'success'; stats: DashboardStats }
  | { status: 'error'; code: 'fetch_failed'; message: string };

export class GetDashboardStatsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<GetDashboardStatsResult> {
    try {
      const stats = await this.userRepository.getDashboardStats();
      return { status: 'success', stats };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : '대시보드 통계 조회에 실패했습니다.';
      return { status: 'error', code: 'fetch_failed', message };
    }
  }
}
