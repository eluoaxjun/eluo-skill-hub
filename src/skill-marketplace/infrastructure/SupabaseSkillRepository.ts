import type { SupabaseClient } from '@supabase/supabase-js';
import { Skill } from '../domain/entities/Skill';
import { SkillCategory } from '../domain/value-objects/SkillCategory';
import type { SkillRepository } from '../domain/repositories/SkillRepository';
import { computeSkillIcon } from './utils/computeSkillIcon';

interface SkillRow {
  id: string;
  title: string;
  description: string | null;
  markdown_content: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
}

export class SupabaseSkillRepository implements SkillRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getRecommended(categoryName?: string): Promise<Skill[]> {
    let query = this.client
      .from('skills')
      .select('id, title, description, markdown_content, status, created_at, categories(name)')
      .eq('status', 'active');

    if (categoryName) {
      query = query.eq('categories.name', categoryName);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`스킬 목록 조회 실패: ${error.message}`);
    }

    const rows = data as unknown as SkillRow[];

    return rows
      .filter((row) => {
        if (!categoryName) return true;
        const cats = row.categories;
        if (!cats) return false;
        const categoryNames = Array.isArray(cats)
          ? cats.map((c) => c.name)
          : [cats.name];
        return categoryNames.includes(categoryName);
      })
      .map((row) => {
        const cats = row.categories;
        const primaryCategoryName = Array.isArray(cats)
          ? (cats[0]?.name ?? '')
          : (cats?.name ?? '');

        return new Skill(
          row.id,
          row.title,
          row.description ?? '',
          computeSkillIcon(row.id),
          primaryCategoryName
            ? [SkillCategory.create(primaryCategoryName, 'primary')]
            : [],
          row.markdown_content,
          new Date(row.created_at)
        );
      });
  }
}
