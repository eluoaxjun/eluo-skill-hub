import { Skill } from '../entities/Skill';
import { SkillVersion } from '../entities/SkillVersion';
import { Category } from '../entities/Category';
import { Tag } from '../entities/Tag';
import { SkillId } from '../value-objects/SkillId';
import { SkillSlug } from '../value-objects/SkillSlug';
import type { SkillStatusType } from '../value-objects/SkillStatus';

export interface SkillRepository {
  findById(id: SkillId): Promise<Skill | null>;
  findBySlug(slug: SkillSlug): Promise<Skill | null>;
  findAll(params: {
    status?: SkillStatusType;
    categoryId?: string;
    tagId?: string;
    searchQuery?: string;
    sortBy?: 'created_at' | 'updated_at' | 'install_count' | 'view_count';
    sortOrder?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
  }): Promise<{ items: Skill[]; total: number }>;
  save(skill: Skill): Promise<void>;
  delete(id: SkillId): Promise<void>;

  findVersionsBySkillId(skillId: SkillId): Promise<SkillVersion[]>;
  saveVersion(version: SkillVersion): Promise<void>;

  findCategoriesBySkillId(skillId: SkillId): Promise<Category[]>;
  addCategory(skillId: SkillId, categoryId: string): Promise<void>;
  removeCategory(skillId: SkillId, categoryId: string): Promise<void>;

  findTagsBySkillId(skillId: SkillId): Promise<Tag[]>;
  addTag(skillId: SkillId, tagId: string): Promise<void>;
  removeTag(skillId: SkillId, tagId: string): Promise<void>;

  getStats(skillId: SkillId): Promise<{ installCount: number; viewCount: number }>;
  incrementInstallCount(skillId: SkillId): Promise<void>;
  incrementViewCount(skillId: SkillId): Promise<void>;
}
