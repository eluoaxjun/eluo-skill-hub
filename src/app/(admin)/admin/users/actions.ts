'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/user-account/infrastructure/SupabaseUserRepository';
import { ChangeUserRoleUseCase } from '@/user-account/application/ChangeUserRoleUseCase';

export async function changeUserRoleAction(
  adminUserId: string,
  targetUserId: string,
  newRoleId: string
): Promise<{ status: 'success'; message: string } | { status: 'error'; message: string }> {
  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseUserRepository(supabase);
  const useCase = new ChangeUserRoleUseCase(repository);

  const result = await useCase.execute({
    adminUserId,
    targetUserId,
    newRoleId,
  });

  if (result.status === 'success') {
    revalidatePath('/admin/users');
    return { status: 'success', message: result.message };
  }

  return { status: 'error', message: result.message };
}
