'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/infrastructure/tanstack-query/query-keys';
import {
  getSkillDetailAction,
  getSkillFeedbacksAction,
  submitFeedbackAction,
  submitFeedbackReplyAction,
  deleteFeedbackAction,
  deleteReplyAction,
  getTemplateDownloadUrlAction,
} from '@/app/(portal)/dashboard/actions';
import type {
  FeedbackWithReplies,
  SkillDetailPopup,
  SkillTemplateInfo,
  SubmitFeedbackInput,
  SubmitReplyInput,
  DeleteFeedbackResult,
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

type FeedbackPages = {
  pages: Array<{ feedbacks: FeedbackWithReplies[]; hasMore: boolean; nextOffset: number }>;
  pageParams: number[];
};

export function useTemplateDownload(skillId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templates: SkillTemplateInfo[]) => {
      const results = [];
      for (const template of templates) {
        const result = await getTemplateDownloadUrlAction(template.id);
        results.push(result);
      }
      return results;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.skillDetail.detail(skillId) });
      const previous = queryClient.getQueryData<SkillDetailPopup>(queryKeys.skillDetail.detail(skillId));

      if (previous) {
        queryClient.setQueryData<SkillDetailPopup>(
          queryKeys.skillDetail.detail(skillId),
          { ...previous, downloadCount: previous.downloadCount + 1 },
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.skillDetail.detail(skillId), context.previous);
      }
    },
  });
}

export function useDeleteFeedback(skillId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) => deleteFeedbackAction(feedbackId),
    onSuccess: (result, feedbackId) => {
      if (!result.success) return;

      queryClient.setQueryData(
        queryKeys.skillDetail.feedbacks(skillId),
        (old: FeedbackPages | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              feedbacks: page.feedbacks
                .map((f) => {
                  if (f.id !== feedbackId) return f;
                  // 대댓글이 있으면 소프트 삭제 표시, 없으면 제거
                  if (f.replies.length > 0) {
                    return { ...f, isDeleted: true, comment: null };
                  }
                  return null;
                })
                .filter((f): f is FeedbackWithReplies => f !== null),
            })),
          };
        },
      );
    },
  });
}

export function useDeleteReply(skillId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => deleteReplyAction(replyId),
    onSuccess: (result, replyId) => {
      if (!result.success) return;

      queryClient.setQueryData(
        queryKeys.skillDetail.feedbacks(skillId),
        (old: FeedbackPages | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              feedbacks: page.feedbacks.map((f) => ({
                ...f,
                replies: f.replies.filter((r) => r.id !== replyId),
              })),
            })),
          };
        },
      );
    },
  });
}
