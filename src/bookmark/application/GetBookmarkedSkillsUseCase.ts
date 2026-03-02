import type { BookmarkRepository } from "../domain/repositories/BookmarkRepository";

export class GetBookmarkedSkillsUseCase {
  constructor(private readonly repository: BookmarkRepository) {}

  async execute(userId: string): Promise<string[]> {
    return this.repository.findSkillIdsByUserId(userId);
  }
}
