import { Entity } from '@/shared/domain/types/Entity';
import type { SkillStatus } from '../value-objects/SkillStatus';

export interface ManagedSkillProps {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  markdownFilePath: string | null;
  authorId: string;
  status: SkillStatus;
  createdAt: Date;
}

export class ManagedSkill extends Entity<string> {
  private readonly _title: string;
  private readonly _description: string | null;
  private readonly _categoryId: string;
  private readonly _markdownFilePath: string | null;
  private readonly _authorId: string;
  private readonly _status: SkillStatus;
  private readonly _createdAt: Date;

  private constructor(props: ManagedSkillProps) {
    super(props.id);
    this._title = props.title;
    this._description = props.description;
    this._categoryId = props.categoryId;
    this._markdownFilePath = props.markdownFilePath;
    this._authorId = props.authorId;
    this._status = props.status;
    this._createdAt = props.createdAt;
  }

  static create(props: ManagedSkillProps): ManagedSkill {
    return new ManagedSkill(props);
  }

  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get markdownFilePath(): string | null {
    return this._markdownFilePath;
  }

  get authorId(): string {
    return this._authorId;
  }

  get status(): SkillStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
