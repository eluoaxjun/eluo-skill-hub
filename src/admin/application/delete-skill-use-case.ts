import type { AdminRepository, DeleteSkillResult } from '@/admin/domain/types';

export class DeleteSkillUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(skillId: string): Promise<DeleteSkillResult> {
    return this.repository.deleteSkill(skillId);
  }
}
