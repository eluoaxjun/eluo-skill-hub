'use server';

import { createClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseMemberRepository } from '@/admin/infrastructure/SupabaseMemberRepository';
import { GetAllMembersUseCase } from '@/admin/application/GetAllMembersUseCase';
import { UpdateMemberRoleUseCase } from '@/admin/application/UpdateMemberRoleUseCase';
import type { GetAllMembersResult } from '@/admin/application/GetAllMembersUseCase';

export async function getMembers(): Promise<GetAllMembersResult> {
  const supabase = await createClient();
  const repository = new SupabaseMemberRepository(supabase);
  const useCase = new GetAllMembersUseCase(repository);
  return useCase.execute();
}

export async function updateMemberRole(
  targetUserId: string,
  newRoleId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('roles(name)')
    .eq('id', user.id)
    .single();

  if (profileError || !profileData) {
    return { error: '권한 확인에 실패했습니다.' };
  }

  const rolesData = profileData.roles as unknown;
  let roleName: string | null = null;
  if (Array.isArray(rolesData)) {
    roleName = (rolesData[0] as { name: string } | undefined)?.name ?? null;
  } else if (rolesData && typeof rolesData === 'object' && 'name' in rolesData) {
    roleName = (rolesData as { name: string }).name;
  }

  if (roleName !== 'admin') {
    return { error: '권한이 없습니다.' };
  }

  try {
    const repository = new SupabaseMemberRepository(supabase);
    const useCase = new UpdateMemberRoleUseCase(repository);
    await useCase.execute({
      targetUserId,
      newRoleId,
      requestingUserId: user.id,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : '역할 변경에 실패했습니다.';
    return { error: message };
  }
}
