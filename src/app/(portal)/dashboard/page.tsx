import type { Metadata } from 'next';
import { getCurrentUser } from '@/shared/infrastructure/supabase/auth';
import DashboardSkillGrid from '@/features/dashboard/DashboardSkillGrid';
import DashboardSearchBar from '@/features/dashboard/DashboardSearchBar';

export const metadata: Metadata = {
  title: '대시보드',
};

export default async function DashboardPage() {
  const { user } = await getCurrentUser();
  const userId = user?.id ?? '';

  return (
    <>
      <DashboardSearchBar />
      <DashboardSkillGrid userId={userId} />
    </>
  );
}
