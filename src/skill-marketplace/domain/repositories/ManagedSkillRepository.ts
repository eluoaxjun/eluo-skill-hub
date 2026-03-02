import type { ManagedSkill } from '../entities/ManagedSkill';
import type { SkillStatus } from '../value-objects/SkillStatus';

export interface CreateManagedSkillInput {
  title: string;
  categoryId: string;
  markdownContent: string;
  fileName: string;
  authorId: string;
}

export interface ManagedSkillWithCategory {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  markdownFilePath: string | null;
  authorId: string;
  status: SkillStatus;
  createdAt: Date;
}

export interface ManagedSkillRepository {
  findAll(): Promise<ManagedSkillWithCategory[]>;
  save(input: CreateManagedSkillInput): Promise<ManagedSkill>;
}
