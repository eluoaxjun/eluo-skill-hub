# Implementation Plan

- [x] 1. DB 마이그레이션: roles 테이블 분리 및 profiles 스키마 변경
  - `public.roles` 테이블을 생성한다. `id`(UUID, PK), `name`(TEXT, UNIQUE, NOT NULL), `description`(TEXT) 컬럼을 포함하며, 초기 데이터로 `'admin'`(관리자)과 `'user'`(일반 사용자) 두 가지 역할을 삽입한다
  - `roles` 테이블에 RLS를 활성화하고, 인증된 사용자가 역할 목록을 조회(SELECT)할 수 있는 정책을 추가한다
  - `public.profiles` 테이블에 `role_id` UUID 컬럼을 nullable로 추가하고, `public.roles(id)`를 참조하는 외래 키 제약조건을 설정한다
  - 기존 `profiles.role` TEXT 데이터를 `roles` 테이블의 해당 `id`로 마이그레이션한다
  - `role_id`를 NOT NULL로 변경하고, 기본값으로 `'user'` 역할의 ID를 설정한다
  - `is_admin()` SECURITY DEFINER 함수를 `roles` 테이블 JOIN 기반으로 재작성한다
  - `handle_new_user()` 트리거 함수를 `role_id`를 `'user'` 역할 ID 서브쿼리로 설정하도록 변경한다
  - 기존 `profiles_role_check` CHECK 제약조건을 삭제하고, `profiles.role` TEXT 컬럼을 삭제한다
  - `jrlee@eluocnc.com` 이메일을 가진 사용자의 `role_id`를 `'admin'` 역할의 ID로 설정한다
  - 기존 관리자 RLS 정책(`Admins can view all profiles`, `Admins can update user roles`)은 `is_admin()` 함수 변경에 의해 자동으로 새 스키마에 대응하므로 정책 코드 변경은 불필요하다
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. 도메인 계층 리팩토링: UserRole에 id 추가 및 UserProfile 연동
- [x] 2.1 (P) UserRole 값 객체에 id 속성 추가
  - 기존 `value`(역할 이름)만 보유하던 UserRole 값 객체에 `id`(UUID) 속성을 추가하여 `roles` 테이블의 PK와 대응시킨다
  - 생성자를 `_id`와 `_name` 두 개의 인자를 받도록 변경하고, 기존 `create(value: string)` 시그니처를 `create(id: string, name: string)`으로 변경한다
  - 하위 호환 및 테스트 편의를 위해 `fromName(name: string)` 팩토리 메서드를 추가한다 (ID 없이 이름만으로 생성, 빈 문자열 ID 허용)
  - 기존 `user()`와 `admin()` 팩토리 메서드를 `user(id: string)`와 `admin(id: string)` 형태로 id를 받도록 변경한다
  - `id` getter를 추가하고, `equals()` 비교 시 `id`와 `name` 모두를 활용한다
  - 불변(immutable) 값 객체 특성을 유지하며, 순수 TypeScript로만 구현한다
  - _Requirements: 1.7_

- [x] 2.2 UserProfile 엔티티의 역할 관리를 roles 테이블 연동 구조로 변경
  - `create()` 팩토리의 `role?: string` 파라미터를 `roleId?: string`과 `roleName?: string` 파라미터로 변경하여 역할 ID와 이름을 함께 받을 수 있도록 한다
  - `UserRole.create(id, name)` 시그니처 변경에 맞추어 내부 역할 생성 로직을 업데이트한다
  - `reconstruct()` 메서드에서 `role` 속성의 `UserRole` 값 객체가 `id`와 `name`을 모두 포함하도록 한다
  - `changeRole(newRole: UserRole)` 메서드의 인터페이스는 동일하게 유지하되, 전달되는 `UserRole`이 `id`를 포함하므로 `role_id` 기반 저장이 가능해진다
  - Task 2.1의 UserRole 변경에 의존한다
  - _Requirements: 1.8_

- [x] 3. UserRepository 인터페이스 확장 및 인프라 계층 리팩토링
- [x] 3.1 UserRepository 인터페이스에 findAllRoles() 메서드 추가
  - `findAllRoles(): Promise<ReadonlyArray<UserRole>>` 메서드를 인터페이스에 추가하여 전체 역할 목록 조회를 지원한다
  - 기존 메서드 시그니처는 변경하지 않으며, 내부 구현만 `roles` JOIN으로 전환된다
  - Task 2의 도메인 모델 변경에 의존한다
  - _Requirements: 6.1_

- [x] 3.2 SupabaseUserRepository를 roles 테이블 JOIN 기반으로 전환
  - `findById`, `findByEmail`, `findAll` 메서드의 쿼리를 `profiles` 테이블에서 `roles` 테이블을 JOIN하여 역할 `id`와 `name`을 함께 조회하도록 변경한다. Supabase의 foreign key relationship 쿼리 문법 `.select('*, roles(id, name)')` 을 활용한다
  - 매핑 로직에서 중첩 객체 구조(`roles: { id, name }`)를 정확히 처리하여 `UserRole.create(id, name)`으로 변환한다
  - `update()` 메서드에서 기존 `role: string` 대신 `role_id: UUID`를 저장하도록 변경한다
  - `getDashboardStats()` 메서드를 `profiles`와 `roles`를 JOIN하여 역할별 카운트를 집계하도록 변경한다
  - `findAllRoles()` 메서드를 구현하여 `roles` 테이블에서 전체 역할 목록을 조회하고 `UserRole[]`로 매핑한다
  - Task 3.1의 인터페이스 확장에 의존한다
  - _Requirements: 1.3, 1.4, 4.3, 6.1_

- [x] 4. 애플리케이션 계층 리팩토링 및 신규 유스케이스 추가
- [x] 4.1 (P) GetAllRolesUseCase 신규 구현
  - `roles` 테이블의 전체 역할 목록을 조회하는 유스케이스를 새로 생성한다
  - `UserRepository.findAllRoles()`를 호출하여 역할 목록을 반환하고, 조회 실패 시 `fetch_failed` 에러 코드와 메시지를 포함하는 결과를 반환한다
  - 사용자 관리 페이지에서 드롭다운 옵션을 동적으로 생성하는 데 사용된다
  - Task 3 완료 후 구현 가능하다
  - _Requirements: 6.2, 6.3_

- [x] 4.2 (P) ChangeUserRoleUseCase의 입력을 roleId 기반으로 변경
  - `ChangeUserRoleInput`의 `newRole: string`(역할 이름)을 `newRoleId: string`(역할 UUID)로 변경한다
  - 역할 유효성 검증을 `UserRole.create()` 예외 처리 방식에서 `findAllRoles()`로 역할 목록을 조회하여 해당 ID가 존재하는지 확인하는 방식으로 전환한다
  - 유효한 `roleId`와 대응하는 `roleName`으로 `UserRole.create(roleId, roleName)`을 생성하여 `profile.changeRole()`에 전달한다
  - 존재하지 않는 `roleId` 전달 시 `invalid_role` 에러를 반환한다
  - Task 3 완료 후 구현 가능하다
  - _Requirements: 4.3, 4.4_

- [x] 5. UI 계층 리팩토링: 드롭다운 Select 기반 역할 변경
- [x] 5.1 사용자 관리 페이지에서 역할 목록 동적 조회 및 전달
  - 서버 컴포넌트에서 `GetAllRolesUseCase`를 추가로 호출하여 `roles` 테이블의 전체 역할 목록을 조회한다
  - 사용자 데이터 직렬화 시 `role`을 기존 `string`에서 `{ id, name }` 객체로 변경하여 역할 ID를 함께 전달한다
  - 직렬화된 역할 목록 데이터(`{ id, name }[]`)를 `UserTable` 클라이언트 컴포넌트에 `roles` prop으로 전달한다
  - Task 4.1 완료 후 구현 가능하다
  - _Requirements: 4.1, 4.2, 6.3_

- [x] 5.2 UserTable 컴포넌트를 버튼 토글에서 드롭다운 Select로 전환
  - 기존 `Button` 토글을 `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` 컴포넌트(shadcn/ui)로 교체한다
  - 각 사용자 행의 역할 컬럼에 `Select` 드롭다운을 배치하고, `roles` prop의 옵션을 `SelectItem`으로 렌더링한다
  - `UserRow` 인터페이스의 `role` 타입을 `string`에서 `{ id: string; name: string }` 객체로 변경하고, `roles: RoleOption[]` prop을 추가한다
  - `onValueChange` 핸들러에서 `changeUserRoleAction(adminUserId, targetUserId, newRoleId)`를 호출한다
  - 본인 행의 `Select`는 `disabled` 상태로 렌더링하여 역할 변경을 UI 레벨에서 차단한다
  - 역할 변경 중(`loading` 상태)인 행의 `Select`도 `disabled`로 처리한다
  - 에러 발생 시 에러 메시지와 재시도 버튼을 제공한다
  - Task 5.1 완료 후 구현 가능하다
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.2_

- [x] 5.3 Server Action의 시그니처를 roleId 기반으로 변경
  - `changeUserRoleAction`의 세 번째 인자를 `newRole: string`(역할 이름)에서 `newRoleId: string`(역할 UUID)로 변경한다
  - `ChangeUserRoleUseCase.execute()` 호출 시 `newRoleId`를 전달하도록 업데이트한다
  - Task 4.2 완료 후 구현 가능하다
  - _Requirements: 4.3_

- [x] 6. 기존 단위 테스트 리팩토링
- [x] 6.1 (P) UserRole 테스트 업데이트
  - `create(id, name)` 시그니처 변경에 맞추어 모든 테스트 케이스의 `create()` 호출부를 업데이트한다
  - `id` getter 테스트, `fromName()` 팩토리 메서드 테스트를 추가한다
  - `user(id)`, `admin(id)` 팩토리 메서드 시그니처 변경에 맞추어 테스트를 업데이트한다
  - `equals()` 비교 시 `id`와 `name` 모두 활용하는 로직을 검증한다
  - _Requirements: 1.7_

- [x] 6.2 (P) UserProfile 테스트 업데이트
  - `create()` 팩토리의 `roleId`/`roleName` 기반 생성 테스트로 변경한다
  - `reconstruct()` 시 `UserRole(id, name)` 기반 mock 데이터를 사용하도록 업데이트한다
  - `changeRole()` 후 새 역할의 `id`와 `name` 모두 반영되는지 확인한다
  - _Requirements: 1.8_

- [x] 6.3 (P) ChangeUserRoleUseCase 테스트 업데이트
  - `ChangeUserRoleInput`의 `newRole`을 `newRoleId`로 변경하고, mock 리포지토리에 `findAllRoles()` 메서드를 추가한다
  - `newRoleId` 기반 역할 변경 성공/실패 시나리오, 존재하지 않는 `roleId` 거부 시나리오 테스트를 업데이트한다
  - 테스트 헬퍼 함수(`createMockUserRepository`, `createTestProfile`)를 새 시그니처에 맞게 수정한다
  - _Requirements: 4.3, 4.4_

- [x] 6.4 (P) SupabaseUserRepository 테스트 업데이트
  - `roles` 테이블 JOIN 쿼리를 mock하고, 중첩 객체 구조(`roles: { id, name }`)의 응답 데이터를 정확히 반영하도록 업데이트한다
  - `update()` 시 `role_id` 기반 업데이트 동작을 검증하도록 변경한다
  - `findAllRoles()` 메서드에 대한 테스트를 추가한다
  - `getDashboardStats()` 테스트를 `roles` JOIN 기반 통계 mock으로 변경한다
  - _Requirements: 1.3, 1.4, 6.1_

- [x] 6.5 (P) GetCurrentUserRoleUseCase 및 나머지 유스케이스 테스트 업데이트
  - `GetCurrentUserRoleUseCase` 테스트의 mock 데이터를 `UserRole(id, name)` 기반으로 변경한다
  - `GetDashboardStatsUseCase` 테스트의 mock 리포지토리에 `findAllRoles()` 메서드를 추가한다
  - `GetAllUsersUseCase` 테스트의 mock 데이터를 `UserRole(id, name)` 기반으로 변경한다
  - `GetAllRolesUseCase` 신규 유스케이스의 단위 테스트를 작성한다 (정상 반환 및 에러 처리)
  - _Requirements: 2.2, 2.4, 3.1, 3.2, 4.1, 6.2_

- [x] 7. 미들웨어 연동 검증 및 E2E 테스트 갱신
  - 기존 미들웨어가 비인증 사용자의 `/admin` 접근을 `/login`으로 리다이렉트하는 동작을 검증한다
  - 인증된 관리자가 `/admin`에 접근하면 대시보드가 정상 렌더링되는지 확인한다
  - 인증되었으나 비관리자가 `/admin`에 접근하면 접근 불가 안내가 표시되는지 확인한다
  - 관리자가 `/admin/users`에서 드롭다운 Select로 역할을 변경한 뒤 목록이 갱신되는 전체 흐름을 검증한다
  - 드롭다운 옵션이 `roles` 테이블의 역할 목록과 일치하는지 확인한다
  - 본인 행의 드롭다운이 disabled 상태인지 확인한다
  - DB 마이그레이션, 도메인, 유스케이스, UI가 모두 올바르게 연동되어 `roles` 테이블 기반으로 작동하는지 종합적으로 확인한다
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.5, 6.3, 7.1, 7.2, 7.3_
