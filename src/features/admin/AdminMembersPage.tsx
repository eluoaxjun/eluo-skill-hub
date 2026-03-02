'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { MemberTable } from './MemberTable';
import type { MemberRow, RoleOption } from './MemberTable';

export type { RoleOption };

interface AdminMembersPageProps {
  initialMembers: MemberRow[];
  roles: RoleOption[];
  currentUserId: string;
  updateMemberRole: (
    targetUserId: string,
    newRoleId: string
  ) => Promise<{ success: true } | { error: string }>;
}

export function AdminMembersPage({
  initialMembers,
  roles,
  currentUserId,
  updateMemberRole,
}: AdminMembersPageProps) {
  const [members, setMembers] = useState<MemberRow[]>(initialMembers);
  const [loadingMemberIds, setLoadingMemberIds] = useState<Set<string>>(new Set());

  async function handleRoleChange(memberId: string, newRoleId: string) {
    setLoadingMemberIds((prev) => new Set(prev).add(memberId));
    try {
      const result = await updateMemberRole(memberId, newRoleId);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id !== memberId) return m;
            const newRole = roles.find((r) => r.id === newRoleId);
            return { ...m, roleId: newRoleId, roleName: newRole?.name ?? m.roleName };
          })
        );
        toast.success('역할이 변경되었습니다.');
      }
    } finally {
      setLoadingMemberIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">회원관리</h1>
        </div>
        <MemberTable
          members={members}
          roles={roles}
          currentUserId={currentUserId}
          loadingMemberIds={loadingMemberIds}
          onRoleChange={handleRoleChange}
        />
      </div>
    </div>
  );
}
