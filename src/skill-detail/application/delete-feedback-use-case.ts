import type { ISkillDetailRepository } from './ports';
import type { DeleteFeedbackResult } from '../domain/types';

export class DeleteFeedbackUseCase {
  constructor(private readonly repository: ISkillDetailRepository) {}

  async execute(feedbackId: string): Promise<DeleteFeedbackResult> {
    const replyCount = await this.repository.getFeedbackReplyCount(feedbackId);

    if (replyCount > 0) {
      await this.repository.softDeleteFeedback(feedbackId);
    } else {
      await this.repository.deleteFeedback(feedbackId);
    }

    return { success: true };
  }
}
