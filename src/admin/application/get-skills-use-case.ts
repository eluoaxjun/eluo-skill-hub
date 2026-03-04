import type { AdminRepository, PaginatedResult, SkillRow } from '@/admin/domain/types';

export class GetSkillsUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(page: number, pageSize: number): Promise<PaginatedResult<SkillRow>> {
    return this.repository.getSkills(page, pageSize);
  }
}
