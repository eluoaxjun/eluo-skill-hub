'use client';

import { useState } from 'react';
import { changeUserRoleAction } from './actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/table';
import { Button } from '@/shared/ui/components/button';
import { Badge } from '@/shared/ui/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/select';

interface RoleOption {
  id: string;
  name: string;
}

interface UserRow {
  id: string;
  email: string;
  role: RoleOption;
  createdAt: string;
}

interface UserTableProps {
  users: UserRow[];
  roles: RoleOption[];
  currentUserId: string;
}

function getRoleLabel(name: string): string {
  switch (name) {
    case 'admin':
      return '관리자';
    case 'user':
      return '일반 사용자';
    default:
      return name;
  }
}

export default function UserTable({ users, roles, currentUserId }: UserTableProps) {
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [retryTarget, setRetryTarget] = useState<{
    userId: string;
    roleId: string;
  } | null>(null);

  const handleRoleChange = async (
    targetUserId: string,
    newRoleId: string
  ) => {
    setLoading(targetUserId);
    setMessage(null);
    setRetryTarget(null);

    const result = await changeUserRoleAction(
      currentUserId,
      targetUserId,
      newRoleId
    );

    setLoading(null);

    if (result.status === 'success') {
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
      setRetryTarget({ userId: targetUserId, roleId: newRoleId });
    }
  };

  return (
    <div>
      {message && (
        <div
          role="alert"
          className={`mb-4 flex items-center justify-between rounded p-3 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span>{message.text}</span>
          {message.type === 'error' && retryTarget && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleRoleChange(retryTarget.userId, retryTarget.roleId)
              }
            >
              다시 시도
            </Button>
          )}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이메일</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const isLoading = loading === user.id;

            return (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role.name === 'admin' ? 'default' : 'secondary'}
                  >
                    {getRoleLabel(user.role.name)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role.id}
                    onValueChange={(newRoleId) =>
                      handleRoleChange(user.id, newRoleId)
                    }
                    disabled={isCurrentUser || isLoading}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {getRoleLabel(role.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
