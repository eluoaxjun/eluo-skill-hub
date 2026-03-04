# Data Model: 스킬 삭제 기능

**Feature Branch**: `014-skill-delete`
**Date**: 2026-03-04

## Affected Entities

이 기능은 새로운 엔터티를 생성하지 않으며, 기존 엔터티에 대한 삭제 작업을 수행한다.

### skills (기존 테이블)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid (PK) | 스킬 고유 식별자 |
| title | text | 스킬 제목 |
| description | text | 스킬 설명 |
| icon | text | 스킬 아이콘 |
| category_id | uuid (FK) | 카테고리 참조 |
| status | text | 'published' \| 'drafted' |
| markdown_file_path | text \| null | Storage 내 마크다운 파일 경로 |
| markdown_content | text \| null | 마크다운 콘텐츠 |
| author_id | uuid (FK) | 작성자 참조 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

**삭제 시 동작**: 레코드 영구 삭제. `markdown_file_path`가 존재하면 Storage 파일도 함께 삭제.

### skill_templates (기존 테이블)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid (PK) | 템플릿 고유 식별자 |
| skill_id | uuid (FK → skills.id) | 스킬 참조 |
| file_name | text | 파일명 |
| file_path | text | Storage 내 파일 경로 |
| file_size | integer | 파일 크기 (bytes) |
| file_type | text | 파일 MIME 타입 |
| created_at | timestamptz | 생성일시 |

**삭제 시 동작**: `skill_id` 기준으로 모든 레코드 조회 → Storage 파일 삭제 → DB 레코드 삭제.

### skill_feedback_logs (기존 테이블)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid (PK) | 피드백 고유 식별자 |
| rating | integer | 평점 |
| comment | text \| null | 코멘트 |
| profile_id | uuid (FK) | 사용자 참조 |
| skill_id | uuid (FK → skills.id) | 스킬 참조 |
| created_at | timestamptz | 생성일시 |

**삭제 시 동작**: `skill_id` 기준으로 모든 레코드 영구 삭제. 이로 인해 통계 분석 데이터에 영향.

## Supabase Storage Buckets

| Bucket | Purpose | 삭제 대상 |
|--------|---------|-----------|
| `skill-descriptions` | 스킬 마크다운 파일 | `skills.markdown_file_path` 경로의 파일 |
| `skill-templates` | 스킬 템플릿 파일 | `skill_templates.file_path` 경로의 파일들 |

## 삭제 순서 (Data Dependency)

```
1. skill_feedback_logs  (FK: skill_id → skills.id)
       ↓
2. skill_templates      (FK: skill_id → skills.id)
   + Storage files      (skill-templates 버킷)
       ↓
3. skills               (PK: id)
   + Storage file       (skill-descriptions 버킷, markdown_file_path)
```

## 신규 타입 정의

### DeleteSkillResult (Domain)

```typescript
type DeleteSkillResult =
  | { success: true }
  | { success: false; error: string };
```

기존 `CreateSkillResult`, `UpdateSkillResult` 패턴과 동일한 구조.
