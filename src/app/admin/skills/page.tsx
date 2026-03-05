import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/infrastructure/tanstack-query/get-query-client';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetSkillsUseCase } from '@/admin/application/get-skills-use-case';
import type { SkillStatusFilter } from '@/admin/domain/types';
import SkillsCardGrid from '@/features/admin/SkillsCardGrid';
import SkillSearch from '@/features/admin/SkillSearch';

interface SkillsPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string; category?: string }>;
}

function parseStatus(raw: string | undefined): SkillStatusFilter {
  if (raw === 'published' || raw === 'drafted') return raw;
  return 'all';
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const { page: pageParam, q, status: statusParam, category: categoryParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const search = q?.trim() || undefined;
  const status = parseStatus(statusParam);
  const categoryId = categoryParam?.trim() || undefined;

  const repository = new SupabaseAdminRepository();
  const useCase = new GetSkillsUseCase(repository);
  const [result, statusCounts, categories] = await Promise.all([
    useCase.execute(page, 10, search, status, categoryId),
    repository.getSkillStatusCounts(),
    repository.getCategories(),
  ]);

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.admin.skills({ page, limit: 10, search, status, categoryId }), result);
  queryClient.setQueryData(queryKeys.admin.skillStatusCounts(), statusCounts);
  queryClient.setQueryData(queryKeys.admin.categories(), categories);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-8">
        <SkillsCardGrid
          result={result}
          currentStatus={status}
          currentCategoryId={categoryId}
          categories={categories}
          searchQuery={search}
          statusCounts={statusCounts}
          searchInput={
            <Suspense fallback={null}>
              <SkillSearch defaultValue={q ?? ''} />
            </Suspense>
          }
        />
      </div>
    </HydrationBoundary>
  );
}
