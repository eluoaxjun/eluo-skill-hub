import { ManagedSkill } from '../entities/ManagedSkill';
import { SkillStatus } from '../value-objects/SkillStatus';

const baseProps = {
  id: 'skill-id-001',
  title: '기획 자동화 스킬',
  description: 'AI가 생성한 설명',
  categoryId: 'cat-uuid-001',
  markdownFilePath: 'author-id/skill-id-001.md',
  authorId: 'author-id',
  status: SkillStatus.active(),
  createdAt: new Date('2026-03-02'),
};

describe('ManagedSkill', () => {
  describe('create()', () => {
    it('팩토리 메서드로 생성 성공', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill).toBeInstanceOf(ManagedSkill);
    });

    it('id 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.id).toBe('skill-id-001');
    });

    it('title 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.title).toBe('기획 자동화 스킬');
    });

    it('categoryId 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.categoryId).toBe('cat-uuid-001');
    });

    it('status 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.status.value).toBe('active');
    });

    it('authorId 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.authorId).toBe('author-id');
    });

    it('createdAt 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.createdAt).toEqual(new Date('2026-03-02'));
    });

    it('markdownFilePath 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.markdownFilePath).toBe('author-id/skill-id-001.md');
    });

    it('markdownFilePath가 null일 수 있다', () => {
      const skill = ManagedSkill.create({ ...baseProps, markdownFilePath: null });
      expect(skill.markdownFilePath).toBeNull();
    });

    it('description 게터가 정상 동작한다', () => {
      const skill = ManagedSkill.create(baseProps);
      expect(skill.description).toBe('AI가 생성한 설명');
    });

    it('description이 null일 수 있다', () => {
      const skill = ManagedSkill.create({ ...baseProps, description: null });
      expect(skill.description).toBeNull();
    });

    it('기본 status는 active이다', () => {
      const skill = ManagedSkill.create({ ...baseProps, status: SkillStatus.active() });
      expect(skill.status.isActive).toBe(true);
    });
  });
});
