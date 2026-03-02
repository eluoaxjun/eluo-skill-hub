import React from 'react';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { AdminMembersPage } from '@/features/admin/AdminMembersPage';
import { getMembers, updateMemberRole } from './actions';
import type { MemberRow } from '@/features/admin/MemberTable';
import type { RoleOption } from '@/features/admin/AdminMembersPage';

export default async function AdminMembersPageRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { members, roles } = await getMembers();

  const initialMembers: MemberRow[] = members.map((m) => ({
    id: m.id,
    email: m.email,
    displayName: '-',
    roleId: m.roleId,
    roleName: m.roleName,
    createdAt: m.createdAt.toISOString(),
  }));

  const roleOptions: RoleOption[] = roles;

  return (
    <AdminMembersPage
      initialMembers={initialMembers}
      roles={roleOptions}
      currentUserId={user!.id}
      updateMemberRole={updateMemberRole}
    />
  );
}
