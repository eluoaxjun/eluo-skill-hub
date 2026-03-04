# Data Model: 어드민 스킬관리 페이지 디자인

**Feature Branch**: `010-admin-skill-management`
**Date**: 2026-03-04

## 기존 엔티티 (변경 없음)

### skills 테이블

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 스킬 고유 식별자 |
| title | TEXT | NO | — | 스킬명 |
| description | TEXT | YES | — | 스킬 설명 |
| markdown_file_path | TEXT | NO | — | 마크다운 파일 경로 |
| markdown_content | TEXT | YES | — | 마크다운 콘텐츠 |
| author_id | UUID (FK → auth.users.id) | NO | — | 작성자 ID |
| category_id | UUID (FK → categories.id) | NO | — | 카테고리 참조 |
| status | TEXT | NO | 'active' | 상태 ('active', 'inactive') |
| created_at | TIMESTAMPTZ | NO | now() | 생성 일시 |

**Check constraint**: `status IN ('active', 'inactive')`

### categories 테이블

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 카테고리 고유 식별자 |
| name | TEXT (UNIQUE) | NO | — | 카테고리명 |
| slug | TEXT (UNIQUE) | NO | — | URL 슬러그 |
| icon | TEXT | NO | — | 아이콘 식별자 |
| sort_order | INTEGER | NO | 0 | 정렬 순서 |
| created_at | TIMESTAMPTZ | NO | now() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NO | now() | 수정 일시 |

## 도메인 타입 변경

### SkillRow (확장)

```
기존:
  id, title, description, categoryName, status, createdAt

변경 후:
  id, title, description, categoryName, categoryIcon, status, createdAt
```

**추가 필드**:
- `categoryIcon: string` — categories.icon 값. 카드 UI 아이콘 표시에 사용.

### 상태 매핑

| DB 값 | 도메인 타입 | UI 라벨 (한국어) | UI 라벨 (영어) | 뱃지 색상 |
|--------|-----------|----------------|---------------|----------|
| `active` | `'active'` | 배포됨 | Published | green (bg-green-100 text-green-700) |
| `inactive` | `'inactive'` | 초안 | Draft | slate (bg-slate-200 text-slate-600) |

### 필터 상태 타입

```
SkillStatusFilter = 'all' | 'active' | 'inactive'
```

- `all`: 전체 (기본값, URL param 없음 시)
- `active`: 배포됨 필터
- `inactive`: 초안 필터

## 관계도

```
auth.users (1) ──── (N) skills
                         │
                         └── category_id ──── (1) categories
                                                   └── icon (카드 아이콘 소스)
```

## DB 스키마 변경

**변경 없음.** 기존 skills 및 categories 테이블 구조를 그대로 사용한다. UI 레이어에서 상태 라벨 매핑만 수행한다.

## 쿼리 변경

### getSkills 확장

기존 쿼리에 다음 조건을 선택적으로 추가:

1. **검색**: `title` 또는 `description`에 대해 `ilike` 조건 (대소문자 무시 부분 매칭)
2. **상태 필터**: `status` 컬럼에 대해 `eq` 조건 (all이면 조건 생략)
3. **카테고리 아이콘**: select에 `categories(name, icon)` 추가 (기존 `categories(name)`에서 확장)
