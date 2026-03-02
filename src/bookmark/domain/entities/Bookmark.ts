import { Entity } from "@/shared/domain/types/Entity";

export interface BookmarkProps {
  id: string;
  userId: string;
  skillId: string;
  createdAt: Date;
}

export class Bookmark extends Entity<string> {
  private readonly _userId: string;
  private readonly _skillId: string;
  private readonly _createdAt: Date;

  private constructor(props: BookmarkProps) {
    super(props.id);
    this._userId = props.userId;
    this._skillId = props.skillId;
    this._createdAt = props.createdAt;
  }

  static create(props: BookmarkProps): Bookmark {
    return new Bookmark(props);
  }

  get userId(): string {
    return this._userId;
  }

  get skillId(): string {
    return this._skillId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
