# Server Actions Contract: 스킬 추가

**Branch**: `011-admin-skill-add-modal` | **Date**: 2026-03-04

## createSkill

스킬을 생성하고 관련 파일을 업로드하는 서버 액션.

**Location**: `src/app/admin/skills/actions.ts`

### Input

```typescript
interface CreateSkillInput {
  icon: string;                    // 이모지 (빈 문자열 시 기본값 '⚡' 적용)
  categoryId: string;              // 카테고리 UUID
  title: string;                   // 스킬 제목 (필수, 1~100자)
  description: string;             // 스킬 설명 (필수, 1~500자)
  isPublished: boolean;            // true → 'published', false → 'drafted'
  markdownFile?: File;             // 설명 마크다운 파일 (.md, 최대 1MB)
  templateFiles?: File[];          // 템플릿 파일 (.zip/.md, 각 최대 100KB, 최대 10개)
}
```

### Output

```typescript
type CreateSkillResult =
  | { success: true; skillId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
```

### Validation Rules

| Field | Rule |
|-------|------|
| title | 필수, 1~100자 |
| description | 필수, 1~500자 |
| categoryId | 필수, 유효한 UUID, categories 테이블에 존재 |
| icon | 선택, 빈 문자열 시 '⚡' 적용 |
| markdownFile | 선택, `.md` 확장자만, 최대 1MB |
| templateFiles | 선택, `.zip`/`.md`만, 각 최대 100KB, 최대 10개 |

### Processing Flow

1. 서버에서 관리자 인증 확인
2. 입력값 유효성 검사
3. `skills` 테이블에 레코드 삽입
4. 마크다운 파일 있으면 → `skill-descriptions` 버킷 업로드 + `markdown_file_path` 업데이트
5. 템플릿 파일 있으면 → `skill-templates` 버킷 업로드 + `skill_templates` 테이블 레코드 삽입
6. 성공/실패 결과 반환

### Error Cases

| Condition | Response |
|-----------|----------|
| 미인증 또는 비관리자 | `{ success: false, error: '권한이 없습니다' }` |
| 필수 필드 누락 | `{ success: false, fieldErrors: { title: '제목을 입력해주세요' } }` |
| 파일 형식 불일치 | `{ success: false, error: '허용되지 않는 파일 형식입니다' }` |
| 파일 크기 초과 | `{ success: false, error: '파일 크기가 제한을 초과했습니다' }` |
| DB 오류 | `{ success: false, error: '저장에 실패했습니다. 다시 시도해주세요' }` |

## getCategories

카테고리 목록을 조회하는 서버 액션 (드롭다운용).

**Location**: `src/app/admin/skills/actions.ts`

### Output

```typescript
interface CategoryOption {
  id: string;
  name: string;
  icon: string;
}

type GetCategoriesResult =
  | { success: true; categories: CategoryOption[] }
  | { success: false; error: string };
```

### Processing Flow

1. `categories` 테이블에서 `sort_order` 기준 정렬 조회
2. `{ id, name, icon }` 형태로 매핑하여 반환
