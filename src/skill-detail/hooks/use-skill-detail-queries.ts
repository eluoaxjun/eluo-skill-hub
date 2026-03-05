'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import {
  getSkillDetailAction,
  getSkillFeedbacksAction,
  submitFeedbackAction,
  submitFeedbackReplyAction,
} from '@/app/(portal)/dashboard/actions';
import type {
  SkillDetailPopup,
  FeedbackWithReplies,
  SubmitFeedbackInput,
  SubmitReplyInput,
} from '@/skill-detail/domain/types';

export function useSkillDetail(skillId: string) {
  return useQuery({
    queryKey: queryKeys.skillDetail.detail(skillId),
    queryFn: async () => {
      const result = await getSkillDetailAction(skillId);
      if (!result.success) throw new Error(result.error);
      return result.skill;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000,
  });
}

const FEEDBACKS_PAGE_SIZE = 20;

export function useSkillFeedbacks(skillId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.skillDetail.feedbacks(skillId),
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getSkillFeedbacksAction(skillId, pageParam);
      if (!result.success) throw new Error(result.error);
      return {
        feedbacks: result.feedbacks,
        hasMore: result.hasMore,
        nextOffset: pageParam + result.feedbacks.length,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitFeedback(skillId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitFeedbackInput) => submitFeedbackAction(input),
    onSuccess: (result) => {
      if (!result.success) return;
      // Prepend the new feedback to the infinite query cache
      queryClient.setQueryData(
        queryKeys.skillDetail.feedbacks(skillId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old: { pages: Array<{ feedbacks: FeedbackWithReplies[]; hasMore: boolean; nextOffset: number }>; pageParams: number[] } | undefined) => {
          if (!old) return old;
          const newPages = [...old.pages];
          newPages[0] = {
            ...newPages[0],
            feedbacks: [result.feedback, ...newPages[0].feedbacks],
            nextOffset: newPages[0].nextOffset + 1,
          };
          return { ...old, pages: newPages };
        },
      );
    },
  });
}

export function useSubmitReply(skillId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitReplyInput) => submitFeedbackReplyAction(input),
    onSuccess: (result, input) => {
      if (!result.success) return;
      // Append reply to the matching feedback in cache
      queryClient.setQueryData(
        queryKeys.skillDetail.feedbacks(skillId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (old: { pages: Array<{ feedbacks: FeedbackWithReplies[]; hasMore: boolean; nextOffset: number }>; pageParams: number[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              feedbacks: page.feedbacks.map((f) =>
                f.id === input.feedbackId
                  ? { ...f, replies: [...f.replies, result.reply] }
                  : f,
              ),
            })),
          };
        },
      );
    },
  });
}
