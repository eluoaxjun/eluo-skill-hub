import type { SupabaseClient } from '@supabase/supabase-js';
import type { StorageAdapter } from '../domain/StorageAdapter';

export class SupabaseStorageAdapter implements StorageAdapter {
  private static readonly BUCKET_NAME = 'skill-markdowns';

  constructor(private readonly supabaseClient: SupabaseClient) {}

  async upload(file: File, path: string): Promise<{ path: string }> {
    if (!path.toLowerCase().endsWith('.md')) {
      throw new Error('마크다운(.md) 파일만 업로드할 수 있습니다');
    }

    const { data, error } = await this.supabaseClient.storage
      .from(SupabaseStorageAdapter.BUCKET_NAME)
      .upload(path, file, {
        contentType: 'text/markdown',
        upsert: false,
      });

    if (error) {
      throw new Error(`파일 업로드에 실패했습니다: ${error.message}`);
    }

    return { path: data.path };
  }

  async download(path: string): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(SupabaseStorageAdapter.BUCKET_NAME)
      .download(path);

    if (error || !data) {
      throw new Error('마크다운 파일을 불러올 수 없습니다');
    }

    return data.text();
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.supabaseClient.storage
      .from(SupabaseStorageAdapter.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`파일 삭제에 실패했습니다: ${error.message}`);
    }
  }
}
