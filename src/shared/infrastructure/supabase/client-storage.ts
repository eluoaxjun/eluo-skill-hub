'use client';

import { createClient } from './client';

function resolveContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    md: 'text/markdown',
    zip: 'application/zip',
    txt: 'text/plain',
  };
  if (ext && mimeMap[ext]) return mimeMap[ext];
  return 'application/octet-stream';
}

export function sanitizeStoragePath(directory: string, originalName: string): string {
  const dotIdx = originalName.lastIndexOf('.');
  const ext = dotIdx >= 0 ? originalName.slice(dotIdx) : '';
  const baseName = dotIdx >= 0 ? originalName.slice(0, dotIdx) : originalName;

  const safe = baseName.replace(/[^a-zA-Z0-9_-]/g, '');
  const prefix = Date.now().toString(36);

  const fileName = safe ? `${prefix}_${safe}${ext}` : `${prefix}${ext}`;
  return `${directory}/${fileName}`;
}

export interface UploadedFileInfo {
  readonly path: string;
  readonly originalName: string;
  readonly size: number;
  readonly content?: string; // markdown content (text)
}

export async function uploadFileFromClient(
  bucket: string,
  path: string,
  file: File,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: resolveContentType(file.name),
    upsert: true,
  });

  if (error) throw new Error(`파일 업로드 실패: ${error.message}`);
}

/**
 * 클라이언트에서 마크다운 파일을 Supabase Storage에 직접 업로드하고 메타데이터를 반환한다.
 */
export async function uploadMarkdownFile(
  directory: string,
  file: File,
): Promise<UploadedFileInfo> {
  const path = sanitizeStoragePath(directory, file.name);
  await uploadFileFromClient('skill-descriptions', path, file);

  const text = await file.text();

  return {
    path,
    originalName: file.name,
    size: file.size,
    content: text,
  };
}

/**
 * 클라이언트에서 템플릿 파일을 Supabase Storage에 직접 업로드하고 메타데이터를 반환한다.
 */
export async function uploadTemplateFile(
  directory: string,
  file: File,
): Promise<UploadedFileInfo> {
  const path = sanitizeStoragePath(directory, file.name);
  await uploadFileFromClient('skill-templates', path, file);

  return {
    path,
    originalName: file.name,
    size: file.size,
  };
}
