'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleBookmark } from '@/app/(portal)/dashboard/actions';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';

export function useToggleBookmark(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => toggleBookmark(skillId),
    onMutate: async (skillId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks.ids(userId) });

      // Snapshot previous value
      const previousIds = queryClient.getQueryData<string[]>(queryKeys.bookmarks.ids(userId));

      // Optimistically update
      queryClient.setQueryData<string[]>(queryKeys.bookmarks.ids(userId), (old) => {
        if (!old) return [skillId];
        return old.includes(skillId)
          ? old.filter((id) => id !== skillId)
          : [...old, skillId];
      });

      return { previousIds };
    },
    onError: (_err, _skillId, context) => {
      // Rollback on error
      if (context?.previousIds) {
        queryClient.setQueryData(queryKeys.bookmarks.ids(userId), context.previousIds);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
}
