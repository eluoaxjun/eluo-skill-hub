import Link from 'next/link';
import { createSupabaseServerClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/user-account/infrastructure/SupabaseUserRepository';
import { GetAllUsersUseCase } from '@/user-account/application/GetAllUsersUseCase';
import { GetAllRolesUseCase } from '@/user-account/application/GetAllRolesUseCase';
import { Button } from '@/shared/ui/components/button';
import UserTable from './UserTable';

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const repository = new SupabaseUserRepository(supabase);

  const getAllUsersUseCase = new GetAllUsersUseCase(repository);
  const getAllRolesUseCase = new GetAllRolesUseCase(repository);

  const [usersResult, rolesResult] = await Promise.all([
    getAllUsersUseCase.execute(),
    getAllRolesUseCase.execute(),
  ]);

  if (usersResult.status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          사용자 목록을 불러오는 데 실패했습니다.
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin/users">다시 시도</Link>
        </Button>
      </div>
    );
  }

  if (rolesResult.status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          역할 목록을 불러오는 데 실패했습니다.
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin/users">다시 시도</Link>
        </Button>
      </div>
    );
  }

  const users = usersResult.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: { id: u.role.id, name: u.role.toString() },
    createdAt: u.createdAt.toISOString(),
  }));

  const roles = rolesResult.roles.map((r) => ({
    id: r.id,
    name: r.toString(),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">사용자 관리</h1>
      <UserTable
        users={users}
        roles={roles}
        currentUserId={user?.id ?? ''}
      />
    </div>
  );
}
