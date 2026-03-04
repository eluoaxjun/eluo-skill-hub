import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetMembersUseCase } from '@/admin/application/get-members-use-case';
import MembersTable from '@/features/admin/MembersTable';

interface MembersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const repository = new SupabaseAdminRepository();
  const useCase = new GetMembersUseCase(repository);
  const result = await useCase.execute(page, 10);

  return (
    <div className="p-8">
      <MembersTable result={result} />
    </div>
  );
}
