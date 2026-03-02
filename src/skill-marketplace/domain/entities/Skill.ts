import { Entity } from "@/shared/domain/types/Entity";
import type { SkillCategory } from "../value-objects/SkillCategory";

export class Skill extends Entity<string> {
  private readonly _name: string;
  private readonly _description: string;
  private readonly _icon: string;
  private readonly _categories: SkillCategory[];
  private readonly _markdownContent: string | null;
  private readonly _createdAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    icon: string,
    categories: SkillCategory[],
    markdownContent: string | null = null,
    createdAt: Date = new Date()
  ) {
    super(id);
    this._name = name;
    this._description = description;
    this._icon = icon;
    this._categories = categories;
    this._markdownContent = markdownContent;
    this._createdAt = createdAt;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get icon(): string {
    return this._icon;
  }

  get categories(): ReadonlyArray<SkillCategory> {
    return this._categories;
  }

  get markdownContent(): string | null {
    return this._markdownContent;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
