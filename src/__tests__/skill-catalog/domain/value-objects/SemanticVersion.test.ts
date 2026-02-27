import { SemanticVersion } from '@/skill-catalog/domain/value-objects/SemanticVersion';

describe('SemanticVersion', () => {
  describe('fromString', () => {
    it('유효한 버전 문자열을 파싱한다', () => {
      const result = SemanticVersion.fromString('1.2.3');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.major).toBe(1);
        expect(result.value.minor).toBe(2);
        expect(result.value.patch).toBe(3);
      }
    });

    it('0.0.0 버전을 파싱한다', () => {
      const result = SemanticVersion.fromString('0.0.0');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.major).toBe(0);
        expect(result.value.minor).toBe(0);
        expect(result.value.patch).toBe(0);
      }
    });

    it('큰 숫자 버전을 파싱한다', () => {
      const result = SemanticVersion.fromString('100.200.300');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.major).toBe(100);
      }
    });

    it('형식에 맞지 않는 문자열이면 에러를 반환한다', () => {
      expect(SemanticVersion.fromString('1.2').ok).toBe(false);
      expect(SemanticVersion.fromString('1').ok).toBe(false);
      expect(SemanticVersion.fromString('abc').ok).toBe(false);
      expect(SemanticVersion.fromString('').ok).toBe(false);
      expect(SemanticVersion.fromString('1.2.3.4').ok).toBe(false);
      expect(SemanticVersion.fromString('v1.2.3').ok).toBe(false);
    });

    it('소수점이 포함된 문자열이면 에러를 반환한다', () => {
      expect(SemanticVersion.fromString('1.2.3a').ok).toBe(false);
    });
  });

  describe('toString', () => {
    it('major.minor.patch 형식으로 변환한다', () => {
      const result = SemanticVersion.fromString('1.2.3');
      if (result.ok) {
        expect(result.value.toString()).toBe('1.2.3');
      }
    });
  });

  describe('equals', () => {
    it('동일한 버전이면 같다고 판단한다', () => {
      const r1 = SemanticVersion.fromString('1.0.0');
      const r2 = SemanticVersion.fromString('1.0.0');
      if (r1.ok && r2.ok) {
        expect(r1.value.equals(r2.value)).toBe(true);
      }
    });

    it('다른 버전이면 다르다고 판단한다', () => {
      const r1 = SemanticVersion.fromString('1.0.0');
      const r2 = SemanticVersion.fromString('2.0.0');
      if (r1.ok && r2.ok) {
        expect(r1.value.equals(r2.value)).toBe(false);
      }
    });
  });
});
