import type { SkillRow } from '@/admin/domain/types';

interface SkillCardProps {
  skill: SkillRow;
}

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg shadow-[#000080]/5 rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-3xl">
          {skill.icon}
        </div>
        {skill.status === 'published' ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
            Published
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">
            Draft
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{skill.title}</h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{skill.description ?? ''}</p>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="text-sm">⊞</span>
          <span>{skill.categoryName}</span>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
        <button
          type="button"
          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          수정
        </button>
        <button
          type="button"
          className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
