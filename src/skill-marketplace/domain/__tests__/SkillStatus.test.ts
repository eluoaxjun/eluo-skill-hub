import { SkillStatus } from '../value-objects/SkillStatus';

describe('SkillStatus', () => {
  describe('active()', () => {
    it('value가 active이다', () => {
      const status = SkillStatus.active();
      expect(status.value).toBe('active');
    });

    it('isActive가 true이다', () => {
      const status = SkillStatus.active();
      expect(status.isActive).toBe(true);
    });
  });

  describe('inactive()', () => {
    it('value가 inactive이다', () => {
      const status = SkillStatus.inactive();
      expect(status.value).toBe('inactive');
    });

    it('isActive가 false이다', () => {
      const status = SkillStatus.inactive();
      expect(status.isActive).toBe(false);
    });
  });

  describe('equals()', () => {
    it('active와 inactive는 서로 다르다', () => {
      const active = SkillStatus.active();
      const inactive = SkillStatus.inactive();
      expect(active.equals(inactive)).toBe(false);
    });

    it('active와 active는 같다', () => {
      const a = SkillStatus.active();
      const b = SkillStatus.active();
      expect(a.equals(b)).toBe(true);
    });
  });
});
