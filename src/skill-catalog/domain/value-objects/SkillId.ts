import { ValueObject } from '@/shared/domain/types/ValueObject';
import { Result, ok, err, SkillCatalogError } from '../errors';
import { randomUUID } from 'crypto';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class SkillId extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): Result<SkillId, SkillCatalogError> {
    if (!UUID_V4_REGEX.test(value)) {
      return err({
        type: 'INVALID_SLUG',
        message: `유효하지 않은 UUID v4 형식입니다: ${value}`,
      });
    }
    return ok(new SkillId(value));
  }

  static generate(): SkillId {
    return new SkillId(randomUUID());
  }

  get value(): string {
    return this.props.value;
  }
}
