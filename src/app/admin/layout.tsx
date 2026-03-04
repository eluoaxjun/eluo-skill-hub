import { redirect } from 'next/navigation';
import { createClient } from '@/shared/infrastructure/supabase/server';
import AccessDenied from '@/features/admin/AccessDenied';
import AdminLayoutClient from '@/features/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, roles(name)')
    .eq('id', user.id)
    .single();

  const rolesRaw = profile?.roles;
  const rolesTyped = rolesRaw as { name: string } | { name: string }[] | null | undefined;
  const roleName =
    !rolesTyped
      ? 'user'
      : Array.isArray(rolesTyped)
        ? (rolesTyped[0]?.name ?? 'user')
        : rolesTyped.name;

  if (roleName !== 'admin') {
    return <AccessDenied />;
  }

  const displayName = user.user_metadata?.display_name as string | undefined;
  const userName = displayName ?? profile?.email ?? user.email ?? '관리자';


  return (
    <AdminLayoutClient userName={userName} userRole={roleName}>
      {children}
    </AdminLayoutClient>
  );
}
