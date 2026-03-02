import type { SupabaseClient } from '@supabase/supabase-js';
import { ManagedSkill } from '../domain/entities/ManagedSkill';
import { SkillStatus } from '../domain/value-objects/SkillStatus';
import type {
  CreateManagedSkillInput,
  ManagedSkillRepository,
  ManagedSkillWithCategory,
} from '../domain/repositories/ManagedSkillRepository';

interface SkillRow {
  id: string;
  title: string;
  description: string | null;
  category_id: string;
  markdown_file_path: string | null;
  author_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
}

export class SupabaseManagedSkillRepository implements ManagedSkillRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAll(): Promise<ManagedSkillWithCategory[]> {
    const { data, error } = await this.client
      .from('skills')
      .select('id, title, description, category_id, markdown_file_path, author_id, status, created_at, categories(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`스킬 목록 조회 실패: ${error.message}`);
    }

    return (data as unknown as SkillRow[]).map((row) => {
      const cats = row.categories;
      const categoryName = Array.isArray(cats)
        ? (cats[0]?.name ?? '')
        : (cats?.name ?? '');
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        categoryId: row.category_id,
        categoryName,
        markdownFilePath: row.markdown_file_path,
        authorId: row.author_id,
        status: SkillStatus.from(row.status),
        createdAt: new Date(row.created_at),
      };
    });
  }

  async save(input: CreateManagedSkillInput): Promise<ManagedSkill> {
    const skillId = crypto.randomUUID();
    const storagePath = `${input.authorId}/${skillId}.md`;

    const { error: storageError } = await this.client.storage
      .from('skill-markdowns')
      .upload(storagePath, new Blob([input.markdownContent], { type: 'text/markdown' }), {
        contentType: 'text/markdown',
      });

    if (storageError) {
      throw new Error(`마크다운 파일 업로드 실패: ${storageError.message}`);
    }

    const { data, error: insertError } = await this.client
      .from('skills')
      .insert({
        id: skillId,
        title: input.title,
        category_id: input.categoryId,
        markdown_file_path: storagePath,
        author_id: input.authorId,
        status: 'active',
      })
      .select('id, title, category_id, markdown_file_path, author_id, status, created_at')
      .single();

    if (insertError) {
      throw new Error(`스킬 등록 실패: ${insertError.message}`);
    }

    const row = data as {
      id: string;
      title: string;
      category_id: string;
      markdown_file_path: string | null;
      author_id: string;
      status: 'active' | 'inactive';
      created_at: string;
    };

    return ManagedSkill.create({
      id: row.id,
      title: row.title,
      description: null,
      categoryId: row.category_id,
      markdownFilePath: row.markdown_file_path,
      authorId: row.author_id,
      status: SkillStatus.from(row.status),
      createdAt: new Date(row.created_at),
    });
  }
}
