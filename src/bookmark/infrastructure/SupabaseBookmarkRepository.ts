import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookmarkRepository } from '../domain/repositories/BookmarkRepository';

export class SupabaseBookmarkRepository implements BookmarkRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findSkillIdsByUserId(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('bookmarks')
      .select('skill_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`북마크 조회 실패: ${error.message}`);
    }

    return (data as { skill_id: string }[]).map((row) => row.skill_id);
  }

  async toggle(userId: string, skillId: string): Promise<{ isBookmarked: boolean }> {
    const { data: existing } = await this.client
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single();

    if (existing) {
      const { error } = await this.client
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('skill_id', skillId);

      if (error) {
        throw new Error(`북마크 삭제 실패: ${error.message}`);
      }

      return { isBookmarked: false };
    } else {
      const { error } = await this.client
        .from('bookmarks')
        .insert({ user_id: userId, skill_id: skillId });

      if (error) {
        throw new Error(`북마크 추가 실패: ${error.message}`);
      }

      return { isBookmarked: true };
    }
  }
}
