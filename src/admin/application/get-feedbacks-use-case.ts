import type { AdminRepository, FeedbackRow, PaginatedResult } from '@/admin/domain/types';

export class GetFeedbacksUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(page: number, pageSize: number): Promise<PaginatedResult<FeedbackRow>> {
    return this.repository.getFeedbacks(page, pageSize);
  }
}
