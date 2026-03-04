# Research: 어드민 회원관리 기능

**Feature Branch**: `009-admin-member-management`
**Date**: 2026-03-04

## R-001: Shadcn DropdownMenu vs Select 컴포넌트 선택

**Decision**: Select 컴포넌트 사용

**Rationale**: 사용자 요청에서 "dropdown"을 언급했으나, 역할 선택은 목록에서 하나를 고르는 행위이므로 Shadcn의 `Select` 컴포넌트가 의미적으로 더 적합하다. `DropdownMenu`는 액션 메뉴(삭제, 편집 등)에 적합하고, `Select`는 값 선택에 적합하다. 다만, 사용자의 "dropdown" 표현은 일반적인 드롭다운 형태의 UI를 의미하는 것으로 해석하며 Shadcn Select도 드롭다운 형태로 동작한다.

**Alternatives considered**:
- DropdownMenu: 액션 목록에 적합하나 form value 바인딩이 자연스럽지 않음
- 커스텀 드롭다운: 불필요한 추가 작업

## R-002: 역할 변경 서버 통신 패턴

**Decision**: Server Action을 사용한 즉시 업데이트

**Rationale**: 기존 프로젝트가 signup/signin에서 Server Action 패턴을 사용하고 있다. 역할 변경은 단일 필드 업데이트이므로 별도 API Route 없이 Server Action으로 처리하는 것이 일관성 있다. Select onChange 시 즉시 Server Action을 호출하고, Optimistic UI 없이 서버 응답 후 UI를 업데이트한다.

**Alternatives considered**:
- API Route Handler: 별도 엔드포인트 생성 필요, 기존 패턴과 불일치
- Optimistic UI: 역할 변경은 관리 기능이므로 정확성이 속도보다 중요

## R-003: profiles.name 필드 마이그레이션 전략

**Decision**: Supabase SQL 마이그레이션으로 일괄 처리

**Rationale**:
1. `ALTER TABLE profiles ADD COLUMN name TEXT` 으로 필드 추가
2. `UPDATE profiles SET name = (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE auth.users.id = profiles.id)` 로 기존 데이터 마이그레이션
3. `handle_new_user()` 트리거 수정하여 신규 가입 시 `name` 필드도 함께 저장

**Alternatives considered**:
- 애플리케이션 레벨 마이그레이션: 런타임 성능 저하 우려
- display_name을 profiles에서 조회 않고 auth.users에서 직접 조회: 매 요청마다 auth 테이블 조인 필요, 성능 불리

## R-004: viewer 역할 추가

**Decision**: roles 테이블에 viewer 역할 seed 데이터 추가

**Rationale**: 현재 roles 테이블에는 admin, user만 존재한다. 스펙에서 viewer 역할이 필요하므로 마이그레이션에서 `INSERT INTO roles (name, description) VALUES ('viewer', '뷰어 (읽기 전용)')` 추가.

**Alternatives considered**: 없음 (필수 요구사항)

## R-005: 권한 테이블 설계 — 역할-권한 매핑 방식

**Decision**: `permissions` + `role_permissions` 조인 테이블 (RBAC 표준 모델)

**Rationale**: 업계 표준 RBAC(Role-Based Access Control) 패턴을 따른다. 역할과 권한은 다대다 관계이며, 중간 조인 테이블 `role_permissions`로 매핑한다. 현 단계에서는 역할 단위 권한만 관리하고, 추후 개별 사용자 권한 오버라이드가 필요하면 `user_permissions` 테이블을 추가할 수 있다.

**Alternatives considered**:
- 권한을 roles 테이블에 JSON 배열로 저장: 정규화 위반, 쿼리 비효율
- 단순 boolean 컬럼 (`can_download`): 새 권한 추가 시마다 스키마 변경 필요

## R-006: 마지막 admin 보호 로직 위치

**Decision**: Server Action에서 업데이트 전 카운트 검증

**Rationale**: 역할 변경 Server Action 실행 시, 대상 회원이 현재 admin이고 변경 후 역할이 admin이 아닌 경우, admin 역할 회원 수를 카운트하여 1명 이하이면 변경을 거부한다. DB 레벨 CHECK CONSTRAINT보다 애플리케이션 레벨에서 처리하는 것이 에러 메시지 제어에 유리하다.

**Alternatives considered**:
- DB 트리거: 에러 메시지 커스텀이 어렵고 디버깅 복잡
- RLS 정책: 조건부 UPDATE 정책은 복잡도 증가

## R-007: RLS 정책 — 새 테이블

**Decision**: permissions, role_permissions에 RLS 적용

**Rationale**: Constitution Principle V (Security-First)에 따라 모든 테이블에 RLS 필수. permissions와 role_permissions는 읽기 전용(관리자만 수정)이므로:
- SELECT: 인증된 사용자 전체 허용 (자신의 권한 확인 용도)
- INSERT/UPDATE/DELETE: admin 역할만 허용

**Alternatives considered**: 없음 (Constitution 요구사항)

## R-008: 회원 검색 쿼리 방식

**Decision**: Supabase `.or()` + `.ilike()` 패턴 사용

**Rationale**: 검색 대상 필드가 `name`과 `email` 2개이며, 부분 문자열 매칭이 필요하다. Supabase SDK의 `.or('name.ilike.%검색어%,email.ilike.%검색어%')` 체인을 사용하면 SQL의 `WHERE name ILIKE '%검색어%' OR email ILIKE '%검색어%'`와 동일한 쿼리가 생성된다. Supabase SDK가 parameterized query를 생성하므로 SQL Injection 위험 없음.

**Alternatives considered**:
- PostgreSQL Full-Text Search (tsvector): 내부 도구이고 회원 수가 수천 명 이내이므로 오버엔지니어링
- 클라이언트 필터링: 전체 데이터 로드 필요, 페이지네이션과 충돌
- Supabase `.textSearch()`: 한글 토크나이저 미지원으로 부분 매칭 불가

## R-009: 검색 UI와 URL 상태 관리 패턴

**Decision**: Client Component + `useRouter().push()` + `useSearchParams()` + debounce(300ms)

**Rationale**: Next.js App Router에서 Server Component는 `searchParams`를 자동으로 읽는다. 검색어가 URL 파라미터로 전달되면 Server Component가 자동 리렌더링되므로 별도 Server Action이나 API Route 불필요. Client Component인 검색 입력 필드에서 debounce 후 `router.push('?q=xxx&page=1')`로 URL을 업데이트하면, Next.js가 서버에서 새 페이지를 렌더링한다. 검색 시 page=1로 리셋하여 FR-016을 충족.

**Alternatives considered**:
- Server Action + `useFormState`: 검색은 폼 제출이 아닌 실시간 필터링이므로 부적합
- `nuqs` 라이브러리: 외부 의존성 추가 불필요, 네이티브 API로 충분
- `useOptimistic`: 검색 결과의 optimistic update는 예측 불가능하므로 부적합
