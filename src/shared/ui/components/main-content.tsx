import type { SkillSummary, CategorySelection } from "../types/dashboard";
import { SkillCardGrid } from "./skill-card-grid";

interface MainContentProps {
  readonly filteredSkills: readonly SkillSummary[];
  readonly selectedCategory: CategorySelection;
  readonly isLoading: boolean;
  readonly onSkillClick?: (skill: SkillSummary) => void;
}

export function MainContent({
  filteredSkills,
  selectedCategory,
  isLoading,
  onSkillClick,
}: MainContentProps) {
  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      {selectedCategory === "전체" && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Eluo Skill Hub에 오신 것을 환영합니다
          </h1>
          <p className="text-muted-foreground">
            웹 에이전시의 기획-디자인-퍼블리싱-개발-QA 워크플로우를 자동화하는
            스킬을 탐색하세요.
          </p>
        </div>
      )}
      <SkillCardGrid skills={filteredSkills} onSkillClick={onSkillClick} />
    </main>
  );
}
