import type { AdminRepository, MemberRow, PaginatedResult } from '@/admin/domain/types';

export class GetMembersUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(page: number, pageSize: number): Promise<PaginatedResult<MemberRow>> {
    return this.repository.getMembers(page, pageSize);
  }
}
