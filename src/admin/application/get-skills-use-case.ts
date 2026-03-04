import type { AdminRepository, PaginatedResult, SkillRow, SkillStatusFilter } from '@/admin/domain/types';

export class GetSkillsUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(page: number, pageSize: number, search?: string, status?: SkillStatusFilter): Promise<PaginatedResult<SkillRow>> {
    return this.repository.getSkills(page, pageSize, search, status);
  }
}
