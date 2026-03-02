import type { Skill } from "../domain/entities/Skill";
import type { SkillRepository } from "../domain/repositories/SkillRepository";

export class GetRecommendedSkillsUseCase {
  private readonly repository: SkillRepository;

  constructor(repository: SkillRepository) {
    this.repository = repository;
  }

  async execute(categoryName?: string): Promise<Skill[]> {
    return this.repository.getRecommended(categoryName);
  }
}
