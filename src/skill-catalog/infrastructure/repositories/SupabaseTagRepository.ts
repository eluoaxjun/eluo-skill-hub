import type { SupabaseClient } from '@supabase/supabase-js';
import type { TagRepository } from '@/skill-catalog/domain/repositories/TagRepository';
import { Tag } from '@/skill-catalog/domain/entities/Tag';
import { SkillId } from '@/skill-catalog/domain/value-objects/SkillId';

interface TagRow {
  id: string;
  name: string;
}

export class SupabaseTagRepository implements TagRepository {
  constructor(private readonly client: SupabaseClient) {}

  private hydrate(row: TagRow): Tag {
    const idResult = SkillId.create(row.id);
    if (!idResult.ok) throw new Error(`Invalid tag ID: ${row.id}`);

    return Tag.reconstruct(idResult.value, { name: row.name });
  }

  async findById(id: string): Promise<Tag | null> {
    const { data, error } = await this.client
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.hydrate(data as TagRow);
  }

  async findByName(name: string): Promise<Tag | null> {
    const { data, error } = await this.client
      .from('tags')
      .select('*')
      .eq('name', name)
      .single();

    if (error || !data) return null;
    return this.hydrate(data as TagRow);
  }

  async findAll(params?: { searchQuery?: string; limit?: number }): Promise<Tag[]> {
    let query = this.client.from('tags').select('*').order('name', { ascending: true });

    if (params?.searchQuery) {
      query = query.ilike('name', `%${params.searchQuery}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(`태그 조회 실패: ${error.message}`);
    return (data ?? []).map((row: TagRow) => this.hydrate(row));
  }

  async save(tag: Tag): Promise<void> {
    const row = {
      id: tag.id.value,
      name: tag.name,
    };

    const { error } = await this.client
      .from('tags')
      .upsert(row, { onConflict: 'id' });

    if (error) throw new Error(`태그 저장 실패: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`태그 삭제 실패: ${error.message}`);
  }
}
