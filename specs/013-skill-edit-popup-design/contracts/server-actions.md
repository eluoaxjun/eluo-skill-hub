# Server Action Contracts: 스킬 수정 팝업

**Feature**: 013-skill-edit-popup-design
**Date**: 2026-03-04

## getSkillById

**Location**: `src/app/admin/skills/actions.ts`

**Signature**:
```typescript
export async function getSkillById(id: string): Promise<GetSkillResult>
```

**Preconditions**:
- 호출자가 admin 역할이어야 함 (verifyAdmin)
- `id`는 유효한 UUID 형식

**Success Response**:
```typescript
{ success: true; skill: SkillDetail }
```

**Error Responses**:
```typescript
{ success: false; error: "관리자 권한이 필요합니다." }
{ success: false; error: "스킬을 찾을 수 없습니다." }
{ success: false; error: "스킬 조회 중 오류가 발생했습니다." }
```

---

## updateSkill

**Location**: `src/app/admin/skills/actions.ts`

**Signature**:
```typescript
export async function updateSkill(formData: FormData): Promise<UpdateSkillResult>
```

**FormData Fields**:
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| skillId | string | Yes | 수정 대상 스킬 ID |
| icon | string | Yes | 이모지 아이콘 |
| categoryId | string | Yes | 카테고리 ID |
| title | string | Yes | 스킬 명칭 (1-100자) |
| description | string | Yes | 스킬 설명 (1-500자) |
| isPublished | string ("true"/"false") | Yes | 공개 상태 |
| removeMarkdown | string ("true"/"false") | Yes | 기존 마크다운 삭제 여부 |
| markdownFile | File | No | 신규 마크다운 파일 |
| templateFiles | File[] | No | 신규 템플릿 파일 (multi) |
| removedTemplateIds | string (JSON array) | No | 삭제할 기존 템플릿 ID 배열 |

**Validation Rules**: createSkill과 동일 (title 1-100, description 1-500, markdown .md max 1MB, templates .zip/.md max 100KB max 10)

**Success Response**:
```typescript
{ success: true; skillId: string }
```

**Error Responses**:
```typescript
{ success: false; error: "관리자 권한이 필요합니다." }
{ success: false; error: "스킬을 찾을 수 없습니다." }
{ success: false; error: string; fieldErrors: Record<string, string> }
```

---

## Component Contracts

### SkillAddForm (확장)

**New Props**:
```typescript
interface SkillAddFormProps {
  categories?: CategoryOption[];
  onDirtyChange?: (isDirty: boolean) => void;
  onRequestDraftSave?: (input: CreateSkillInput | UpdateSkillInput) => void;
  // New props for edit mode
  mode?: 'add' | 'edit';
  skillId?: string;
  initialData?: SkillDetail;
}
```

**Behavior by Mode**:
- `mode='add'` (기본): 현재 동작과 동일
- `mode='edit'`:
  - `initialData`로 폼 필드 초기화
  - 저장 시 `updateSkill` 서버 액션 호출
  - 버튼 텍스트: "수정 저장하기" / "임시저장"
  - dirty 판단 기준: initialData와 현재 값 비교

### SkillEditModal

**Props**:
```typescript
interface SkillEditModalProps {
  skillId: string;
  initialData: SkillDetail;
  categories: CategoryOption[];
}
```

**Behavior**: SkillAddModal과 동일한 래퍼 구조, updateSkill 호출
