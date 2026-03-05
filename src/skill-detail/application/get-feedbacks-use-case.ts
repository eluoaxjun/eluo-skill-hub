import type { ISkillDetailRepository } from './ports';
import type { GetFeedbacksResult, FeedbackWithReplies, FeedbackReply } from '../domain/types';

const SECRET_MESSAGE = '비밀글입니다.';

export class GetFeedbacksUseCase {
  constructor(private readonly repository: ISkillDetailRepository) {}

  async execute(
    skillId: string,
    limit?: number,
    offset?: number,
    currentUserId?: string,
    isAdmin?: boolean,
  ): Promise<GetFeedbacksResult> {
    const result = await this.repository.getFeedbacksWithReplies(skillId, limit, offset);

    const feedbacks = result.feedbacks.map((f) =>
      this.maskSecretFeedback(f, currentUserId, isAdmin),
    );

    return {
      success: true,
      feedbacks,
      totalCount: result.totalCount,
      hasMore: result.hasMore,
    };
  }

  private maskSecretFeedback(
    feedback: FeedbackWithReplies,
    currentUserId?: string,
    isAdmin?: boolean,
  ): FeedbackWithReplies {
    if (!feedback.isSecret) return feedback;

    const canView = isAdmin || feedback.userId === currentUserId;
    if (canView) return feedback;

    return {
      ...feedback,
      comment: SECRET_MESSAGE,
      replies: feedback.replies.map((reply) =>
        this.maskSecretReply(reply, currentUserId, isAdmin),
      ),
    };
  }

  private maskSecretReply(
    reply: FeedbackReply,
    currentUserId?: string,
    isAdmin?: boolean,
  ): FeedbackReply {
    const canView = isAdmin || reply.userId === currentUserId;
    if (canView) return reply;

    return {
      ...reply,
      content: SECRET_MESSAGE,
    };
  }
}
