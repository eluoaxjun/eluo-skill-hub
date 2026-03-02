import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberTable } from '../MemberTable';
import type { MemberRow } from '../MemberTable';

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

describe('MemberTable', () => {
  it('회원 목록이 테이블 행으로 렌더링된다 (이메일, 이름, 역할, 가입일)', () => {
    render(
      <MemberTable
        members={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        loadingMemberIds={new Set()}
        onRoleChange={jest.fn()}
      />
    );
    expect(screen.getByText('alice@example.com')).toBeTruthy();
    expect(screen.getByText('bob@example.com')).toBeTruthy();
  });

  it('역할 컬럼에 <select> 요소가 현재 roleId로 선택된 상태로 렌더링됨', () => {
    render(
      <MemberTable
        members={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        loadingMemberIds={new Set()}
        onRoleChange={jest.fn()}
      />
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect((selects[0] as HTMLSelectElement).value).toBe('role-001');
    expect((selects[1] as HTMLSelectElement).value).toBe('role-002');
  });

  it('currentUserId === member.id인 행의 <select>는 disabled', () => {
    render(
      <MemberTable
        members={mockMembers}
        roles={mockRoles}
        currentUserId="user-001"
        loadingMemberIds={new Set()}
        onRoleChange={jest.fn()}
      />
    );
    const selects = screen.getAllByRole('combobox');
    expect((selects[0] as HTMLSelectElement).disabled).toBe(true);
    expect((selects[1] as HTMLSelectElement).disabled).toBe(false);
  });

  it('loadingMemberIds에 포함된 memberId의 <select>는 disabled', () => {
    render(
      <MemberTable
        members={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        loadingMemberIds={new Set(['user-002'])}
        onRoleChange={jest.fn()}
      />
    );
    const selects = screen.getAllByRole('combobox');
    expect((selects[0] as HTMLSelectElement).disabled).toBe(false);
    expect((selects[1] as HTMLSelectElement).disabled).toBe(true);
  });

  it('<select> 변경(onChange) 시 onRoleChange(memberId, newRoleId) 콜백 호출', async () => {
    const onRoleChange = jest.fn();
    render(
      <MemberTable
        members={mockMembers}
        roles={mockRoles}
        currentUserId="other-user"
        loadingMemberIds={new Set()}
        onRoleChange={onRoleChange}
      />
    );
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'role-002');
    expect(onRoleChange).toHaveBeenCalledWith('user-001', 'role-002');
  });

  it('회원 없을 때 "등록된 회원이 없습니다" 메시지 렌더링', () => {
    render(
      <MemberTable
        members={[]}
        roles={mockRoles}
        currentUserId="other-user"
        loadingMemberIds={new Set()}
        onRoleChange={jest.fn()}
      />
    );
    expect(screen.getByText('등록된 회원이 없습니다')).toBeTruthy();
  });
});
