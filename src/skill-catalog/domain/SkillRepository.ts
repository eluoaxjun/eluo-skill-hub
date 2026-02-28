import type { Skill } from './Skill';
import type { SkillCategoryValue } from './SkillCategory';

export interface SkillRepository {
  findById(id: string): Promise<Skill | null>;
  findAll(params?: {
    category?: SkillCategoryValue;
  }): Promise<ReadonlyArray<Skill>>;
  save(skill: Skill): Promise<void>;
  delete(id: string): Promise<void>;
}
