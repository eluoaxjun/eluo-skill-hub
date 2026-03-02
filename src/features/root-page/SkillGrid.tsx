import type { Skill } from "@/skill-marketplace/domain/entities/Skill";

interface SkillGridProps {
  skills: Skill[];
}

// NOTE: SkillGrid는 SkillCardGrid로 대체 예정. 현재는 레거시 코드.
export function SkillGrid({ skills: _skills }: SkillGridProps) {
  return null;
}
