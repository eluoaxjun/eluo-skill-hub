'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/shared/infrastructure/supabase/auth';
import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { UpdateMemberRoleUseCase } from '@/admin/application/update-member-role-use-case';

export interface UpdateMemberRoleState {
  success: boolean;
  error?: string;
}

export async function updateMemberRole(
  memberId: string,
  roleId: string
): Promise<UpdateMemberRoleState> {
  try {
    const { userId } = await requireAdmin();

    const repository = new SupabaseAdminRepository();
    const useCase = new UpdateMemberRoleUseCase(repository);
    await useCase.execute({ currentUserId: userId, memberId, roleId });
    revalidatePath('/admin/members');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : '역할 변경에 실패했습니다';
    return { success: false, error: message };
  }
}
