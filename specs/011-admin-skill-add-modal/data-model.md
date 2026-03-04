# Data Model: 어드민 스킬 추가 팝업

**Branch**: `011-admin-skill-add-modal` | **Date**: 2026-03-04

## Entity Relationship

```
Category (1) ──── (N) Skill (1) ──── (N) SkillTemplate
```

## Entities

### Skill (기존 테이블 수정)

현재 `skills` 테이블에 `icon` 컬럼 추가 및 `status` 기본값 변경.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| title | TEXT | NO | - | 스킬 제목 (필수) |
| description | TEXT | YES | - | 스킬 간단 설명 |
| icon | TEXT | YES | '⚡' | 이모지 아이콘 (**신규**) |
| category_id | UUID | NO | - | FK → categories.id |
| author_id | UUID | NO | - | FK → auth.users.id (생성자) |
| status | TEXT | NO | 'drafted' | 'published' \| 'drafted' (**값 변경**) |
| markdown_file_path | TEXT | NO | - | 설명 마크다운 파일 Storage 경로 |
| markdown_content | TEXT | YES | - | 설명 마크다운 텍스트 내용 |
| created_at | TIMESTAMPTZ | NO | now() | 생성일시 |

**변경 사항**:
- `icon` 컬럼 추가 (TEXT, nullable, default '⚡')
- `status` 기본값 'active' → 'drafted'로 변경
- 기존 `status` 값 마이그레이션: 'active' → 'published', 'inactive' → 'drafted'

### SkillTemplate (신규 테이블)

스킬에 첨부되는 다운로드용 템플릿 파일.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| skill_id | UUID | NO | - | FK → skills.id (ON DELETE CASCADE) |
| file_name | TEXT | NO | - | 원본 파일명 |
| file_path | TEXT | NO | - | Supabase Storage 경로 |
| file_size | INTEGER | NO | - | 파일 크기 (bytes) |
| file_type | TEXT | NO | - | MIME type 또는 확장자 ('.zip' \| '.md') |
| created_at | TIMESTAMPTZ | NO | now() | 업로드 일시 |

**제약 조건**:
- `skill_id` → `skills.id` FK, CASCADE DELETE
- `file_size` <= 102400 (100KB) CHECK 제약
- 한 스킬당 최대 10개 (애플리케이션 레벨 검증)

### Category (기존 테이블, 변경 없음)

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | NO | - | PK |
| name | TEXT | NO | - | 카테고리명 (UNIQUE) |
| slug | TEXT | NO | - | URL-safe 식별자 (UNIQUE) |
| icon | TEXT | NO | - | 아이콘 식별자 |
| sort_order | INTEGER | NO | 0 | 정렬 순서 |
| created_at | TIMESTAMPTZ | NO | now() | 생성일시 |
| updated_at | TIMESTAMPTZ | NO | now() | 수정일시 |

## State Transitions

### Skill Status Lifecycle

```
[생성] ──→ drafted ──→ published
              ↑             │
              └─────────────┘
```

- **drafted**: 관리자만 볼 수 있는 초안 상태. 임시저장 시 이 상태로 저장
- **published**: 일반 사용자에게 노출되는 공개 상태
- 양방향 전환 가능 (토글 스위치로 제어)

## Supabase Storage Buckets

### skill-descriptions (신규)

- **용도**: 스킬 설명 마크다운 파일 저장
- **허용 MIME**: `text/markdown`
- **경로 패턴**: `{skill_id}/{filename}.md`
- **크기 제한**: 1MB
- **접근**: 인증된 관리자만 업로드, 모든 인증 사용자 읽기 가능

### skill-templates (신규)

- **용도**: 다운로드 가능한 템플릿 파일 저장
- **허용 MIME**: `application/zip`, `text/markdown`
- **경로 패턴**: `{skill_id}/{filename}`
- **크기 제한**: 100KB per file
- **접근**: 인증된 관리자만 업로드, 모든 인증 사용자 다운로드 가능

## Migration Plan

### Migration 1: skills 테이블 수정

```sql
-- 1. icon 컬럼 추가
ALTER TABLE skills ADD COLUMN icon TEXT DEFAULT '⚡';

-- 2. status 값 마이그레이션
UPDATE skills SET status = 'published' WHERE status = 'active';
UPDATE skills SET status = 'drafted' WHERE status = 'inactive';

-- 3. status 기본값 변경
ALTER TABLE skills ALTER COLUMN status SET DEFAULT 'drafted';
```

### Migration 2: skill_templates 테이블 생성

```sql
CREATE TABLE skill_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size <= 102400),
  file_type TEXT NOT NULL CHECK (file_type IN ('.zip', '.md')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE skill_templates ENABLE ROW LEVEL SECURITY;

-- 관리자 전체 접근
CREATE POLICY "admin_full_access" ON skill_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- 인증 사용자 읽기 전용
CREATE POLICY "authenticated_read" ON skill_templates
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

### Migration 3: Storage 버킷 생성

```sql
-- skill-descriptions 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'skill-descriptions',
  'skill-descriptions',
  false,
  1048576,
  ARRAY['text/markdown']
);

-- skill-templates 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'skill-templates',
  'skill-templates',
  false,
  102400,
  ARRAY['application/zip', 'text/markdown']
);
```
