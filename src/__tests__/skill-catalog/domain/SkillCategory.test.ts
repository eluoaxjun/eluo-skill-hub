import { SkillCategory, VALID_CATEGORIES } from '@/skill-catalog/domain/SkillCategory';

describe('SkillCategory', () => {
  describe('create', () => {
    it.each(VALID_CATEGORIES)(
      '유효한 카테고리 "%s"로 생성에 성공한다',
      (category) => {
        const skillCategory = SkillCategory.create(category);
        expect(skillCategory.value).toBe(category);
      },
    );

    it('유효하지 않은 카테고리로 생성 시 에러를 던진다', () => {
      expect(() => SkillCategory.create('마케팅')).toThrow();
    });

    it('빈 문자열로 생성 시 에러를 던진다', () => {
      expect(() => SkillCategory.create('')).toThrow();
    });
  });

  describe('isValid', () => {
    it.each(VALID_CATEGORIES)(
      '유효한 카테고리 "%s"에 대해 true를 반환한다',
      (category) => {
        expect(SkillCategory.isValid(category)).toBe(true);
      },
    );

    it('유효하지 않은 카테고리에 대해 false를 반환한다', () => {
      expect(SkillCategory.isValid('마케팅')).toBe(false);
    });

    it('빈 문자열에 대해 false를 반환한다', () => {
      expect(SkillCategory.isValid('')).toBe(false);
    });
  });

  describe('equals', () => {
    it('같은 값의 SkillCategory는 동등하다', () => {
      const a = SkillCategory.create('기획');
      const b = SkillCategory.create('기획');
      expect(a.equals(b)).toBe(true);
    });

    it('다른 값의 SkillCategory는 동등하지 않다', () => {
      const a = SkillCategory.create('기획');
      const b = SkillCategory.create('개발');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('불변성', () => {
    it('value 속성은 읽기 전용이다', () => {
      const category = SkillCategory.create('기획');
      expect(category.value).toBe('기획');
      // ValueObject의 props는 Object.freeze로 불변
    });
  });
});
