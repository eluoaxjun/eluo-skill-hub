import type { SkillSummary } from "../types/dashboard";

interface SkillCardProps {
  readonly skill: SkillSummary;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{skill.icon}</div>
      <h3 className="font-medium text-card-foreground mb-1">{skill.name}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {skill.description}
      </p>
      <div className="flex flex-wrap gap-1">
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
          {skill.category}
        </span>
        {skill.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
