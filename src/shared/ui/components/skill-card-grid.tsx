import type { SkillSummary } from "../types/dashboard";
import { SkillCard } from "./skill-card";

interface SkillCardGridProps {
  readonly skills: readonly SkillSummary[];
  readonly onSkillClick?: (skill: SkillSummary) => void;
}

export function SkillCardGrid({ skills, onSkillClick }: SkillCardGridProps) {
  if (skills.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        등록된 스킬이 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} onSkillClick={onSkillClick} />
      ))}
    </div>
  );
}
