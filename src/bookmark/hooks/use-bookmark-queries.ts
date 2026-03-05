'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import { getBookmarkedSkillIdsAction, getBookmarkedSkillsAction } from '@/app/(portal)/dashboard/actions';

export function useBookmarkedSkillIds(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bookmarks.ids(userId ?? ''),
    queryFn: () => getBookmarkedSkillIdsAction(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useBookmarkedSkills(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bookmarks.skills(userId ?? ''),
    queryFn: () => getBookmarkedSkillsAction(),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
