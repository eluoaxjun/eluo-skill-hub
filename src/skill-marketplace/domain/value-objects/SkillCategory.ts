import { ValueObject } from "@/shared/domain/types/ValueObject";

interface SkillCategoryProps {
  name: string;
  variant: "default" | "primary";
}

export class SkillCategory extends ValueObject<SkillCategoryProps> {
  get name(): string {
    return this.props.name;
  }

  get variant(): "default" | "primary" {
    return this.props.variant;
  }

  static create(
    name: string,
    variant: "default" | "primary"
  ): SkillCategory {
    return new SkillCategory({ name, variant });
  }
}
