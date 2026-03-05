import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/infrastructure/tanstack-query/get-query-client';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { getCurrentUser } from '@/shared/infrastructure/supabase/auth';
import { getBookmarkedSkillsAction } from '@/app/(portal)/dashboard/actions';
import MyAgentSkillGrid from '@/features/dashboard/MyAgentSkillGrid';

export default async function MyAgentPage() {
  const { user } = await getCurrentUser();

  if (!user) return null;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.bookmarks.skills(user.id),
    queryFn: () => getBookmarkedSkillsAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyAgentSkillGrid userId={user.id} />
    </HydrationBoundary>
  );
}
