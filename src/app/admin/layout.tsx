import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentUserRole } from '@/shared/infrastructure/supabase/auth';
import AccessDenied from '@/features/admin/AccessDenied';
import AdminLayoutClient from '@/features/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: {
    default: '관리자',
    template: '%s | 관리자 | ELUO XCIPE',
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  const { roleName, email } = await getCurrentUserRole();

  if (roleName !== 'admin') {
    return <AccessDenied />;
  }

  const displayName = user.user_metadata?.display_name as string | undefined;
  const userName = displayName ?? email ?? user.email ?? '관리자';

  return (
    <AdminLayoutClient userName={userName} userRole={roleName}>
      {children}
    </AdminLayoutClient>
  );
}
