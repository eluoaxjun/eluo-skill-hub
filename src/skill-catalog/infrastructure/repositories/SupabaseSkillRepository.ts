import type { SupabaseClient } from '@supabase/supabase-js';
import type { SkillRepository } from '@/skill-catalog/domain/repositories/SkillRepository';
import { Skill } from '@/skill-catalog/domain/entities/Skill';
import { SkillVersion } from '@/skill-catalog/domain/entities/SkillVersion';
import { Category } from '@/skill-catalog/domain/entities/Category';
import { Tag } from '@/skill-catalog/domain/entities/Tag';
import { SkillId } from '@/skill-catalog/domain/value-objects/SkillId';
import { SkillSlug } from '@/skill-catalog/domain/value-objects/SkillSlug';
import { SkillStatus } from '@/skill-catalog/domain/value-objects/SkillStatus';
import { SemanticVersion } from '@/skill-catalog/domain/value-objects/SemanticVersion';
import type { SkillStatusType } from '@/skill-catalog/domain/value-objects/SkillStatus';

interface SkillRow {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  author_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SkillVersionRow {
  id: string;
  skill_id: string;
  version: string;
  changelog: string;
  download_url: string;
  is_latest: boolean;
  created_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

interface TagRow {
  id: string;
  name: string;
}

export class SupabaseSkillRepository implements SkillRepository {
  constructor(private readonly client: SupabaseClient) {}

  private hydrateSkill(row: SkillRow): Skill {
    const idResult = SkillId.create(row.id);
    if (!idResult.ok) throw new Error(`Invalid skill ID: ${row.id}`);

    const slugResult = SkillSlug.create(row.slug);
    if (!slugResult.ok) throw new Error(`Invalid slug: ${row.slug}`);

    return Skill.reconstruct(idResult.value, {
      name: row.name,
      slug: slugResult.value,
      summary: row.summary,
      description: row.description,
      authorId: row.author_id,
      status: SkillStatus.fromString(row.status),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private hydrateVersion(row: SkillVersionRow): SkillVersion {
    const idResult = SkillId.create(row.id);
    if (!idResult.ok) throw new Error(`Invalid version ID: ${row.id}`);

    const skillIdResult = SkillId.create(row.skill_id);
    if (!skillIdResult.ok) throw new Error(`Invalid skill ID: ${row.skill_id}`);

    const versionResult = SemanticVersion.fromString(row.version);
    if (!versionResult.ok) throw new Error(`Invalid version: ${row.version}`);

    return SkillVersion.reconstruct(idResult.value, {
      skillId: skillIdResult.value,
      version: versionResult.value,
      changelog: row.changelog,
      downloadUrl: row.download_url,
      isLatest: row.is_latest,
      createdAt: new Date(row.created_at),
    });
  }

  private hydrateCategory(row: CategoryRow): Category {
    const idResult = SkillId.create(row.id);
    if (!idResult.ok) throw new Error(`Invalid category ID: ${row.id}`);

    return Category.reconstruct(idResult.value, {
      name: row.name,
      slug: row.slug,
      description: row.description,
      displayOrder: row.display_order,
    });
  }

  private hydrateTag(row: TagRow): Tag {
    const idResult = SkillId.create(row.id);
    if (!idResult.ok) throw new Error(`Invalid tag ID: ${row.id}`);

    return Tag.reconstruct(idResult.value, { name: row.name });
  }

  async findById(id: SkillId): Promise<Skill | null> {
    const { data, error } = await this.client
      .from('skills')
      .select('*')
      .eq('id', id.value)
      .single();

    if (error || !data) return null;
    return this.hydrateSkill(data as SkillRow);
  }

  async findBySlug(slug: SkillSlug): Promise<Skill | null> {
    const { data, error } = await this.client
      .from('skills')
      .select('*')
      .eq('slug', slug.value)
      .single();

    if (error || !data) return null;
    return this.hydrateSkill(data as SkillRow);
  }

  async findAll(params: {
    status?: SkillStatusType;
    categoryId?: string;
    tagId?: string;
    searchQuery?: string;
    sortBy?: 'created_at' | 'updated_at' | 'install_count' | 'view_count';
    sortOrder?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
  }): Promise<{ items: Skill[]; total: number }> {
    let query = this.client.from('skills').select('*', { count: 'exact' });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.categoryId) {
      const { data: mappings } = await this.client
        .from('skill_categories')
        .select('skill_id')
        .eq('category_id', params.categoryId);
      const skillIds = (mappings ?? []).map((m: { skill_id: string }) => m.skill_id);
      if (skillIds.length === 0) return { items: [], total: 0 };
      query = query.in('id', skillIds);
    }

    if (params.tagId) {
      const { data: mappings } = await this.client
        .from('skill_tags')
        .select('skill_id')
        .eq('tag_id', params.tagId);
      const skillIds = (mappings ?? []).map((m: { skill_id: string }) => m.skill_id);
      if (skillIds.length === 0) return { items: [], total: 0 };
      query = query.in('id', skillIds);
    }

    if (params.searchQuery) {
      query = query.or(
        `name.ilike.%${params.searchQuery}%,summary.ilike.%${params.searchQuery}%`,
      );
    }

    const sortBy = params.sortBy ?? 'created_at';
    const ascending = (params.sortOrder ?? 'desc') === 'asc';

    if (sortBy === 'install_count' || sortBy === 'view_count') {
      // 통계 기반 정렬은 별도 처리 필요 — 기본 created_at 정렬로 대체
      query = query.order('created_at', { ascending });
    } else {
      query = query.order(sortBy, { ascending });
    }

    const offset = params.offset ?? 0;
    const limit = params.limit ?? 20;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw new Error(`스킬 조회 실패: ${error.message}`);

    const items = (data ?? []).map((row: SkillRow) => this.hydrateSkill(row));
    return { items, total: count ?? 0 };
  }

  async save(skill: Skill): Promise<void> {
    const row = {
      id: skill.id.value,
      name: skill.name,
      slug: skill.slug.value,
      summary: skill.summary,
      description: skill.description,
      author_id: skill.authorId,
      status: skill.status.value,
      created_at: skill.createdAt.toISOString(),
      updated_at: skill.updatedAt.toISOString(),
    };

    const { error } = await this.client
      .from('skills')
      .upsert(row, { onConflict: 'id' });

    if (error) throw new Error(`스킬 저장 실패: ${error.message}`);
  }

  async delete(id: SkillId): Promise<void> {
    const { error } = await this.client
      .from('skills')
      .delete()
      .eq('id', id.value);

    if (error) throw new Error(`스킬 삭제 실패: ${error.message}`);
  }

  async findVersionsBySkillId(skillId: SkillId): Promise<SkillVersion[]> {
    const { data, error } = await this.client
      .from('skill_versions')
      .select('*')
      .eq('skill_id', skillId.value)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`버전 조회 실패: ${error.message}`);
    return (data ?? []).map((row: SkillVersionRow) => this.hydrateVersion(row));
  }

  async saveVersion(version: SkillVersion): Promise<void> {
    const row = {
      id: version.id.value,
      skill_id: version.skillId.value,
      version: version.version.toString(),
      changelog: version.changelog,
      download_url: version.downloadUrl,
      is_latest: version.isLatest,
      created_at: version.createdAt.toISOString(),
    };

    const { error } = await this.client
      .from('skill_versions')
      .upsert(row, { onConflict: 'id' });

    if (error) throw new Error(`버전 저장 실패: ${error.message}`);
  }

  async findCategoriesBySkillId(skillId: SkillId): Promise<Category[]> {
    const { data, error } = await this.client
      .from('skill_categories')
      .select('category_id, categories(*)')
      .eq('skill_id', skillId.value);

    if (error) throw new Error(`카테고리 조회 실패: ${error.message}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? [] as Record<string, unknown>[])
      .filter((row: Record<string, unknown>) => row.categories)
      .map((row: Record<string, unknown>) => this.hydrateCategory(row.categories as CategoryRow));
  }

  async addCategory(skillId: SkillId, categoryId: string): Promise<void> {
    const { error } = await this.client
      .from('skill_categories')
      .insert({ skill_id: skillId.value, category_id: categoryId });

    if (error) throw new Error(`카테고리 매핑 추가 실패: ${error.message}`);
  }

  async removeCategory(skillId: SkillId, categoryId: string): Promise<void> {
    const { error } = await this.client
      .from('skill_categories')
      .delete()
      .eq('skill_id', skillId.value)
      .eq('category_id', categoryId);

    if (error) throw new Error(`카테고리 매핑 제거 실패: ${error.message}`);
  }

  async findTagsBySkillId(skillId: SkillId): Promise<Tag[]> {
    const { data, error } = await this.client
      .from('skill_tags')
      .select('tag_id, tags(*)')
      .eq('skill_id', skillId.value);

    if (error) throw new Error(`태그 조회 실패: ${error.message}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? [] as Record<string, unknown>[])
      .filter((row: Record<string, unknown>) => row.tags)
      .map((row: Record<string, unknown>) => this.hydrateTag(row.tags as TagRow));
  }

  async addTag(skillId: SkillId, tagId: string): Promise<void> {
    const { error } = await this.client
      .from('skill_tags')
      .insert({ skill_id: skillId.value, tag_id: tagId });

    if (error) throw new Error(`태그 매핑 추가 실패: ${error.message}`);
  }

  async removeTag(skillId: SkillId, tagId: string): Promise<void> {
    const { error } = await this.client
      .from('skill_tags')
      .delete()
      .eq('skill_id', skillId.value)
      .eq('tag_id', tagId);

    if (error) throw new Error(`태그 매핑 제거 실패: ${error.message}`);
  }

  async getStats(skillId: SkillId): Promise<{ installCount: number; viewCount: number }> {
    const { data, error } = await this.client
      .from('skill_stats')
      .select('install_count, view_count')
      .eq('skill_id', skillId.value)
      .single();

    if (error || !data) return { installCount: 0, viewCount: 0 };
    return {
      installCount: (data as { install_count: number; view_count: number }).install_count,
      viewCount: (data as { install_count: number; view_count: number }).view_count,
    };
  }

  async incrementInstallCount(skillId: SkillId): Promise<void> {
    const { error } = await this.client.rpc('increment_install_count', {
      p_skill_id: skillId.value,
    });
    if (error) throw new Error(`설치 수 증가 실패: ${error.message}`);
  }

  async incrementViewCount(skillId: SkillId): Promise<void> {
    const { error } = await this.client.rpc('increment_view_count', {
      p_skill_id: skillId.value,
    });
    if (error) throw new Error(`조회 수 증가 실패: ${error.message}`);
  }
}
