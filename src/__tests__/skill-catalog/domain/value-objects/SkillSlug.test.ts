import { SkillSlug } from '@/skill-catalog/domain/value-objects/SkillSlug';

describe('SkillSlug', () => {
  describe('create', () => {
    it('유효한 슬러그를 생성한다', () => {
      const result = SkillSlug.create('my-skill');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('my-skill');
      }
    });

    it('숫자만으로 구성된 슬러그를 허용한다', () => {
      expect(SkillSlug.create('123').ok).toBe(true);
    });

    it('영문 소문자만으로 구성된 슬러그를 허용한다', () => {
      expect(SkillSlug.create('myskill').ok).toBe(true);
    });

    it('영문 소문자와 숫자가 혼합된 슬러그를 허용한다', () => {
      expect(SkillSlug.create('skill-v2-beta').ok).toBe(true);
    });

    it('대문자가 포함되면 에러를 반환한다', () => {
      expect(SkillSlug.create('My-Skill').ok).toBe(false);
    });

    it('특수문자가 포함되면 에러를 반환한다', () => {
      expect(SkillSlug.create('my_skill').ok).toBe(false);
      expect(SkillSlug.create('my.skill').ok).toBe(false);
      expect(SkillSlug.create('my skill').ok).toBe(false);
    });

    it('하이픈으로 시작하면 에러를 반환한다', () => {
      expect(SkillSlug.create('-my-skill').ok).toBe(false);
    });

    it('하이픈으로 끝나면 에러를 반환한다', () => {
      expect(SkillSlug.create('my-skill-').ok).toBe(false);
    });

    it('연속 하이픈이면 에러를 반환한다', () => {
      expect(SkillSlug.create('my--skill').ok).toBe(false);
    });

    it('빈 문자열이면 에러를 반환한다', () => {
      expect(SkillSlug.create('').ok).toBe(false);
    });
  });

  describe('equals', () => {
    it('동일한 슬러그이면 같다고 판단한다', () => {
      const r1 = SkillSlug.create('my-skill');
      const r2 = SkillSlug.create('my-skill');
      if (r1.ok && r2.ok) {
        expect(r1.value.equals(r2.value)).toBe(true);
      }
    });
  });
});
