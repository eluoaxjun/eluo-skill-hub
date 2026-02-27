import { SkillStatus } from '@/skill-catalog/domain/value-objects/SkillStatus';

describe('SkillStatus', () => {
  describe('팩토리 메서드', () => {
    it('draft 상태를 생성한다', () => {
      expect(SkillStatus.draft().value).toBe('draft');
    });

    it('published 상태를 생성한다', () => {
      expect(SkillStatus.published().value).toBe('published');
    });

    it('archived 상태를 생성한다', () => {
      expect(SkillStatus.archived().value).toBe('archived');
    });
  });

  describe('fromString', () => {
    it('유효한 문자열로 상태를 생성한다', () => {
      expect(SkillStatus.fromString('draft').value).toBe('draft');
      expect(SkillStatus.fromString('published').value).toBe('published');
      expect(SkillStatus.fromString('archived').value).toBe('archived');
    });

    it('유효하지 않은 문자열이면 에러를 던진다', () => {
      expect(() => SkillStatus.fromString('invalid')).toThrow();
    });
  });

  describe('canTransitionTo', () => {
    it('draft에서 published로 전이를 허용한다', () => {
      expect(SkillStatus.draft().canTransitionTo(SkillStatus.published())).toBe(
        true,
      );
    });

    it('published에서 archived로 전이를 허용한다', () => {
      expect(
        SkillStatus.published().canTransitionTo(SkillStatus.archived()),
      ).toBe(true);
    });

    it('archived에서 published로 전이를 허용한다', () => {
      expect(
        SkillStatus.archived().canTransitionTo(SkillStatus.published()),
      ).toBe(true);
    });

    it('draft에서 archived로 전이를 거부한다', () => {
      expect(SkillStatus.draft().canTransitionTo(SkillStatus.archived())).toBe(
        false,
      );
    });

    it('published에서 draft로 전이를 거부한다', () => {
      expect(
        SkillStatus.published().canTransitionTo(SkillStatus.draft()),
      ).toBe(false);
    });

    it('archived에서 draft로 전이를 거부한다', () => {
      expect(SkillStatus.archived().canTransitionTo(SkillStatus.draft())).toBe(
        false,
      );
    });

    it('동일 상태로의 전이를 거부한다', () => {
      expect(SkillStatus.draft().canTransitionTo(SkillStatus.draft())).toBe(
        false,
      );
      expect(
        SkillStatus.published().canTransitionTo(SkillStatus.published()),
      ).toBe(false);
      expect(
        SkillStatus.archived().canTransitionTo(SkillStatus.archived()),
      ).toBe(false);
    });
  });

  describe('equals', () => {
    it('동일한 상태이면 같다고 판단한다', () => {
      expect(SkillStatus.draft().equals(SkillStatus.draft())).toBe(true);
    });

    it('다른 상태이면 다르다고 판단한다', () => {
      expect(SkillStatus.draft().equals(SkillStatus.published())).toBe(false);
    });
  });
});
