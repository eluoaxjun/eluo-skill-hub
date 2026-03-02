'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseBookmarkRepository } from '@/bookmark/infrastructure/SupabaseBookmarkRepository';
import { ToggleBookmarkUseCase } from '@/bookmark/application/ToggleBookmarkUseCase';

export async function toggleBookmarkAction(skillId: string): Promise<{ isBookmarked: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증 필요');
  }

  const repository = new SupabaseBookmarkRepository(supabase);
  const useCase = new ToggleBookmarkUseCase(repository);
  const result = await useCase.execute(user.id, skillId);

  revalidatePath('/');
  revalidatePath('/myagent');

  return result;
}
