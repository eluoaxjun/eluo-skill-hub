export interface BookmarkRepository {
  findSkillIdsByUserId(userId: string): Promise<string[]>;
  toggle(userId: string, skillId: string): Promise<{ isBookmarked: boolean }>;
}
