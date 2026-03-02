import { Entity } from "@/shared/domain/types/Entity";

interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Category extends Entity<string> {
  private readonly _name: string;
  private readonly _slug: string;
  private readonly _icon: string;
  private readonly _sortOrder: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: CategoryProps) {
    super(props.id);
    this._name = props.name;
    this._slug = props.slug;
    this._icon = props.icon;
    this._sortOrder = props.sortOrder;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CategoryProps): Category {
    if (!props.name) {
      throw new Error("카테고리 이름은 필수입니다");
    }
    if (!props.slug) {
      throw new Error("카테고리 slug는 필수입니다");
    }
    if (!props.icon) {
      throw new Error("카테고리 아이콘은 필수입니다");
    }
    return new Category(props);
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get icon(): string {
    return this._icon;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
