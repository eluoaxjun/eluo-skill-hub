import type { BookmarkRepository } from "../domain/repositories/BookmarkRepository";

export class ToggleBookmarkUseCase {
  constructor(private readonly repository: BookmarkRepository) {}

  async execute(userId: string, skillId: string): Promise<{ isBookmarked: boolean }> {
    return this.repository.toggle(userId, skillId);
  }
}
