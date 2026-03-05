'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { getDashboardSkillsAction, getCategoriesAction } from '@/app/(portal)/dashboard/actions';

export function useDashboardSkills(params: {
  limit: number;
  search?: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.dashboard.skills(params),
    queryFn: () => getDashboardSkillsAction(params.limit, params.search, params.categoryId),
    staleTime: 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.dashboard.categories(),
    queryFn: () => getCategoriesAction(),
    staleTime: 5 * 60 * 1000, // categories change rarely
  });
}
