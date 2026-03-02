'use client';

import React from 'react';

export interface MemberRow {
  id: string;
  email: string;
  displayName: string;
  roleId: string;
  roleName: string;
  createdAt: string;
}

export interface RoleOption {
  id: string;
  name: string;
}

interface MemberTableProps {
  members: MemberRow[];
  roles: RoleOption[];
  currentUserId: string;
  loadingMemberIds: Set<string>;
  onRoleChange: (memberId: string, newRoleId: string) => void;
}

export function MemberTable({
  members,
  roles,
  currentUserId,
  loadingMemberIds,
  onRoleChange,
}: MemberTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        등록된 회원이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm text-slate-700">
        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">이메일</th>
            <th className="px-6 py-3 text-left font-semibold">이름</th>
            <th className="px-6 py-3 text-left font-semibold">역할</th>
            <th className="px-6 py-3 text-left font-semibold">가입일</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {members.map((member) => {
            const isCurrentUser = member.id === currentUserId;
            const isLoading = loadingMemberIds.has(member.id);
            const isDisabled = isCurrentUser || isLoading;

            return (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4 text-slate-400">{member.displayName}</td>
                <td className="px-6 py-4">
                  <select
                    value={member.roleId}
                    disabled={isDisabled}
                    onChange={(e) => onRoleChange(member.id, e.target.value)}
                    className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
