import type { ISkillDetailRepository } from './ports';
import type { SubmitFeedbackInput, SubmitFeedbackResult } from '../domain/types';

export class SubmitFeedbackUseCase {
  constructor(private readonly repository: ISkillDetailRepository) {}

  async execute(userId: string, input: SubmitFeedbackInput): Promise<SubmitFeedbackResult> {
    if (!input.comment.trim()) {
      return { success: false, error: '피드백 내용을 입력해주세요.' };
    }

    const feedback = await this.repository.submitFeedback(userId, input);
    return { success: true, feedback };
  }
}
