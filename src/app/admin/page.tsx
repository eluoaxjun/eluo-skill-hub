import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/infrastructure/tanstack-query/get-query-client';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetDashboardStatsUseCase } from '@/admin/application/get-dashboard-stats-use-case';
import DashboardContent from '@/features/admin/DashboardContent';

export default async function AdminDashboardPage() {
  const repository = new SupabaseAdminRepository();
  const useCase = new GetDashboardStatsUseCase(repository);
  const data = await useCase.execute();

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.admin.stats(), data);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent
        stats={data.stats}
        recentSkills={data.recentSkills}
        recentMembers={data.recentMembers}
      />
    </HydrationBoundary>
  );
}
