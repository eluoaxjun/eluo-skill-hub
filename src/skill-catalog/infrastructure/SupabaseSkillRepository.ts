import type { SupabaseClient } from '@supabase/supabase-js';
import type { SkillRepository } from '../domain/SkillRepository';
import type { SkillCategoryValue } from '../domain/SkillCategory';
import { Skill } from '../domain/Skill';
import { SkillCategory } from '../domain/SkillCategory';

interface SkillRow {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly markdown_file_path: string;
  readonly author_id: string;
  readonly created_at: string;
}

export class SupabaseSkillRepository implements SkillRepository {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async findById(id: string): Promise<Skill | null> {
    const { data, error } = await this.supabaseClient
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toDomain(data as SkillRow);
  }

  async findAll(params?: {
    category?: SkillCategoryValue;
  }): Promise<ReadonlyArray<Skill>> {
    let query = this.supabaseClient.from('skills').select('*');

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`스킬 목록 조회에 실패했습니다: ${error.message}`);
    }

    const rows = (data || []) as SkillRow[];
    return rows.map((row) => this.toDomain(row));
  }

  async save(skill: Skill): Promise<void> {
    const { error } = await this.supabaseClient.from('skills').insert({
      id: skill.id,
      title: skill.title,
      category: skill.category.value,
      markdown_file_path: skill.markdownFilePath,
      author_id: skill.authorId,
      created_at: skill.createdAt.toISOString(),
    });

    if (error) {
      throw new Error(`스킬 저장에 실패했습니다: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`스킬 삭제에 실패했습니다: ${error.message}`);
    }
  }

  private toDomain(row: SkillRow): Skill {
    const category = SkillCategory.create(row.category);

    return Skill.reconstruct(row.id, {
      title: row.title,
      category,
      markdownFilePath: row.markdown_file_path,
      authorId: row.author_id,
      createdAt: new Date(row.created_at),
    });
  }
}
