import { ValueObject } from '@/shared/domain/types/ValueObject';

export type SkillCategoryValue = '기획' | '디자인' | '퍼블리싱' | '개발' | 'QA';

export const VALID_CATEGORIES: ReadonlyArray<SkillCategoryValue> = [
  '기획',
  '디자인',
  '퍼블리싱',
  '개발',
  'QA',
] as const;

interface SkillCategoryProps {
  readonly value: SkillCategoryValue;
}

export class SkillCategory extends ValueObject<SkillCategoryProps> {
  private constructor(props: SkillCategoryProps) {
    super(props);
  }

  static create(value: string): SkillCategory {
    if (!SkillCategory.isValid(value)) {
      throw new Error(
        `올바른 카테고리를 선택해 주세요. 허용된 값: ${VALID_CATEGORIES.join(', ')}`,
      );
    }
    return new SkillCategory({ value });
  }

  static isValid(value: string): value is SkillCategoryValue {
    return (VALID_CATEGORIES as ReadonlyArray<string>).includes(value);
  }

  get value(): SkillCategoryValue {
    return this.props.value;
  }
}
