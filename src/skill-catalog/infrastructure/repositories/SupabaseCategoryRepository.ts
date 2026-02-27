import type { SupabaseClient } from '@supabase/supabase-js';
import type { CategoryRepository } from '@/skill-catalog/domain/repositories/CategoryRepository';
import { Category } from '@/skill-catalog/domain/entities/Category';
import { SkillId } from '@/skill-catalog/domain/value-objects/SkillId';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly client: SupabaseClient) {}

  private hydrate(row: CategoryRow): Category {
    const idResult = SkillId.create(row.id);
    if (!idResult.ok) throw new Error(`Invalid category ID: ${row.id}`);

    return Category.reconstruct(idResult.value, {
      name: row.name,
      slug: row.slug,
      description: row.description,
      displayOrder: row.display_order,
    });
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.hydrate(data as CategoryRow);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return this.hydrate(data as CategoryRow);
  }

  async findAll(params?: { sortBy?: 'display_order' | 'name' }): Promise<Category[]> {
    const sortBy = params?.sortBy ?? 'display_order';
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .order(sortBy, { ascending: true });

    if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);
    return (data ?? []).map((row: CategoryRow) => this.hydrate(row));
  }

  async save(category: Category): Promise<void> {
    const row = {
      id: category.id.value,
      name: category.name,
      slug: category.slug,
      description: category.description,
      display_order: category.displayOrder,
    };

    const { error } = await this.client
      .from('categories')
      .upsert(row, { onConflict: 'id' });

    if (error) throw new Error(`카테고리 저장 실패: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`카테고리 삭제 실패: ${error.message}`);
  }
}
