import type { AdminRepository, UpdateSkillInput, UpdateSkillResult } from '@/admin/domain/types';

export class UpdateSkillUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(input: UpdateSkillInput): Promise<UpdateSkillResult> {
    return this.repository.updateSkill(input);
  }
}
