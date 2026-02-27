import { SkillId } from '@/skill-catalog/domain/value-objects/SkillId';

describe('SkillId', () => {
  describe('create', () => {
    it('유효한 UUID v4 문자열로 생성할 수 있다', () => {
      const result = SkillId.create('550e8400-e29b-41d4-a716-446655440000');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('550e8400-e29b-41d4-a716-446655440000');
      }
    });

    it('유효하지 않은 형식이면 에러를 반환한다', () => {
      const result = SkillId.create('invalid-uuid');
      expect(result.ok).toBe(false);
    });

    it('빈 문자열이면 에러를 반환한다', () => {
      const result = SkillId.create('');
      expect(result.ok).toBe(false);
    });

    it('UUID v1 형식이면 에러를 반환한다', () => {
      const result = SkillId.create('550e8400-e29b-11d4-a716-446655440000');
      expect(result.ok).toBe(false);
    });
  });

  describe('generate', () => {
    it('새로운 UUID를 생성한다', () => {
      const id = SkillId.generate();
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('매번 다른 UUID를 생성한다', () => {
      const id1 = SkillId.generate();
      const id2 = SkillId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('equals', () => {
    it('동일한 값이면 같다고 판단한다', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const r1 = SkillId.create(uuid);
      const r2 = SkillId.create(uuid);
      if (r1.ok && r2.ok) {
        expect(r1.value.equals(r2.value)).toBe(true);
      }
    });

    it('다른 값이면 다르다고 판단한다', () => {
      const id1 = SkillId.generate();
      const id2 = SkillId.generate();
      expect(id1.equals(id2)).toBe(false);
    });
  });
});
