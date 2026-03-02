'use server';

import { createClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseManagedSkillRepository } from '@/skill-marketplace/infrastructure/SupabaseManagedSkillRepository';
import { GetAllManagedSkillsUseCase } from '@/skill-marketplace/application/GetAllManagedSkillsUseCase';
import type { GetAllManagedSkillsResult } from '@/skill-marketplace/application/GetAllManagedSkillsUseCase';

export async function getAdminSkills(): Promise<GetAllManagedSkillsResult> {
  const supabase = await createClient();
  const repository = new SupabaseManagedSkillRepository(supabase);
  const useCase = new GetAllManagedSkillsUseCase(repository);
  return useCase.execute();
}

export async function getSkillMarkdown(
  markdownFilePath: string
): Promise<{ content: string } | { error: string }> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('skills')
    .select('markdown_content')
    .eq('markdown_file_path', markdownFilePath)
    .single();

  if (data?.markdown_content) {
    return { content: data.markdown_content };
  }

  const { data: fileData, error } = await supabase.storage
    .from('skill-markdowns')
    .download(markdownFilePath);

  if (error || !fileData) {
    return { error: `마크다운 파일을 불러오지 못했습니다: ${error?.message ?? '알 수 없는 오류'}` };
  }

  const content = await fileData.text();
  return { content };
}
