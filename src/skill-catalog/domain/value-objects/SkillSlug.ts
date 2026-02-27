import { ValueObject } from '@/shared/domain/types/ValueObject';
import { Result, ok, err, SkillCatalogError } from '../errors';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class SkillSlug extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): Result<SkillSlug, SkillCatalogError> {
    if (!SLUG_REGEX.test(value)) {
      return err({
        type: 'INVALID_SLUG',
        message: `유효하지 않은 슬러그 형식입니다: ${value}. 소문자 영숫자와 하이픈만 허용됩니다.`,
      });
    }
    return ok(new SkillSlug(value));
  }

  get value(): string {
    return this.props.value;
  }
}
