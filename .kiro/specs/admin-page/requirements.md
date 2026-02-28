# Requirements Document

## Project Description (Input)
어드민 페이지 구현 (v2 - 역할 테이블 분리)

1. /admin 라우터로 구현
2. role은 별도의 `roles` 테이블로 존재해야 한다.
3. role은 우선 admin과 admin이 아닌 것(user)으로 두 가지만 만들어놓는다.
4. 이 role이 user의 정보와 연결(FK)되어야 한다.
5. role이 관리자인 사람만 접근 가능 / role이 관리자가 아닌 사람은 접근 불가 안내
6. 어드민 페이지에서는 유저의 역할을 드롭다운으로 변경할 수 있어야 한다.
7. jrlee@eluocnc.com 는 관리자로 먼저.

## Introduction

Eluo Skill Hub 플랫폼에서 관리자(admin) 역할을 가진 사용자만 접근할 수 있는 어드민 페이지를 구현한다. 역할(role)은 별도의 `public.roles` 테이블로 관리하며, `public.profiles` 테이블에서 FK(`role_id`)로 참조한다. `/admin` 라우트에서 역할 기반 접근 제어(RBAC)를 수행하고, 사용자 관리 페이지에서 드롭다운을 통해 역할을 변경할 수 있다. 초기 관리자로 `jrlee@eluocnc.com` 계정을 설정한다.

## Requirements

### Requirement 1: 역할(Role) 테이블 및 데이터 모델

**Objective:** 시스템으로서, 역할(role)을 독립적인 테이블로 관리하고 사용자 프로필과 외래 키(FK)로 연결해야 한다. 이를 통해 역할의 확장성과 데이터 무결성을 보장할 수 있다.

#### Acceptance Criteria

1. The Admin System shall `public.roles` 테이블을 생성한다. 컬럼: `id`(UUID, PK), `name`(TEXT, UNIQUE, NOT NULL), `description`(TEXT).
2. The Admin System shall `roles` 테이블에 초기 데이터로 `'admin'`(관리자)과 `'user'`(일반 사용자) 두 가지 역할을 삽입한다.
3. The Admin System shall `public.profiles` 테이블의 기존 `role` TEXT 컬럼을 `role_id` UUID 컬럼으로 교체하고, `public.roles(id)`를 참조하는 외래 키 제약조건을 설정한다.
4. The Admin System shall 기존 `profiles.role` TEXT 데이터를 `roles` 테이블의 해당 `id`로 마이그레이션한다.
5. When 신규 사용자가 가입하면, the Admin System shall `handle_new_user()` 트리거에서 해당 사용자의 `role_id`를 `'user'` 역할의 ID로 설정한다.
6. The Admin System shall `jrlee@eluocnc.com` 이메일을 가진 사용자의 `role_id`를 `'admin'` 역할의 ID로 설정한다.
7. The Admin System shall `UserRole` 도메인 값 객체에 `id`(역할 테이블 PK)와 `name`(역할명) 속성을 포함한다.
8. The Admin System shall `UserProfile` 도메인 엔티티의 `role` 속성이 `roles` 테이블과 연동된 `UserRole` 값 객체를 사용하도록 한다.

---

### Requirement 2: 어드민 페이지 라우팅 및 접근 제어

**Objective:** 관리자로서, `/admin` 경로에 접근하여 관리 기능을 사용할 수 있어야 한다. 일반 사용자는 관리 페이지에 접근할 수 없도록 보호된다.

#### Acceptance Criteria

1. The Admin System shall `/admin` 라우트에서 어드민 페이지를 제공한다.
2. When 인증된 관리자(role name = 'admin')가 `/admin` 페이지에 접근하면, the Admin System shall 어드민 대시보드를 표시한다.
3. If 인증되지 않은 사용자가 `/admin` 페이지에 접근하면, the Admin System shall 로그인 페이지(`/login`)로 리다이렉트한다.
4. If 인증되었으나 역할이 'admin'이 아닌 사용자가 `/admin` 페이지에 접근하면, the Admin System shall "접근 권한이 없습니다. 관리자만 접근할 수 있는 페이지입니다." 안내 메시지를 표시한다.
5. If 권한이 없는 사용자에게 접근 불가 안내가 표시되면, the Admin System shall 메인 페이지로 돌아갈 수 있는 링크를 함께 제공한다.

---

### Requirement 3: 어드민 대시보드

**Objective:** 관리자로서, 어드민 대시보드에서 플랫폼 현황을 한눈에 파악할 수 있어야 한다. 이를 통해 효율적으로 플랫폼을 관리할 수 있다.

#### Acceptance Criteria

1. The Admin System shall 어드민 대시보드에 전체 등록 사용자 수를 표시한다.
2. The Admin System shall 어드민 대시보드에 역할별(관리자/일반 사용자) 사용자 수를 표시한다.
3. The Admin System shall 어드민 대시보드에서 관리 메뉴(사용자 관리)로의 네비게이션을 제공한다.

---

### Requirement 4: 사용자 관리 기능 (드롭다운 역할 변경)

**Objective:** 관리자로서, 등록된 사용자 목록을 조회하고 드롭다운 UI를 통해 사용자의 역할을 변경할 수 있어야 한다. 이를 통해 플랫폼 사용자를 직관적으로 관리할 수 있다.

#### Acceptance Criteria

1. The Admin System shall 어드민 페이지에서 전체 사용자 목록을 이메일, 역할, 가입일 정보와 함께 표시한다.
2. The Admin System shall 각 사용자 행의 역할 컬럼에 드롭다운(`<Select>`) 컴포넌트를 배치하여 `roles` 테이블의 모든 역할 옵션을 표시한다.
3. When 관리자가 드롭다운에서 새로운 역할을 선택하면, the Admin System shall 해당 사용자의 `role_id`를 선택된 역할의 ID로 DB에 즉시 업데이트한다.
4. If 관리자가 본인 행의 드롭다운에서 역할을 변경하려고 시도하면, the Admin System shall 본인 행의 드롭다운을 비활성화(disabled)하여 변경을 차단한다.
5. When 역할 변경이 성공하면, the Admin System shall 변경 완료 메시지를 표시하고 사용자 목록을 갱신한다.
6. If 역할 변경 요청이 실패하면, the Admin System shall 오류 메시지를 표시하고 재시도 옵션을 제공한다.

---

### Requirement 5: 역할 기반 접근 제어(RLS) 정책

**Objective:** 시스템으로서, 데이터베이스 수준에서 역할 기반 접근 제어를 강제해야 한다. 이를 통해 API 우회를 통한 비인가 접근을 방지할 수 있다.

#### Acceptance Criteria

1. The Admin System shall `public.roles` 테이블에 RLS를 활성화하고, 인증된 사용자가 역할 목록을 조회(SELECT)할 수 있는 정책을 추가한다.
2. The Admin System shall `public.profiles` 테이블에 관리자만 전체 사용자 프로필을 조회(SELECT)할 수 있는 RLS 정책을 유지한다.
3. The Admin System shall `public.profiles` 테이블에 관리자만 다른 사용자의 `role_id` 컬럼을 수정(UPDATE)할 수 있는 RLS 정책을 유지한다.
4. The Admin System shall `is_admin()` SECURITY DEFINER 함수를 `roles` 테이블 JOIN 기반으로 업데이트한다.
5. If 관리자 권한이 없는 사용자가 다른 사용자의 프로필을 조회하거나 수정하려고 시도하면, the Admin System shall 해당 요청을 데이터베이스 수준에서 거부한다.

---

### Requirement 6: 역할 목록 조회

**Objective:** 시스템으로서, 역할 변경 드롭다운에 표시할 역할 목록을 `roles` 테이블에서 동적으로 조회해야 한다. 이를 통해 향후 역할이 추가되어도 코드 변경 없이 대응할 수 있다.

#### Acceptance Criteria

1. The Admin System shall `UserRepository` 인터페이스에 `findAllRoles()` 메서드를 추가하여 전체 역할 목록을 조회할 수 있어야 한다.
2. The Admin System shall `GetAllRolesUseCase`를 제공하여 역할 목록을 조회한다.
3. The Admin System shall 사용자 관리 페이지에서 `GetAllRolesUseCase`를 호출하여 드롭다운 옵션을 동적으로 생성한다.

---

### Requirement 7: 로딩 및 에러 처리

**Objective:** 관리자로서, 어드민 페이지 사용 중 명확한 피드백을 받아야 한다. 이를 통해 현재 상태를 파악하고 문제 발생 시 적절히 대응할 수 있다.

#### Acceptance Criteria

1. While 사용자 역할 확인이 진행 중일 때, the Admin System shall 로딩 인디케이터를 표시한다.
2. While 사용자 목록을 불러오는 중일 때, the Admin System shall 로딩 인디케이터를 표시한다.
3. If Supabase와의 통신에 실패하면, the Admin System shall 네트워크 오류 메시지를 표시하고 재시도 옵션을 제공한다.
