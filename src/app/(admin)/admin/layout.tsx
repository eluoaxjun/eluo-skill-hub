import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/user-account/infrastructure/SupabaseUserRepository';
import { GetCurrentUserRoleUseCase } from '@/user-account/application/GetCurrentUserRoleUseCase';
import AccessDeniedView from './_components/AccessDeniedView';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 방어적 코드: 미들웨어에서 이미 처리하지만, 직접 접근 시 대비
  if (!user) {
    redirect('/login');
  }

  const userRepository = new SupabaseUserRepository(supabase);
  const getCurrentUserRoleUseCase = new GetCurrentUserRoleUseCase(
    userRepository
  );

  const result = await getCurrentUserRoleUseCase.execute({
    userId: user.id,
  });

  // 역할 조회 실패 또는 관리자가 아닌 경우 접근 불가 안내
  if (result.status === 'error' || !result.role.isAdmin()) {
    return <AccessDeniedView />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar navigation */}
      <nav className="w-64 border-r bg-muted/40 p-6">
        <h2 className="text-lg font-semibold mb-6">관리자 페이지</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              대시보드
            </Link>
          </li>
          <li>
            <Link
              href="/admin/users"
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              사용자 관리
            </Link>
          </li>
          <li>
            <Link
              href="/admin/skills"
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              스킬 관리
            </Link>
          </li>
        </ul>
      </nav>
      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
