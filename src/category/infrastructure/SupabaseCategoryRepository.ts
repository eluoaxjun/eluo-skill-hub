import type { SupabaseClient } from "@supabase/supabase-js";
import { Category } from "../domain/entities/Category";
import type { CategoryRepository } from "../domain/repositories/CategoryRepository";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function toDomain(row: CategoryRow): Category {
  return Category.create({
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export class SupabaseCategoryRepository implements CategoryRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.client
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`카테고리 목록 조회 실패: ${error.message}`);
    }

    return (data as CategoryRow[]).map(toDomain);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`카테고리 조회 실패: ${error.message}`);
    }

    return toDomain(data as CategoryRow);
  }
}
