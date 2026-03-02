import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedbackLog } from '../domain/entities/FeedbackLog';
import type { FeedbackLogRepository } from '../domain/repositories/FeedbackLogRepository';

export class SupabaseFeedbackLogRepository implements FeedbackLogRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(log: FeedbackLog): Promise<void> {
    const { error } = await this.client
      .from('skill_feedback_logs')
      .insert({
        id: log.id,
        user_id: log.userId,
        skill_id: log.skillId,
        rating: log.rating,
        comment: log.comment,
      });

    if (error) {
      throw new Error(`피드백 저장 실패: ${error.message}`);
    }
  }
}
