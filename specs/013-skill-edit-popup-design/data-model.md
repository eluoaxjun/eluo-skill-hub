# Data Model: 스킬 수정 팝업 디자인

**Feature**: 013-skill-edit-popup-design
**Date**: 2026-03-04

## Existing Entities (변경 없음)

### Skills Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | 스킬 고유 ID |
| title | string (1-100) | 스킬 명칭 |
| description | string (1-500) | 스킬 설명 |
| icon | string | 이모지 아이콘 |
| category_id | UUID (FK → categories) | 카테고리 참조 |
| status | 'published' \| 'drafted' | 공개 상태 |
| author_id | UUID (FK → profiles) | 작성자 |
| markdown_file_path | string | 마크다운 파일 저장 경로 |
| markdown_content | text | 마크다운 파일 내용 (텍스트) |
| created_at | timestamp | 생성 시각 |

### Skill Templates Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | 템플릿 고유 ID |
| skill_id | UUID (FK → skills) | 스킬 참조 |
| file_name | string | 원본 파일명 |
| file_path | string | 스토리지 경로 |
| file_size | number | 파일 크기 (bytes) |
| file_type | string | 파일 MIME 타입 |
| created_at | timestamp | 생성 시각 |

### Categories Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | 카테고리 ID |
| name | string | 카테고리명 |
| icon | string | 아이콘 이름 (lucide-react 매핑) |
| sort_order | number | 정렬 순서 |

## New Domain Types

### SkillDetail (조회용 — 수정 폼 데이터 로드)

```typescript
interface SkillDetail {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly categoryIcon: string;
  readonly status: 'published' | 'drafted';
  readonly markdownFilePath: string;
  readonly markdownContent: string;
  readonly templates: SkillTemplateRow[];
  readonly createdAt: string;
}
```

- `SkillRow`와의 차이: `categoryId`, `markdownFilePath`, `markdownContent`, `templates` 포함
- 수정 폼에서 모든 필드를 채우기 위해 필요

### UpdateSkillInput (수정 요청)

```typescript
interface UpdateSkillInput {
  readonly skillId: string;
  readonly icon: string;
  readonly categoryId: string;
  readonly title: string;
  readonly description: string;
  readonly isPublished: boolean;
  readonly markdownFile?: File;              // 신규 마크다운 파일 (교체 시)
  readonly removeMarkdown: boolean;          // 기존 마크다운 삭제 여부
  readonly templateFiles?: File[];           // 신규 템플릿 파일
  readonly removedTemplateIds: string[];     // 삭제 대상 기존 템플릿 ID
}
```

- `CreateSkillInput`과의 차이: `skillId`, `removeMarkdown`, `removedTemplateIds` 추가
- `removeMarkdown`이 true이고 `markdownFile`이 없으면 마크다운 완전 제거
- `removeMarkdown`이 true이고 `markdownFile`이 있으면 기존 삭제 후 신규 업로드

### UpdateSkillResult (수정 응답)

```typescript
type UpdateSkillResult =
  | { success: true; skillId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
```

- `CreateSkillResult`와 동일한 구조

### GetSkillResult (조회 응답)

```typescript
type GetSkillResult =
  | { success: true; skill: SkillDetail }
  | { success: false; error: string };
```

## AdminRepository Interface Extension

```typescript
interface AdminRepository {
  // ...existing methods...
  getSkillById(id: string): Promise<GetSkillResult>;
  updateSkill(input: UpdateSkillInput): Promise<UpdateSkillResult>;
}
```

## State Transitions

### 파일 상태 변화 (저장 시)

```
기존 마크다운:
  유지 (변경 없음)        → 아무 작업 없음
  삭제 (removeMarkdown)   → 스토리지 삭제 + DB 필드 초기화
  교체 (삭제 + 신규)      → 스토리지 삭제 + 신규 업로드 + DB 업데이트

기존 템플릿:
  유지 (removedIds에 없음) → 아무 작업 없음
  삭제 (removedIds에 있음) → 스토리지 삭제 + skill_templates 레코드 삭제
  추가 (newFiles)          → 스토리지 업로드 + skill_templates 레코드 삽입
```

## Validation Rules (CreateSkill과 동일)

| Field | Rule |
|-------|------|
| title | 필수, 1-100자 |
| description | 필수, 1-500자 |
| categoryId | 필수, 유효한 UUID |
| markdownFile | 선택, .md만, 최대 1MB |
| templateFiles | 선택, .zip/.md만, 각 최대 100KB, 총 10개 |
