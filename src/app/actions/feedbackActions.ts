'use server';

import { createClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseFeedbackLogRepository } from '@/skill-feedback/infrastructure/SupabaseFeedbackLogRepository';
import { SubmitFeedbackUseCase } from '@/skill-feedback/application/SubmitFeedbackUseCase';

export async function submitFeedbackAction(
  skillId: string,
  rating: number,
  comment: string | null
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증 필요');
  }

  const repository = new SupabaseFeedbackLogRepository(supabase);
  const useCase = new SubmitFeedbackUseCase(repository);
  await useCase.execute(user.id, skillId, rating, comment);
}
