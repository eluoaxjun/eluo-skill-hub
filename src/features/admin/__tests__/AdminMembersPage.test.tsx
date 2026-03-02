import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminMembersPage } from '../AdminMembersPage';
import type { MemberRow } from '../MemberTable';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

const mockRoles = [
  { id: 'role-001', name: 'user' },
  { id: 'role-002', name: 'admin' },
];

const mockMembers: MemberRow[] = [
  {
    id: 'user-001',
    email: 'alice@example.com',
    displayName: '-',
    roleId: 'role-001',
    roleName: 'user',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-002',
    email: 'bob@example.com',
    displayName: '-',
    roleId: 'role-002',
    roleName: 'admin',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

describe('AdminMembersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 회원 목록이 렌더링된다', () => {
    render(
      <AdminMembersPage
        initialMembers={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        updateMemberRole={jest.fn().mockResolvedValue({ success: true })}
      />
    );
    expect(screen.getByText('alice@example.com')).toBeTruthy();
    expect(screen.getByText('bob@example.com')).toBeTruthy();
  });

  it('역할 변경 성공 시 toast.success 호출', async () => {
    const { toast } = await import('sonner');
    const mockUpdateMemberRole = jest.fn().mockResolvedValue({ success: true });

    render(
      <AdminMembersPage
        initialMembers={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        updateMemberRole={mockUpdateMemberRole}
      />
    );

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'role-002');

    expect(mockUpdateMemberRole).toHaveBeenCalledWith('user-001', 'role-002');
    expect(toast.success).toHaveBeenCalled();
  });

  it('역할 변경 실패 시 toast.error 호출', async () => {
    const { toast } = await import('sonner');
    const mockUpdateMemberRole = jest.fn().mockResolvedValue({ error: '권한이 없습니다.' });

    render(
      <AdminMembersPage
        initialMembers={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        updateMemberRole={mockUpdateMemberRole}
      />
    );

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'role-002');

    expect(toast.error).toHaveBeenCalled();
  });

  it('역할 변경 중 해당 회원 드롭다운이 disabled 상태가 된다', async () => {
    let resolveUpdate: (value: { success: true }) => void;
    const pendingPromise = new Promise<{ success: true }>((resolve) => {
      resolveUpdate = resolve;
    });
    const mockUpdateMemberRole = jest.fn().mockReturnValue(pendingPromise);

    render(
      <AdminMembersPage
        initialMembers={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        updateMemberRole={mockUpdateMemberRole}
      />
    );

    const selects = screen.getAllByRole('combobox');
    // await 없이 selectOptions 실행 → 비동기 처리 트리거
    void userEvent.selectOptions(selects[0], 'role-002');

    // 로딩 상태가 반영될 때까지 waitFor
    await waitFor(() => {
      const updatedSelects = screen.getAllByRole('combobox');
      expect((updatedSelects[0] as HTMLSelectElement).disabled).toBe(true);
    });

    resolveUpdate!({ success: true });
  });

  it('빈 회원 목록 시 빈 상태 메시지가 표시된다', () => {
    render(
      <AdminMembersPage
        initialMembers={[]}
        roles={mockRoles}
        currentUserId="other-user"
        updateMemberRole={jest.fn().mockResolvedValue({ success: true })}
      />
    );
    expect(screen.getByText('등록된 회원이 없습니다')).toBeTruthy();
  });
});
