import { cache } from 'react';
import { createClient } from './server';

type UserResult = {
  user: { id: string; email?: string; user_metadata: Record<string, unknown> } | null;
};

/**
 * 요청 단위로 1회만 실행되는 getUser 캐시 헬퍼.
 * layout → page → server action 전체에서 동일한 결과를 공유합니다.
 */
export const getCurrentUser = cache(async (): Promise<UserResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user };
});

type RoleResult = {
  roleName: string;
  downloadTier: string;
  email: string | null;
};

/**
 * 현재 사용자의 역할과 다운로드 등급을 반환합니다. 요청 단위 캐시됩니다.
 */
export const getCurrentUserRole = cache(async (): Promise<RoleResult> => {
  const { user } = await getCurrentUser();
  if (!user) return { roleName: 'anonymous', downloadTier: 'general', email: null };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, download_tier, roles(name)')
    .eq('id', user.id)
    .single();

  const rolesRaw = profile?.roles;
  const rolesTyped = rolesRaw as { name: string } | { name: string }[] | null | undefined;
  const roleName = !rolesTyped
    ? 'user'
    : Array.isArray(rolesTyped)
      ? (rolesTyped[0]?.name ?? 'user')
      : rolesTyped.name;

  const downloadTier = (profile?.download_tier as string) ?? 'general';

  return { roleName, downloadTier, email: (profile?.email as string) ?? null };
});

/**
 * 관리자 권한을 확인합니다. 관리자가 아니면 에러를 throw합니다.
 * 요청 단위 캐시되어 같은 요청 내 여러 번 호출해도 DB 쿼리는 1회만 실행됩니다.
 */
export const requireAdmin = cache(async (): Promise<{ userId: string }> => {
  const { user } = await getCurrentUser();
  if (!user) throw new Error('인증되지 않은 사용자입니다');

  const { roleName } = await getCurrentUserRole();
  if (roleName !== 'admin') throw new Error('관리자 권한이 필요합니다');

  return { userId: user.id };
});
