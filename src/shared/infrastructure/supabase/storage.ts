import { createClient } from '@/shared/infrastructure/supabase/server';

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<{ path: string }> {
  const supabase = await createClient();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw new Error(`파일 업로드 실패: ${error.message}`);
  return { path };
}

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`파일 삭제 실패: ${error.message}`);
}
