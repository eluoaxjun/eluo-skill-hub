# Data Model: 어드민 회원관리 기능

**Feature Branch**: `009-admin-member-management`
**Date**: 2026-03-04

## Schema Changes

### Profile (변경)

기존 profiles 테이블에 `name` 필드를 추가한다.

| Field | Type | Nullable | Default | Description | Change |
|-------|------|----------|---------|-------------|--------|
| id | UUID (PK) | NO | — | auth.users의 id를 참조하는 외래 키 | 기존 |
| email | TEXT | NO | — | 사용자 이메일 주소 | 기존 |
| name | TEXT | YES | NULL | 사용자 이름 (회원가입 시 입력) | **신규** |
| created_at | TIMESTAMPTZ | NO | now() | 프로필 생성 시각 | 기존 |
| role_id | UUID (FK → roles.id) | NO | user 역할 UUID | 사용자의 역할 | 기존 |

### Role (변경)

기존 roles 테이블에 `viewer` 역할 seed 데이터를 추가한다.

| Field | Type | Nullable | Default | Description | Change |
|-------|------|----------|---------|-------------|--------|
| id | UUID (PK) | NO | gen_random_uuid() | 역할 고유 식별자 | 기존 |
| name | TEXT (UNIQUE) | NO | — | 역할 이름 | 기존 |
| description | TEXT | YES | — | 역할 설명 | 기존 |

**Seed Data (업데이트)**:

| id | name | description |
|----|------|-------------|
| a0000000-0000-0000-0000-000000000001 | admin | 관리자 |
| a0000000-0000-0000-0000-000000000002 | user | 일반 사용자 |
| a0000000-0000-0000-0000-000000000003 | viewer | 뷰어 (읽기 전용) |

### Permission (신규)

사용자가 수행할 수 있는 구체적인 행동을 정의한다.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 권한 고유 식별자 |
| name | TEXT (UNIQUE) | NO | — | 권한 식별 이름 (snake_case) |
| description | TEXT | YES | — | 권한 설명 |
| created_at | TIMESTAMPTZ | NO | now() | 생성 시각 |

**Seed Data**:

| id | name | description |
|----|------|-------------|
| b0000000-0000-0000-0000-000000000001 | skill_download | 스킬 파일 다운로드 |

### Role Permission (신규 — 조인 테이블)

역할과 권한 간 다대다 관계를 매핑한다.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | NO | gen_random_uuid() | 매핑 고유 식별자 |
| role_id | UUID (FK → roles.id) | NO | — | 역할 참조 |
| permission_id | UUID (FK → permissions.id) | NO | — | 권한 참조 |
| created_at | TIMESTAMPTZ | NO | now() | 생성 시각 |

**UNIQUE Constraint**: (role_id, permission_id)

**Seed Data**:

| role_id | permission_id | 설명 |
|---------|---------------|------|
| a0000000-...-000000000001 (admin) | b0000000-...-000000000001 (skill_download) | admin은 다운로드 가능 |
| a0000000-...-000000000002 (user) | b0000000-...-000000000001 (skill_download) | user는 다운로드 가능 |
| *(viewer는 매핑 없음)* | | viewer는 다운로드 불가 |

## Relationships

```
auth.users (1) ──── (1) profiles
     │                    │
     │                    └── role_id ──── (1) roles
     │                                        │
     │                                        └── (N) role_permissions (N) ──── (1) permissions
     │
     ├── author_id ──── (N) skills
     │                       │
     │                       ├── category_id ──── (1) categories
     │                       │
     │                       └── skill_id ──── (N) skill_feedback_logs
     │
     └── user_id ──── (N) skill_feedback_logs
```

## RLS Policies

### permissions (신규)

| Policy Name | Permission | Command | Condition |
|------------|------------|---------|-----------|
| Authenticated users can view permissions | PERMISSIVE | SELECT | auth.role() = 'authenticated' |
| Admins can manage permissions | PERMISSIVE | ALL | is_admin(auth.uid()) |

### role_permissions (신규)

| Policy Name | Permission | Command | Condition |
|------------|------------|---------|-----------|
| Authenticated users can view role permissions | PERMISSIVE | SELECT | auth.role() = 'authenticated' |
| Admins can manage role permissions | PERMISSIVE | ALL | is_admin(auth.uid()) |

## Trigger Changes

### handle_new_user() (수정)

기존 트리거에 `name` 필드 매핑을 추가한다.

**변경 전**:
```
INSERT INTO profiles (id, email, role_id)
VALUES (NEW.id, NEW.email, default_role_id)
```

**변경 후**:
```
INSERT INTO profiles (id, email, name, role_id)
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name', default_role_id)
```

## Migration Steps

1. `ALTER TABLE profiles ADD COLUMN name TEXT`
2. `UPDATE profiles SET name = (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE auth.users.id = profiles.id)`
3. `INSERT INTO roles (id, name, description) VALUES ('a0000000-0000-0000-0000-000000000003', 'viewer', '뷰어 (읽기 전용)')` (중복 시 무시)
4. `CREATE TABLE permissions (...)` + RLS 활성화 + 정책 추가
5. `CREATE TABLE role_permissions (...)` + UNIQUE 제약 + RLS 활성화 + 정책 추가
6. Seed: permissions 및 role_permissions 데이터 INSERT
7. `handle_new_user()` 트리거 함수 수정 — name 필드 포함
