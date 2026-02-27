export type SkillCatalogError =
  | { type: 'INVALID_SKILL_NAME'; message: string }
  | { type: 'INVALID_SEMANTIC_VERSION'; message: string }
  | { type: 'INVALID_SLUG'; message: string }
  | { type: 'INVALID_STATUS_TRANSITION'; currentStatus: string; targetStatus: string }
  | { type: 'DUPLICATE_SLUG'; slug: string }
  | { type: 'DUPLICATE_VERSION'; skillId: string; version: string }
  | { type: 'DUPLICATE_TAG_NAME'; name: string }
  | { type: 'SKILL_NOT_FOUND'; skillId: string }
  | { type: 'CATEGORY_NOT_FOUND'; categoryId: string }
  | { type: 'TAG_NOT_FOUND'; tagId: string }
  | { type: 'UNAUTHORIZED' }
  | { type: 'FORBIDDEN' }
  | { type: 'DATABASE_ERROR'; cause: string };

export type Result<T, E = SkillCatalogError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
