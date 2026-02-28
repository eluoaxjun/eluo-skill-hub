import { Skill } from '@/skill-catalog/domain/Skill';
import { SkillCategory } from '@/skill-catalog/domain/SkillCategory';

describe('Skill', () => {
  const validParams = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: '요구사항 정리 자동화',
    category: '기획',
    markdownFilePath: 'abc123.md',
    authorId: '660e8400-e29b-41d4-a716-446655440000',
  };

  describe('create', () => {
    it('유효한 입력으로 Skill을 생성할 수 있다', () => {
      const skill = Skill.create(validParams);

      expect(skill.id).toBe(validParams.id);
      expect(skill.title).toBe(validParams.title);
      expect(skill.category.value).toBe(validParams.category);
      expect(skill.markdownFilePath).toBe(validParams.markdownFilePath);
      expect(skill.authorId).toBe(validParams.authorId);
    });

    it('생성 시 createdAt이 현재 시각으로 자동 설정된다', () => {
      const before = new Date();
      const skill = Skill.create(validParams);
      const after = new Date();

      expect(skill.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(skill.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('빈 제목으로 생성 시 에러를 던진다', () => {
      expect(() =>
        Skill.create({ ...validParams, title: '' }),
      ).toThrow('스킬 제목을 입력해 주세요');
    });

    it('공백만 있는 제목으로 생성 시 에러를 던진다', () => {
      expect(() =>
        Skill.create({ ...validParams, title: '   ' }),
      ).toThrow('스킬 제목을 입력해 주세요');
    });

    it('유효하지 않은 카테고리로 생성 시 에러를 던진다', () => {
      expect(() =>
        Skill.create({ ...validParams, category: '마케팅' }),
      ).toThrow();
    });
  });

  describe('reconstruct', () => {
    it('DB 레코드에서 Skill 엔티티를 복원할 수 있다', () => {
      const savedDate = new Date('2026-02-27T10:00:00.000Z');
      const category = SkillCategory.create('개발');

      const skill = Skill.reconstruct(validParams.id, {
        title: validParams.title,
        category,
        markdownFilePath: validParams.markdownFilePath,
        authorId: validParams.authorId,
        createdAt: savedDate,
      });

      expect(skill.id).toBe(validParams.id);
      expect(skill.title).toBe(validParams.title);
      expect(skill.category.value).toBe('개발');
      expect(skill.markdownFilePath).toBe(validParams.markdownFilePath);
      expect(skill.authorId).toBe(validParams.authorId);
      expect(skill.createdAt).toBe(savedDate);
    });
  });

  describe('getters', () => {
    it('모든 속성에 대한 getter를 제공한다', () => {
      const skill = Skill.create(validParams);

      expect(typeof skill.id).toBe('string');
      expect(typeof skill.title).toBe('string');
      expect(skill.category).toBeInstanceOf(SkillCategory);
      expect(typeof skill.markdownFilePath).toBe('string');
      expect(typeof skill.authorId).toBe('string');
      expect(skill.createdAt).toBeInstanceOf(Date);
    });
  });
});
