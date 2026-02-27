import { Entity } from '@/shared/domain/types/Entity';
import { SkillId } from '../value-objects/SkillId';

interface CategoryProps {
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
}

export class Category extends Entity<SkillId> {
  private props: CategoryProps;

  private constructor(id: SkillId, props: CategoryProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    name: string;
    slug: string;
    description: string;
    displayOrder: number;
  }): Category {
    const id = SkillId.generate();
    return new Category(id, { ...params });
  }

  static reconstruct(id: SkillId, props: CategoryProps): Category {
    return new Category(id, { ...props });
  }

  updateInfo(params: {
    name?: string;
    description?: string;
    displayOrder?: number;
  }): void {
    if (params.name !== undefined) this.props.name = params.name;
    if (params.description !== undefined) this.props.description = params.description;
    if (params.displayOrder !== undefined) this.props.displayOrder = params.displayOrder;
  }

  get name(): string { return this.props.name; }
  get slug(): string { return this.props.slug; }
  get description(): string { return this.props.description; }
  get displayOrder(): number { return this.props.displayOrder; }
}
