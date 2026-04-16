import Link from 'next/link';
import type { MemberRow, PaginatedResult, Role } from '@/admin/domain/types';
import type { ReactNode } from 'react';
import RoleSelect from './RoleSelect';
import TierSelect from './TierSelect';

interface MembersTableProps {
  result: PaginatedResult<MemberRow>;
  roles: Role[];
  currentUserId: string;
  pinnedMember?: MemberRow;
  searchQuery?: string;
  searchInput?: ReactNode;
}

function MemberRow({ member, roles, isCurrentUser, pinned = false }: {
  member: MemberRow;
  roles: Role[];
  isCurrentUser: boolean;
  pinned?: boolean;
}) {
  return (
    <tr className={`transition-colors ${pinned ? 'bg-[#000080]/3 hover:bg-[#000080]/5' : 'hover:bg-[#000080]/3'}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-[#000080]/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#000080]">
              {(member.name ?? member.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#000080]">
              {member.name ?? '-'}
            </span>
            {pinned && (
              <span className="px-1.5 py-0.5 bg-[#000080] text-white rounded text-[9px] font-black">나</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-[#000080]/70">{member.email}</td>
      <td className="px-6 py-4">
        <RoleSelect
          memberId={member.id}
          currentRoleId={member.roleId}
          currentRoleName={member.roleName}
          roles={roles}
          isCurrentUser={isCurrentUser}
        />
      </td>
      <td className="px-6 py-4">
        <TierSelect
          memberId={member.id}
          currentTier={member.downloadTier}
          disabled={member.roleName === 'admin' || member.roleName === 'viewer' || isCurrentUser}
        />
      </td>
      <td className="px-6 py-4 text-sm text-[#000080]/60">
        {new Date(member.createdAt).toLocaleDateString('ko-KR')}
      </td>
      <td className="px-6 py-4">
        {member.status === 'active' ? (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">
            Active
          </span>
        ) : (
          <span className="px-2 py-1 bg-[#000080]/10 text-[#000080]/40 rounded-lg text-[10px] font-black uppercase">
            Pending
          </span>
        )}
      </td>
    </tr>
  );
}

export default function MembersTable({ result, roles, currentUserId, pinnedMember, searchQuery, searchInput }: MembersTableProps) {
  const { data, page, totalPages } = result;
  const totalCount = result.totalCount + (pinnedMember ? 1 : 0);

  if (data.length === 0 && !pinnedMember) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#000080]/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#000080]">회원 목록</h3>
          {searchInput}
        </div>
        <p className="text-sm text-[#000080]/40 text-center py-8">
          {searchQuery ? '검색 결과가 없습니다' : '데이터가 없습니다'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#000080]/5 overflow-hidden">
      <div className="p-6 border-b border-[#000080]/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#000080]">회원 목록</h3>
          <p className="text-xs text-[#000080]/40 mt-1">전체 {totalCount.toLocaleString()}명</p>
        </div>
        {searchInput}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#000080]/5">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">역할</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">다운로드 등급</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">가입일</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#000080]/5">
            {pinnedMember && (
              <MemberRow
                key={pinnedMember.id}
                member={pinnedMember}
                roles={roles}
                isCurrentUser={true}
                pinned={true}
              />
            )}
            {data.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                roles={roles}
                isCurrentUser={member.id === currentUserId}
              />
            ))}
          </tbody>
        </table>
        {data.length === 0 && pinnedMember && (
          <p className="text-sm text-[#000080]/40 text-center py-8">
            {searchQuery ? '검색 결과가 없습니다' : '다른 회원이 없습니다'}
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#000080]/5 flex items-center justify-between">
        <p className="text-xs text-[#000080]/40">
          {page} / {totalPages} 페이지
        </p>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`?${new URLSearchParams({ ...(searchQuery ? { q: searchQuery } : {}), page: String(page - 1) }).toString()}`}
              className="px-3 py-1.5 text-xs font-semibold text-[#000080] border border-[#000080]/20 rounded-lg hover:bg-[#000080]/5 transition-colors"
            >
              이전
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Link
                key={pageNum}
                href={`?${new URLSearchParams({ ...(searchQuery ? { q: searchQuery } : {}), page: String(pageNum) }).toString()}`}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  pageNum === page
                    ? 'bg-[#000080] text-white'
                    : 'text-[#000080] border border-[#000080]/20 hover:bg-[#000080]/5'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
          {page < totalPages && (
            <Link
              href={`?${new URLSearchParams({ ...(searchQuery ? { q: searchQuery } : {}), page: String(page + 1) }).toString()}`}
              className="px-3 py-1.5 text-xs font-semibold text-[#000080] border border-[#000080]/20 rounded-lg hover:bg-[#000080]/5 transition-colors"
            >
              다음
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
