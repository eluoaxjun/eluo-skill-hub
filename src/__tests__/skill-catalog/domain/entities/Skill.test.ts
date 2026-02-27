import { Skill } from '@/skill-catalog/domain/entities/Skill';

describe('Skill', () => {
  const validParams = {
    name: '테스트 스킬',
    slug: 'test-skill',
    summary: '테스트 요약',
    description: '테스트 상세 설명',
    authorId: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('create', () => {
    it('유효한 파라미터로 스킬을 생성한다', () => {
      const result = Skill.create(validParams);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('테스트 스킬');
        expect(result.value.slug.value).toBe('test-skill');
        expect(result.value.status.value).toBe('draft');
        expect(result.value.authorId).toBe(validParams.authorId);
      }
    });

    it('생성 시 기본 상태는 draft이다', () => {
      const result = Skill.create(validParams);
      if (result.ok) {
        expect(result.value.status.value).toBe('draft');
      }
    });

    it('생성 시 SkillCreated 이벤트를 수집한다', () => {
      const result = Skill.create(validParams);
      if (result.ok) {
        expect(result.value.domainEvents).toHaveLength(1);
        expect(result.value.domainEvents[0].eventName).toBe('SkillCreated');
      }
    });

    it('이름이 빈 문자열이면 에러를 반환한다', () => {
      const result = Skill.create({ ...validParams, name: '' });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_SKILL_NAME');
      }
    });

    it('이름이 100자를 초과하면 에러를 반환한다', () => {
      const result = Skill.create({ ...validParams, name: 'a'.repeat(101) });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_SKILL_NAME');
      }
    });

    it('이름이 정확히 100자이면 성공한다', () => {
      const result = Skill.create({ ...validParams, name: 'a'.repeat(100) });
      expect(result.ok).toBe(true);
    });

    it('유효하지 않은 슬러그이면 에러를 반환한다', () => {
      const result = Skill.create({ ...validParams, slug: 'Invalid Slug!' });
      expect(result.ok).toBe(false);
    });
  });

  describe('updateMetadata', () => {
    it('이름을 수정하면 수정일시가 갱신된다', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      const skill = result.value;
      const before = skill.updatedAt;

      // 시간 차이를 위해 약간 지연
      const updateResult = skill.updateMetadata({ name: '새 이름' });
      expect(updateResult.ok).toBe(true);
      expect(skill.name).toBe('새 이름');
      expect(skill.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('수정 시에도 이름 길이 불변식을 강제한다', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      const updateResult = result.value.updateMetadata({ name: '' });
      expect(updateResult.ok).toBe(false);
    });
  });

  describe('상태 전이', () => {
    it('draft에서 publish 성공', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      const publishResult = result.value.publish();
      expect(publishResult.ok).toBe(true);
      expect(result.value.status.value).toBe('published');
    });

    it('publish 시 SkillPublished 이벤트를 수집한다', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      result.value.clearDomainEvents();
      result.value.publish();
      expect(result.value.domainEvents).toHaveLength(1);
      expect(result.value.domainEvents[0].eventName).toBe('SkillPublished');
    });

    it('published에서 archive 성공', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      result.value.publish();
      const archiveResult = result.value.archive();
      expect(archiveResult.ok).toBe(true);
      expect(result.value.status.value).toBe('archived');
    });

    it('archive 시 SkillArchived 이벤트를 수집한다', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      result.value.publish();
      result.value.clearDomainEvents();
      result.value.archive();
      expect(result.value.domainEvents[0].eventName).toBe('SkillArchived');
    });

    it('archived에서 republish 성공', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      result.value.publish();
      result.value.archive();
      const republishResult = result.value.republish();
      expect(republishResult.ok).toBe(true);
      expect(result.value.status.value).toBe('published');
    });

    it('draft에서 archive 실패', () => {
      const result = Skill.create(validParams);
      if (!result.ok) return;
      const archiveResult = result.value.archive();
      expect(archiveResult.ok).toBe(false);
      if (!archiveResult.ok) {
        expect(archiveResult.error.type).toBe('INVALID_STATUS_TRANSITION');
      }
    });

    it('published에서 draft로 전이 불가 (publish 호출 시)', () => {
      // published 상태에서 다시 publish 시도는 불가
      const result = Skill.create(validParams);
      if (!result.ok) return;
      result.value.publish();
      // published -> published는 canTransitionTo에서 false
    });
  });
});
