import { getCurrentUser } from '@/shared/infrastructure/supabase/auth';
import DashboardSkillGrid from '@/features/dashboard/DashboardSkillGrid';
import DashboardSearchBar from '@/features/dashboard/DashboardSearchBar';

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
