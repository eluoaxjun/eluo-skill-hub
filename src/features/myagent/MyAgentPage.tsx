import { SmartToyIcon } from "@/shared/ui/icons";
import { SkillCardGrid } from "@/features/root-page/SkillCardGrid";
import type { SkillViewModel } from "@/features/root-page/types";

interface MyAgentPageProps {
  skills: SkillViewModel[];
  bookmarkedIds: string[];
}

export function MyAgentPage({ skills, bookmarkedIds }: MyAgentPageProps) {
  if (skills.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <SmartToyIcon size={32} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            아직 북마크한 에이전트가 없습니다
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            관심 있는 에이전트를 북마크하면 이곳에 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
      <SkillCardGrid
        skills={skills}
        initialBookmarkedIds={bookmarkedIds}
        title="내 에이전트"
      />
    </div>
  );
}
