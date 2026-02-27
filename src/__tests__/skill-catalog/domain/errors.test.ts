import type { SkillCatalogError, Result } from '@/skill-catalog/domain/errors';
import { ok, err } from '@/skill-catalog/domain/errors';

describe('SkillCatalogError 타입', () => {
  it('INVALID_SKILL_NAME 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'INVALID_SKILL_NAME',
      message: '스킬 이름은 1자 이상 100자 이하여야 합니다',
    };
    expect(error.type).toBe('INVALID_SKILL_NAME');
    expect(error.message).toBe('스킬 이름은 1자 이상 100자 이하여야 합니다');
  });

  it('INVALID_SEMANTIC_VERSION 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'INVALID_SEMANTIC_VERSION',
      message: '유효하지 않은 시맨틱 버전 형식입니다',
    };
    expect(error.type).toBe('INVALID_SEMANTIC_VERSION');
  });

  it('INVALID_SLUG 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'INVALID_SLUG',
      message: '슬러그는 소문자 영숫자와 하이픈만 허용합니다',
    };
    expect(error.type).toBe('INVALID_SLUG');
  });

  it('INVALID_STATUS_TRANSITION 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'INVALID_STATUS_TRANSITION',
      currentStatus: 'draft',
      targetStatus: 'archived',
    };
    expect(error.type).toBe('INVALID_STATUS_TRANSITION');
    expect(error.currentStatus).toBe('draft');
    expect(error.targetStatus).toBe('archived');
  });

  it('DUPLICATE_SLUG 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'DUPLICATE_SLUG',
      slug: 'my-skill',
    };
    expect(error.type).toBe('DUPLICATE_SLUG');
    expect(error.slug).toBe('my-skill');
  });

  it('DUPLICATE_VERSION 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'DUPLICATE_VERSION',
      skillId: '123',
      version: '1.0.0',
    };
    expect(error.type).toBe('DUPLICATE_VERSION');
    expect(error.skillId).toBe('123');
    expect(error.version).toBe('1.0.0');
  });

  it('DUPLICATE_TAG_NAME 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'DUPLICATE_TAG_NAME',
      name: 'typescript',
    };
    expect(error.type).toBe('DUPLICATE_TAG_NAME');
    expect(error.name).toBe('typescript');
  });

  it('SKILL_NOT_FOUND 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'SKILL_NOT_FOUND',
      skillId: 'abc-123',
    };
    expect(error.type).toBe('SKILL_NOT_FOUND');
  });

  it('CATEGORY_NOT_FOUND 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'CATEGORY_NOT_FOUND',
      categoryId: 'cat-123',
    };
    expect(error.type).toBe('CATEGORY_NOT_FOUND');
  });

  it('TAG_NOT_FOUND 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'TAG_NOT_FOUND',
      tagId: 'tag-123',
    };
    expect(error.type).toBe('TAG_NOT_FOUND');
  });

  it('UNAUTHORIZED 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = { type: 'UNAUTHORIZED' };
    expect(error.type).toBe('UNAUTHORIZED');
  });

  it('FORBIDDEN 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = { type: 'FORBIDDEN' };
    expect(error.type).toBe('FORBIDDEN');
  });

  it('DATABASE_ERROR 에러를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'DATABASE_ERROR',
      cause: '연결 시간 초과',
    };
    expect(error.type).toBe('DATABASE_ERROR');
    expect(error.cause).toBe('연결 시간 초과');
  });
});

describe('Result 타입', () => {
  it('ok 헬퍼로 성공 결과를 생성할 수 있다', () => {
    const result: Result<string> = ok('성공 값');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('성공 값');
    }
  });

  it('err 헬퍼로 실패 결과를 생성할 수 있다', () => {
    const error: SkillCatalogError = {
      type: 'INVALID_SKILL_NAME',
      message: '이름이 비어있습니다',
    };
    const result: Result<string> = err(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('INVALID_SKILL_NAME');
    }
  });

  it('Result 타입은 제네릭 값 타입을 지원한다', () => {
    const numberResult: Result<number> = ok(42);
    expect(numberResult.ok).toBe(true);
    if (numberResult.ok) {
      expect(numberResult.value).toBe(42);
    }
  });

  it('Result 타입은 커스텀 에러 타입을 지원한다', () => {
    type CustomError = { type: 'CUSTOM'; detail: string };
    const result: Result<string, CustomError> = {
      ok: false,
      error: { type: 'CUSTOM', detail: '커스텀 에러' },
    };
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('CUSTOM');
    }
  });
});
