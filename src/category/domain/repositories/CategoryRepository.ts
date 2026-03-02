import type { Category } from "../entities/Category";

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
}
