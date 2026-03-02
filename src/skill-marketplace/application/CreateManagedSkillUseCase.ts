import type { ManagedSkillRepository } from '../domain/repositories/ManagedSkillRepository';
import type { SkillStatusValue } from '../domain/value-objects/SkillStatus';

export interface CreateManagedSkillCommand {
  title: string;
  categoryId: string;
  markdownContent: string;
  fileName: string;
  authorId: string;
}

export interface CreateManagedSkillResult {
  skill: {
    id: string;
    title: string;
    categoryId: string;
    markdownFilePath: string | null;
    status: SkillStatusValue;
    createdAt: Date;
  };
}

export class CreateManagedSkillUseCase {
  constructor(private readonly repository: ManagedSkillRepository) {}

  async execute(command: CreateManagedSkillCommand): Promise<CreateManagedSkillResult> {
    const skill = await this.repository.save({
      title: command.title,
      categoryId: command.categoryId,
      markdownContent: command.markdownContent,
      fileName: command.fileName,
      authorId: command.authorId,
    });

    return {
      skill: {
        id: skill.id,
        title: skill.title,
        categoryId: skill.categoryId,
        markdownFilePath: skill.markdownFilePath,
        status: skill.status.value,
        createdAt: skill.createdAt,
      },
    };
  }
}
