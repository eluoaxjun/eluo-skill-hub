import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetFeedbacksUseCase } from '@/admin/application/get-feedbacks-use-case';
import FeedbacksTable from '@/features/admin/FeedbacksTable';

interface FeedbacksPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function FeedbacksPage({ searchParams }: FeedbacksPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const repository = new SupabaseAdminRepository();
  const useCase = new GetFeedbacksUseCase(repository);
  const result = await useCase.execute(page, 10);

  return (
    <div className="p-8">
      <FeedbacksTable result={result} />
    </div>
  );
}
