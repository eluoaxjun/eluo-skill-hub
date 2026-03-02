import { Entity } from "@/shared/domain/types/Entity";

export interface FeedbackLogProps {
  id: string;
  userId: string;
  skillId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export class FeedbackLog extends Entity<string> {
  private readonly _userId: string;
  private readonly _skillId: string;
  private readonly _rating: number;
  private readonly _comment: string | null;
  private readonly _createdAt: Date;

  private constructor(props: FeedbackLogProps) {
    super(props.id);
    this._userId = props.userId;
    this._skillId = props.skillId;
    this._rating = props.rating;
    this._comment = props.comment;
    this._createdAt = props.createdAt;
  }

  static create(props: FeedbackLogProps): FeedbackLog {
    if (props.rating < 1 || props.rating > 5) {
      throw new RangeError(`rating은 1~5 사이여야 합니다. 입력값: ${props.rating}`);
    }
    return new FeedbackLog(props);
  }

  get userId(): string {
    return this._userId;
  }

  get skillId(): string {
    return this._skillId;
  }

  get rating(): number {
    return this._rating;
  }

  get comment(): string | null {
    return this._comment;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
