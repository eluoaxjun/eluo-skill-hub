import type {
  SkillDetailPopup,
  PaginatedFeedbacks,
  FeedbackWithReplies,
  FeedbackReply,
  SubmitFeedbackInput,
  SubmitReplyInput,
} from '../domain/types';

export interface UserRoleAndTier {
  readonly roleName: string;
  readonly downloadTier: string;
}

export interface ISkillDetailRepository {
  getSkillDetailPopup(skillId: string): Promise<SkillDetailPopup | null>;
  getFeedbacksWithReplies(skillId: string, limit?: number, offset?: number): Promise<PaginatedFeedbacks>;
  submitFeedback(userId: string, input: SubmitFeedbackInput): Promise<FeedbackWithReplies>;
  submitReply(userId: string, input: SubmitReplyInput): Promise<FeedbackReply>;
  deleteFeedback(feedbackId: string): Promise<void>;
  softDeleteFeedback(feedbackId: string): Promise<void>;
  deleteReply(replyId: string): Promise<void>;
  getFeedbackReplyCount(feedbackId: string): Promise<number>;
  getTemplateSignedUrl(filePath: string, bucket: string): Promise<string>;
  incrementDownloadCount(skillId: string): Promise<void>;
  getUserRoleAndTier(userId: string): Promise<UserRoleAndTier | null>;
  getSkillMinTier(skillId: string): Promise<string>;
}
