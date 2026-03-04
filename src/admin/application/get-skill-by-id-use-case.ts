import type { AdminRepository, GetSkillResult } from '@/admin/domain/types';

export class GetSkillByIdUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(id: string): Promise<GetSkillResult> {
    return this.repository.getSkillById(id);
  }
}
