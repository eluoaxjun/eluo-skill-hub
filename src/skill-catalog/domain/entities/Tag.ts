import { Entity } from '@/shared/domain/types/Entity';
import { SkillId } from '../value-objects/SkillId';
import { Result, ok, err, SkillCatalogError } from '../errors';

interface TagProps {
  name: string;
}

export class Tag extends Entity<SkillId> {
  private props: TagProps;

  private constructor(id: SkillId, props: TagProps) {
    super(id);
    this.props = props;
  }

  static create(params: { name: string }): Result<Tag, SkillCatalogError> {
    if (params.name.length < 1 || params.name.length > 50) {
      return err({
        type: 'INVALID_SKILL_NAME',
        message: `태그 이름은 1자 이상 50자 이하여야 합니다. (현재: ${params.name.length}자)`,
      });
    }
    const id = SkillId.generate();
    return ok(new Tag(id, { name: params.name }));
  }

  static reconstruct(id: SkillId, props: TagProps): Tag {
    return new Tag(id, { ...props });
  }

  get name(): string { return this.props.name; }
}
