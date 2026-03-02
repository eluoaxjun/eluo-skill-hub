import { ValueObject } from '@/shared/domain/types/ValueObject';

export type SkillStatusValue = 'active' | 'inactive';

interface SkillStatusProps {
  value: SkillStatusValue;
}

export class SkillStatus extends ValueObject<SkillStatusProps> {
  static active(): SkillStatus {
    return new SkillStatus({ value: 'active' });
  }

  static inactive(): SkillStatus {
    return new SkillStatus({ value: 'inactive' });
  }

  static from(value: SkillStatusValue): SkillStatus {
    return new SkillStatus({ value });
  }

  get value(): SkillStatusValue {
    return this.props.value;
  }

  get isActive(): boolean {
    return this.props.value === 'active';
  }
}
