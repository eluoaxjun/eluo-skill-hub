'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseSkillRepository } from '@/skill-catalog/infrastructure/SupabaseSkillRepository';
import { SupabaseStorageAdapter } from '@/skill-catalog/infrastructure/SupabaseStorageAdapter';
import { DeleteSkillUseCase } from '@/skill-catalog/application/DeleteSkillUseCase';
import { RegisterSkillUseCase } from '@/skill-catalog/application/RegisterSkillUseCase';

export async function deleteSkillAction(
  skillId: string
): Promise<{ status: 'success'; message: string } | { status: 'error'; message: string }> {
  const supabase = await createSupabaseServerClient();
  const skillRepository = new SupabaseSkillRepository(supabase);
  const storageAdapter = new SupabaseStorageAdapter(supabase);
  const useCase = new DeleteSkillUseCase(skillRepository, storageAdapter);

  const result = await useCase.execute({ skillId });

  if (result.status === 'success') {
    revalidatePath('/admin/skills');
    return { status: 'success', message: '스킬이 삭제되었습니다.' };
  }

  return { status: 'error', message: result.message };
}

export async function registerSkillAction(
  formData: FormData
): Promise<{ status: 'success'; message: string } | { status: 'error'; message: string }> {
  const title = formData.get('title') as string | null;
  const category = formData.get('category') as string | null;
  const file = formData.get('file') as File | null;

  if (!title || !category || !file) {
    return { status: 'error', message: '모든 필드를 입력해 주세요.' };
  }

  // 서버 측 .md 확장자 검증
  if (!file.name.toLowerCase().endsWith('.md')) {
    return { status: 'error', message: '마크다운(.md) 파일만 업로드할 수 있습니다.' };
  }

  const supabase = await createSupabaseServerClient();
  const skillRepository = new SupabaseSkillRepository(supabase);
  const storageAdapter = new SupabaseStorageAdapter(supabase);
  const useCase = new RegisterSkillUseCase(skillRepository, storageAdapter);

  // 현재 사용자 ID 조회
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: 'error', message: '인증되지 않은 사용자입니다.' };
  }

  const result = await useCase.execute({
    title,
    category,
    file,
    authorId: user.id,
  });

  if (result.status === 'success') {
    revalidatePath('/admin/skills');
    return { status: 'success', message: '스킬이 등록되었습니다.' };
  }

  return { status: 'error', message: result.message };
}
