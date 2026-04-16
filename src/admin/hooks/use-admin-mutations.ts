'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSkill, updateSkill, deleteSkill } from '@/app/admin/skills/actions';
import { updateMemberRole, updateMemberTier } from '@/app/admin/members/actions';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createSkill>[0]) => createSkill(payload),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      }
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateSkill>[0]) => updateSkill(payload),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.skillDetail.all });
      }
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => deleteSkill(skillId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.skillDetail.all });
      }
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, roleId }: { memberId: string; roleId: string }) =>
      updateMemberRole(memberId, roleId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      }
    },
  });
}

export function useUpdateMemberTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, tier }: { memberId: string; tier: string }) =>
      updateMemberTier(memberId, tier),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      }
    },
  });
}
