import Link from 'next/link';
import type { MemberRow, PaginatedResult } from '@/admin/domain/types';

interface MembersTableProps {
  result: PaginatedResult<MemberRow>;
}

export default function MembersTable({ result }: MembersTableProps) {
  const { data, page, totalPages } = result;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#000080]/5">
        <h3 className="text-lg font-bold text-[#000080] mb-4">회원 목록</h3>
        <p className="text-sm text-[#000080]/40 text-center py-8">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#000080]/5 overflow-hidden">
      <div className="p-6 border-b border-[#000080]/5">
        <h3 className="text-lg font-bold text-[#000080]">회원 목록</h3>
        <p className="text-xs text-[#000080]/40 mt-1">전체 {result.totalCount.toLocaleString()}명</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#000080]/5">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">역할</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">가입일</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#000080]/5">
            {data.map((member) => (
              <tr key={member.id} className="hover:bg-[#000080]/3 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#000080]/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#000080]">
                        {(member.displayName ?? member.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#000080]">
                      {member.displayName ?? '-'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#000080]/70">{member.email}</td>
                <td className="px-6 py-4 text-sm text-[#000080]/70">{member.roleName}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#000080]/5 flex items-center justify-between">
        <p className="text-xs text-[#000080]/40">
          {page} / {totalPages} 페이지
        </p>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
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
                href={`?page=${pageNum}`}
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
              href={`?page=${page + 1}`}
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
