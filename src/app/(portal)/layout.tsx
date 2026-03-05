import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentUserRole } from '@/shared/infrastructure/supabase/auth';
import { SupabaseDashboardRepository } from '@/dashboard/infrastructure/supabase-dashboard-repository';
import { GetCategoriesUseCase } from '@/dashboard/application/get-categories-use-case';
import type { UserProfile } from '@/dashboard/domain/types';
import DashboardLayoutClient from '@/features/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();

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
  const [categories, { roleName }] = await Promise.all([
    getCategoriesUseCase.execute(),
    getCurrentUserRole(),
  ]);

  const isViewer = roleName === 'viewer';

  return (
    <DashboardLayoutClient userProfile={userProfile} categories={categories} isViewer={isViewer}>
      {children}
    </DashboardLayoutClient>
  );
}
