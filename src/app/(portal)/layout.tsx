import { redirect } from 'next/navigation';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseDashboardRepository } from '@/dashboard/infrastructure/supabase-dashboard-repository';
import { GetCategoriesUseCase } from '@/dashboard/application/get-categories-use-case';
import type { UserProfile, CategoryItem } from '@/dashboard/domain/types';
import DashboardLayoutClient from '@/features/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ?? user.email ?? '';

  const userProfile: UserProfile = {
    email: user.email ?? '',
    displayName,
  };

  const repository = new SupabaseDashboardRepository();
  const getCategoriesUseCase = new GetCategoriesUseCase(repository);

  // 카테고리 조회와 역할 조회를 병렬 실행
  const [categories, profileResult] = await Promise.all([
    getCategoriesUseCase.execute(),
    supabase
      .from('profiles')
      .select('roles(name)')
      .eq('id', user.id)
      .single()
      .then(({ data }) => data, () => null),
  ]);

  let isViewer = false;
  if (profileResult) {
    const roles = profileResult.roles as { name: string } | { name: string }[] | null;
    const roleName = roles
      ? Array.isArray(roles) ? roles[0]?.name : roles.name
      : null;
    isViewer = roleName === 'viewer';
  }

  return (
    <DashboardLayoutClient userProfile={userProfile} categories={categories} isViewer={isViewer}>
      {children}
    </DashboardLayoutClient>
  );
}
