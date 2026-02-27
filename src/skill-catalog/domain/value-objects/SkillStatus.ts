import { ValueObject } from '@/shared/domain/types/ValueObject';

export type SkillStatusType = 'draft' | 'published' | 'archived';

const ALLOWED_TRANSITIONS: Record<SkillStatusType, SkillStatusType[]> = {
  draft: ['published'],
  published: ['archived'],
  archived: ['published'],
};

export class SkillStatus extends ValueObject<{ value: SkillStatusType }> {
  private constructor(value: SkillStatusType) {
    super({ value });
  }

  static draft(): SkillStatus {
    return new SkillStatus('draft');
  }

  static published(): SkillStatus {
    return new SkillStatus('published');
  }

  static archived(): SkillStatus {
    return new SkillStatus('archived');
  }

  static fromString(value: string): SkillStatus {
    if (value !== 'draft' && value !== 'published' && value !== 'archived') {
      throw new Error(`유효하지 않은 스킬 상태입니다: ${value}`);
    }
    return new SkillStatus(value);
  }

  get value(): SkillStatusType {
    return this.props.value;
  }

  canTransitionTo(target: SkillStatus): boolean {
    return ALLOWED_TRANSITIONS[this.value].includes(target.value);
  }
}
