# Data Model: 어드민 페이지

**Feature Branch**: `008-admin-page`
**Date**: 2026-03-04

> 이 피처는 기존 테이블을 그대로 활용하며 스키마 변경이 없다.

## Entities

### Profile (기존)

서비스 사용자를 나타내며, 인증 시스템의 사용자 계정과 1:1로 연결된다.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | — | auth.users의 id를 참조하는 외래 키 |
| email | TEXT | NO | — | 사용자 이메일 주소 |
| created_at | TIMESTAMPTZ | NO | now() | 프로필 생성 시각 |
| role_id | UUID (FK → roles.id) | NO | user 역할 UUID | 사용자의 역할 |

**Admin 페이지에서의 용도**: 회원 관리 탭 목록 조회, 대시보드 전체 회원 수 집계, 최근 가입 회원 목록

### Role (기존)

사용자의 권한 수준을 나타낸다.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 역할 고유 식별자 |
| name | TEXT (UNIQUE) | NO | — | 역할 이름 (admin, user) |
| description | TEXT | YES | — | 역할 설명 |

**Seed Data**:

| id | name | description |
|----|------|-------------|
| a0000000-0000-0000-0000-000000000001 | admin | 관리자 |
| a0000000-0000-0000-0000-000000000002 | user | 일반 사용자 |

**Admin 페이지에서의 용도**: role 기반 접근제어, 회원 목록의 역할 표시

### Skill (기존)

플랫폼에 등록된 자동화 스킬을 나타낸다.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 스킬 고유 식별자 |
| title | TEXT | NO | — | 스킬 이름 |
| description | TEXT | YES | — | 스킬 설명 |
| markdown_file_path | TEXT | NO | — | 마크다운 파일 경로 |
| markdown_content | TEXT | YES | — | 마크다운 내용 |
| author_id | UUID (FK → auth.users.id) | NO | — | 등록자 |
| category_id | UUID (FK → categories.id) | NO | — | 카테고리 |
| status | TEXT | NO | 'active' | 상태 (active, inactive) |
| created_at | TIMESTAMPTZ | NO | now() | 등록 시각 |

**Check Constraint**: `status IN ('active', 'inactive')`

**Admin 페이지에서의 용도**: 스킬 관리 탭 목록 조회, 대시보드 전체 스킬 수 집계, 최근 등록 스킬 목록

### Category (기존)

스킬의 분류 카테고리를 나타낸다.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 카테고리 고유 식별자 |
| name | TEXT (UNIQUE) | NO | — | 카테고리 이름 |
| slug | TEXT (UNIQUE) | NO | — | URL용 슬러그 |
| icon | TEXT | NO | — | 아이콘 식별자 |
| sort_order | INTEGER | NO | 0 | 정렬 순서 |
| created_at | TIMESTAMPTZ | NO | now() | 생성 시각 |
| updated_at | TIMESTAMPTZ | NO | now() | 수정 시각 |

**Admin 페이지에서의 용도**: 스킬 관리 목록에서 카테고리명 조인 표시

### Skill Feedback Log (기존)

사용자가 스킬에 대해 남긴 피드백(평점 + 코멘트)을 나타낸다.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 피드백 고유 식별자 |
| user_id | UUID (FK → auth.users.id) | NO | — | 작성자 |
| skill_id | UUID (FK → skills.id) | NO | — | 대상 스킬 |
| rating | INTEGER | NO | — | 평점 (1~5) |
| comment | TEXT | YES | — | 코멘트 내용 |
| created_at | TIMESTAMPTZ | YES | now() | 작성 시각 |

**Check Constraint**: `rating >= 1 AND rating <= 5`

**Admin 페이지에서의 용도**: 피드백 관리 탭 목록 조회, 대시보드 누적 피드백 수 집계

## Relationships

```
auth.users (1) ──── (1) profiles
     │                    │
     │                    └── role_id ──── (1) roles
     │
     ├── author_id ──── (N) skills
     │                       │
     │                       ├── category_id ──── (1) categories
     │                       │
     │                       └── skill_id ──── (N) skill_feedback_logs
     │
     └── user_id ──── (N) skill_feedback_logs
```

## RLS Policies (기존)

### profiles

| Policy Name | Permission | Command | Condition |
|------------|------------|---------|-----------|
| Users can view own profile | PERMISSIVE | SELECT | auth.uid() = id |
| Users can update own profile | PERMISSIVE | UPDATE | auth.uid() = id |
| Admins can view all profiles | PERMISSIVE | SELECT | is_admin(auth.uid()) |
| Admins can update user roles | PERMISSIVE | UPDATE | is_admin(auth.uid()) |

### roles

| Policy Name | Permission | Command | Condition |
|------------|------------|---------|-----------|
| Authenticated users can view roles | PERMISSIVE | SELECT | true |

### skills, categories, skill_feedback_logs

RLS 활성 상태. Admin은 `is_admin()` 기반 전체 조회 권한 보유.

## Helper Functions (기존)

### is_admin(check_user_id UUID) → BOOLEAN

profiles와 roles를 조인하여 해당 사용자가 admin 역할인지 확인한다.

### handle_new_user() → TRIGGER

auth.users에 새 사용자가 INSERT될 때 실행. profiles 테이블에 id, email, 기본 user role_id로 레코드를 자동 생성한다.

## Schema Changes Required

**없음** — 기존 스키마가 어드민 페이지 요구사항을 완전히 충족한다.
