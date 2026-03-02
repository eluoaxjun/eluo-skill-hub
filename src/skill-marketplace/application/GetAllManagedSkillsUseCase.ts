import type { ManagedSkillRepository } from '../domain/repositories/ManagedSkillRepository';
import type { SkillStatusValue } from '../domain/value-objects/SkillStatus';

export interface GetAllManagedSkillsResult {
  skills: Array<{
    id: string;
    title: string;
    categoryId: string;
    categoryName: string;
    markdownFilePath: string | null;
    status: SkillStatusValue;
    createdAt: Date;
  }>;
}

export class GetAllManagedSkillsUseCase {
  constructor(private readonly repository: ManagedSkillRepository) {}

  async execute(): Promise<GetAllManagedSkillsResult> {
    const skills = await this.repository.findAll();

    return {
      skills: skills.map((skill) => ({
        id: skill.id,
        title: skill.title,
        categoryId: skill.categoryId,
        categoryName: skill.categoryName,
        markdownFilePath: skill.markdownFilePath,
        status: skill.status.value,
        createdAt: skill.createdAt,
      })),
    };
  }
}
