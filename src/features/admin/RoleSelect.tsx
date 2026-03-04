'use client';

import { useState, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { updateMemberRole } from '@/app/admin/members/actions';
import type { Role } from '@/admin/domain/types';

interface RoleSelectProps {
  memberId: string;
  currentRoleId: string;
  currentRoleName: string;
  roles: Role[];
  isCurrentUser: boolean;
}

export default function RoleSelect({
  memberId,
  currentRoleId,
  currentRoleName,
  roles,
  isCurrentUser,
}: RoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function handleChange(newRoleId: string) {
    if (newRoleId === currentRoleId) return;

    startTransition(async () => {
      setFeedback(null);
      const result = await updateMemberRole(memberId, newRoleId);
      if (result.success) {
        setFeedback({ type: 'success', message: '역할이 변경되었습니다' });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: 'error', message: result.error ?? '역할 변경에 실패했습니다' });
        setTimeout(() => setFeedback(null), 5000);
      }
    });
  }

  if (isCurrentUser) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#000080]/70">{currentRoleName}</span>
        <span className="text-[10px] text-[#000080]/30">(본인)</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Select
        defaultValue={currentRoleId}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger className="h-8 w-32 text-xs border-[#000080]/20 text-[#000080]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id} className="text-xs">
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {feedback && (
        <p
          className={`text-[10px] ${
            feedback.type === 'success' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
