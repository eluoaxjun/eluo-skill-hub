import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetSkillsUseCase } from '@/admin/application/get-skills-use-case';
import SkillsTable from '@/features/admin/SkillsTable';

interface SkillsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const repository = new SupabaseAdminRepository();
  const useCase = new GetSkillsUseCase(repository);
  const result = await useCase.execute(page, 10);

  return (
    <div className="p-8">
      <SkillsTable result={result} />
    </div>
  );
}
