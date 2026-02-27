import { SkillVersion } from '@/skill-catalog/domain/entities/SkillVersion';
import { SkillId } from '@/skill-catalog/domain/value-objects/SkillId';

describe('SkillVersion', () => {
  const skillId = SkillId.generate();

  describe('create', () => {
    it('유효한 파라미터로 버전을 생성한다', () => {
      const result = SkillVersion.create({
        skillId,
        version: '1.0.0',
        changelog: '최초 릴리즈',
        downloadUrl: 'https://example.com/v1.0.0',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.version.toString()).toBe('1.0.0');
        expect(result.value.skillId).toBe(skillId);
        expect(result.value.isLatest).toBe(false);
      }
    });

    it('유효하지 않은 버전 형식이면 에러를 반환한다', () => {
      const result = SkillVersion.create({
        skillId,
        version: 'invalid',
        changelog: '',
        downloadUrl: 'https://example.com',
      });
      expect(result.ok).toBe(false);
    });
  });

  describe('활성 버전 플래그', () => {
    it('markAsLatest로 활성 버전으로 표시한다', () => {
      const result = SkillVersion.create({
        skillId,
        version: '1.0.0',
        changelog: '',
        downloadUrl: 'https://example.com',
      });
      if (!result.ok) return;
      result.value.markAsLatest();
      expect(result.value.isLatest).toBe(true);
    });

    it('unmarkAsLatest로 비활성으로 표시한다', () => {
      const result = SkillVersion.create({
        skillId,
        version: '1.0.0',
        changelog: '',
        downloadUrl: 'https://example.com',
      });
      if (!result.ok) return;
      result.value.markAsLatest();
      result.value.unmarkAsLatest();
      expect(result.value.isLatest).toBe(false);
    });
  });
});
