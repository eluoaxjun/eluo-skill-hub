import type { RecentSkill } from '@/admin/domain/types';

interface RecentSkillsListProps {
  skills: RecentSkill[];
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function RecentSkillsList({ skills }: RecentSkillsListProps) {
  if (skills.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#000080]/5">
        <h3 className="text-lg font-bold text-[#000080] mb-6">최근 등록된 스킬</h3>
        <p className="text-sm text-[#000080]/40 text-center py-8">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#000080]/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#000080]">최근 등록된 스킬</h3>
      </div>
      <div className="space-y-4">
        {skills.map((skill, idx) => (
          <div
            key={skill.id}
            className={`flex items-center gap-4 p-3 rounded-xl hover:bg-[#000080]/5 transition-all group ${
              idx > 0 ? 'border-t border-[#000080]/5 pt-4' : ''
            }`}
          >
            <div className="size-12 rounded-lg bg-[#FEFE01]/40 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#000080]">
                {skill.title.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[#000080] truncate">{skill.title}</h4>
              {skill.description && (
                <p className="text-xs text-[#000080]/60 truncate">{skill.description}</p>
              )}
              <p className="text-xs text-[#000080]/40">{skill.categoryName}</p>
            </div>
            <span className="text-xs font-semibold text-[#000080]/40 shrink-0">
              {formatRelativeTime(skill.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
