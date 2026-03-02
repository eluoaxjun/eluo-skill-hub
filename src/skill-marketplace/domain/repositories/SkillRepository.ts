import type { Skill } from "../entities/Skill";

export interface SkillRepository {
  getRecommended(categoryName?: string): Promise<Skill[]>;
}
