import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/infrastructure/tanstack-query/get-query-client';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { getCurrentUser } from '@/shared/infrastructure/supabase/auth';
import { getDashboardSkillsAction, getBookmarkedSkillIdsAction } from '@/app/(portal)/dashboard/actions';
import DashboardSkillGrid from '@/features/dashboard/DashboardSkillGrid';
import DashboardSearchBar from '@/features/dashboard/DashboardSearchBar';

const DEFAULT_LIMIT = 9;

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  const searchQuery =
    typeof params.q === 'string' ? params.q.trim() : undefined;
  const limitParam =
    typeof params.limit === 'string' ? parseInt(params.limit, 10) : DEFAULT_LIMIT;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT;
  const categoryId =
    typeof params.category === 'string' ? params.category : undefined;

  const queryClient = getQueryClient();
  const { user } = await getCurrentUser();
  const userId = user?.id ?? '';

  const skillsParams = { limit, search: searchQuery, categoryId };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.skills(skillsParams),
      queryFn: () => getDashboardSkillsAction(limit, searchQuery, categoryId),
    }),
    userId
      ? queryClient.prefetchQuery({
          queryKey: queryKeys.bookmarks.ids(userId),
          queryFn: () => getBookmarkedSkillIdsAction(),
        })
      : Promise.resolve(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardSearchBar defaultValue={searchQuery} categoryId={categoryId} />

      <DashboardSkillGrid
        userId={userId}
        searchQuery={searchQuery}
        categoryId={categoryId}
        currentLimit={limit}
      />
    </HydrationBoundary>
  );
}
