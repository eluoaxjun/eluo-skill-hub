import type { SkillSummary } from "../types/dashboard";

interface SkillCardProps {
  readonly skill: SkillSummary;
  readonly onSkillClick?: (skill: SkillSummary) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function SkillCard({ skill, onSkillClick }: SkillCardProps) {
  const handleClick = () => {
    if (onSkillClick) {
      onSkillClick(skill);
    }
  };

  return (
    <div
      role={onSkillClick ? "button" : undefined}
      tabIndex={onSkillClick ? 0 : undefined}
      className={`rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow ${
        onSkillClick ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onSkillClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <h3 className="font-medium text-card-foreground mb-2">{skill.title}</h3>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
          {skill.category}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(skill.createdAt)}
        </span>
      </div>
    </div>
  );
}
