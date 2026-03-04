import type { AdminRepository, CreateSkillInput, CreateSkillResult } from '@/admin/domain/types';

export class CreateSkillUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(input: CreateSkillInput): Promise<CreateSkillResult> {
    return this.repository.createSkill(input);
  }
}
