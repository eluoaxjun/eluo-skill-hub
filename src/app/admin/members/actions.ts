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

export interface UpdateMemberTierState {
  success: boolean;
  error?: string;
}

export interface CreateMemberState {
  success: boolean;
  error?: string;
  memberId?: string;
}

export async function createMember(input: {
  email: string;
  password: string;
  name: string;
  roleId: string;
  downloadTier: string;
}): Promise<CreateMemberState> {
  try {
    await requireAdmin();

    if (!input.email || !input.password || !input.name || !input.roleId) {
      return { success: false, error: '모든 필드를 입력해주세요' };
    }
    if (!['general', 'senior', 'executive'].includes(input.downloadTier)) {
      return { success: false, error: '올바르지 않은 등급입니다' };
    }

    const repository = new SupabaseAdminRepository();
    const result = await repository.createMember({
      email: input.email,
      password: input.password,
      name: input.name,
      roleId: input.roleId,
      downloadTier: input.downloadTier as 'general' | 'senior' | 'executive',
    });

    if (result.success) {
      revalidatePath('/admin/members');
      revalidatePath('/admin');
      return { success: true, memberId: result.memberId };
    }
    return { success: false, error: result.error };
  } catch (err) {
    const message = err instanceof Error ? err.message : '회원 등록에 실패했습니다';
    return { success: false, error: message };
  }
}

export async function updateMemberTier(
  memberId: string,
  tier: string
): Promise<UpdateMemberTierState> {
  try {
    await requireAdmin();

    if (!['general', 'senior', 'executive'].includes(tier)) {
      return { success: false, error: '올바르지 않은 등급입니다' };
    }

    const repository = new SupabaseAdminRepository();
    await repository.updateMemberTier(memberId, tier);
    revalidatePath('/admin/members');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : '등급 변경에 실패했습니다';
    return { success: false, error: message };
  }
}
