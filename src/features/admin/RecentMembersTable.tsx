import type { RecentMember } from '@/admin/domain/types';

interface RecentMembersTableProps {
  members: RecentMember[];
}

export default function RecentMembersTable({ members }: RecentMembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#000080]/5">
        <h3 className="text-lg font-bold text-[#000080] mb-6">최근 가입한 회원</h3>
        <p className="text-sm text-[#000080]/40 text-center py-8">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#000080]/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#000080]">최근 가입한 회원</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-[#000080]/10">
            <tr>
              <th className="pb-4 text-xs font-bold text-[#000080]/40 uppercase tracking-wider">이름</th>
              <th className="pb-4 text-xs font-bold text-[#000080]/40 uppercase tracking-wider">역할</th>
              <th className="pb-4 text-xs font-bold text-[#000080]/40 uppercase tracking-wider text-right">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#000080]/5">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#000080]/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#000080]">
                        {(member.displayName ?? member.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#000080]">
                        {member.displayName ?? member.email}
                      </p>
                      {member.displayName && (
                        <p className="text-xs text-[#000080]/50">{member.email}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-[#000080]/60">{member.roleName}</td>
                <td className="py-4 text-right">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
