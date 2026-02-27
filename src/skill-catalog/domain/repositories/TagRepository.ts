import { Tag } from '../entities/Tag';

export interface TagRepository {
  findById(id: string): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  findAll(params?: { searchQuery?: string; limit?: number }): Promise<Tag[]>;
  save(tag: Tag): Promise<void>;
  delete(id: string): Promise<void>;
}
