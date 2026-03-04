import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetDashboardStatsUseCase } from '@/admin/application/get-dashboard-stats-use-case';
import DashboardContent from '@/features/admin/DashboardContent';

export default async function AdminDashboardPage() {
  const repository = new SupabaseAdminRepository();
  const useCase = new GetDashboardStatsUseCase(repository);
  const { stats, recentSkills, recentMembers } = await useCase.execute();

  return (
    <DashboardContent
      stats={stats}
      recentSkills={recentSkills}
      recentMembers={recentMembers}
    />
  );
}
