import { FeedbackLog } from "../domain/entities/FeedbackLog";
import type { FeedbackLogRepository } from "../domain/repositories/FeedbackLogRepository";

export class SubmitFeedbackUseCase {
  constructor(private readonly repository: FeedbackLogRepository) {}

  async execute(
    userId: string,
    skillId: string,
    rating: number,
    comment: string | null
  ): Promise<void> {
    const log = FeedbackLog.create({
      id: crypto.randomUUID(),
      userId,
      skillId,
      rating,
      comment,
      createdAt: new Date(),
    });
    await this.repository.save(log);
  }
}
