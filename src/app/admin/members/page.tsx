import { Suspense } from 'react';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetMembersUseCase } from '@/admin/application/get-members-use-case';
import MembersTable from '@/features/admin/MembersTable';
import MemberSearch from '@/features/admin/MemberSearch';

interface MembersPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const search = q?.trim() || undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const repository = new SupabaseAdminRepository();
  const useCase = new GetMembersUseCase(repository);

  const currentUserId = user?.id ?? '';

  const [result, roles, pinnedMember] = await Promise.all([
    useCase.execute(page, 10, search, currentUserId),
    repository.getAllRoles(),
    currentUserId ? repository.getMemberById(currentUserId) : Promise.resolve(null),
  ]);

  return (
    <div className="p-8">
      <MembersTable
        result={result}
        roles={roles}
        currentUserId={currentUserId}
        pinnedMember={pinnedMember ?? undefined}
        searchQuery={search}
        searchInput={
          <Suspense>
            <MemberSearch defaultValue={search ?? ''} />
          </Suspense>
        }
      />
    </div>
  );
}
