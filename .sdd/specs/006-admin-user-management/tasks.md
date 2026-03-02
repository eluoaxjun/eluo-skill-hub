# Tasks: 006-admin-user-management

## 표기 규칙
- `[P]` 다른 [P] 태스크와 병렬 실행 가능
- `[TEST]` 테스트 먼저 작성 (TDD Red 단계)
- `[IMPL]` 구현 (TDD Green 단계)
- `depends:` 선행 완료 필요 태스크 번호

---

## Phase 1 — Domain Layer (TDD)

### T01 [P][TEST] UserRole 값 객체 테스트 작성
- **파일**: `src/admin/domain/__tests__/UserRole.test.ts` (신규)
- **테스트 케이스**:
  - `create('admin')` → UserRole 인스턴스 반환
  - `create('user')` → UserRole 인스턴스 반환
  - `create('unknown')` → `Error('Invalid role: unknown')` throw
  - `create('ADMIN')` → Error throw (대소문자 구분)
  - `.value` getter → `'admin'` | `'user'` 반환
  - `equals(other)` → 동일 값이면 `true`, 다른 값이면 `false`
- **상태**: [ ] 미완료

---

### T02 [P][TEST] MemberProfile 엔티티 테스트 작성
- **파일**: `src/admin/domain/__tests__/MemberProfile.test.ts` (신규)
- **테스트 케이스**:
  - `create(props)` → MemberProfile 인스턴스 반환
  - getter: `email`, `roleId`, `roleName`, `createdAt` 정상 반환
  - `changeRole(newRoleId, newRoleName)` → 새로운 MemberProfile 인스턴스 반환 (원본 불변)
  - `changeRole` 후 `.roleId`, `.roleName` 변경 확인
- **상태**: [ ] 미완료

---

### T03 [P][IMPL] UserRole 값 객체 구현
- **depends**: T01
- **파일**: `src/admin/domain/value-objects/UserRole.ts` (신규)
- **구현**:
  ```ts
  const VALID_ROLES = ['admin', 'user'] as const;
  type RoleName = typeof VALID_ROLES[number];

  export class UserRole {
    private constructor(private readonly _value: RoleName) {}
    static create(value: string): UserRole { /* 유효성 검사 후 생성 */ }
    get value(): RoleName { return this._value; }
    equals(other: UserRole): boolean { return this._value === other._value; }
  }
  ```
- **상태**: [ ] 미완료

---

### T04 [IMPL] MemberProfile 엔티티 구현
- **depends**: T02, T03
- **파일**: `src/admin/domain/entities/MemberProfile.ts` (신규)
- **구현**:
  - `extends Entity<string>` (`@/shared/domain/types/Entity`)
  - `MemberProfileProps`: `id`, `email`, `roleId`, `roleName`, `createdAt`
  - `static create(props): MemberProfile`
  - `changeRole(newRoleId, newRoleName): MemberProfile` — 새 인스턴스 반환
  - getters: `email`, `roleId`, `roleName`, `createdAt`
- **상태**: [ ] 미완료

---

### T05 [IMPL] MemberRepository 포트 인터페이스 정의
- **depends**: T04
- **파일**: `src/admin/application/ports/MemberRepository.ts` (신규)
- **구현**:
  ```ts
  import type { MemberProfile } from '@/admin/domain/entities/MemberProfile';
  export interface MemberRepository {
    findAll(): Promise<MemberProfile[]>;
    updateRole(memberId: string, newRoleId: string): Promise<void>;
    findAllRoles(): Promise<Array<{ id: string; name: string }>>;
  }
  ```
- **상태**: [ ] 미완료

---

## Phase 2 — Application Layer (TDD)

### T06 [P][TEST] GetAllMembersUseCase 테스트 작성
- **depends**: T05
- **파일**: `src/admin/application/__tests__/GetAllMembersUseCase.test.ts` (신규)
- **테스트 케이스**:
  - `execute()` → `{ members: MemberProfile[], roles: [...] }` 반환
  - `findAll()`과 `findAllRoles()`가 각각 호출되는지 mock 검증
  - 빈 회원 목록 반환 시 `{ members: [], roles: [...] }` 정상 처리
- **상태**: [ ] 미완료

---

### T07 [P][TEST] UpdateMemberRoleUseCase 테스트 작성
- **depends**: T05
- **파일**: `src/admin/application/__tests__/UpdateMemberRoleUseCase.test.ts` (신규)
- **테스트 케이스**:
  - `execute({ targetUserId: 'A', newRoleId: 'role1', requestingUserId: 'B' })` → 정상 완료, `repository.updateRole` 호출 검증
  - `execute({ targetUserId: 'A', newRoleId: 'role1', requestingUserId: 'A' })` → `Error('자기 자신의 역할은 변경할 수 없습니다')` throw
  - 자기 자신인 경우 `repository.updateRole`이 호출되지 않음을 검증
- **상태**: [ ] 미완료

---

### T08 [P][IMPL] GetAllMembersUseCase 구현
- **depends**: T06
- **파일**: `src/admin/application/GetAllMembersUseCase.ts` (신규)
- **구현**:
  ```ts
  export interface GetAllMembersResult {
    members: MemberProfile[];
    roles: Array<{ id: string; name: string }>;
  }
  export class GetAllMembersUseCase {
    constructor(private readonly repository: MemberRepository) {}
    async execute(): Promise<GetAllMembersResult> {
      const [members, roles] = await Promise.all([
        this.repository.findAll(),
        this.repository.findAllRoles(),
      ]);
      return { members, roles };
    }
  }
  ```
- **상태**: [ ] 미완료

---

### T09 [P][IMPL] UpdateMemberRoleUseCase 구현
- **depends**: T07
- **파일**: `src/admin/application/UpdateMemberRoleUseCase.ts` (신규)
- **구현**:
  ```ts
  export interface UpdateMemberRoleInput {
    targetUserId: string;
    newRoleId: string;
    requestingUserId: string;
  }
  export class UpdateMemberRoleUseCase {
    constructor(private readonly repository: MemberRepository) {}
    async execute(input: UpdateMemberRoleInput): Promise<void> {
      if (input.requestingUserId === input.targetUserId) {
        throw new Error('자기 자신의 역할은 변경할 수 없습니다');
      }
      await this.repository.updateRole(input.targetUserId, input.newRoleId);
    }
  }
  ```
- **상태**: [ ] 미완료

---

## Phase 3 — Infrastructure Layer

### T10 [IMPL] SupabaseMemberRepository 구현
- **depends**: T08, T09
- **파일**: `src/admin/infrastructure/SupabaseMemberRepository.ts` (신규)
- **구현**:
  - `findAll()`:
    ```ts
    supabase.from('profiles')
      .select('id, email, created_at, role_id, roles(id, name)')
      .order('created_at', { ascending: false })
    // → 각 row를 MemberProfile.create()로 매핑
    ```
  - `updateRole(memberId, newRoleId)`:
    ```ts
    supabase.from('profiles')
      .update({ role_id: newRoleId })
      .eq('id', memberId)
    ```
  - `findAllRoles()`:
    ```ts
    supabase.from('roles').select('id, name').order('name')
    ```
  - `roles` join 결과의 타입 처리 (array vs object) — 기존 `SupabaseAdminRepository` 패턴 참조
- **상태**: [ ] 미완료

---

> ### 🔵 CHECKPOINT 1
> **모든 단위 테스트 통과 확인**
> ```bash
> npx jest src/admin
> ```
> - UserRole, MemberProfile, GetAllMembersUseCase, UpdateMemberRoleUseCase 테스트 전부 GREEN
> - 이후 단계 진행

---

## Phase 4 — App Layer (Server Actions + Page)

### T11 [IMPL] Server Actions 구현
- **depends**: T10
- **파일**: `src/app/admin/members/actions.ts` (신규)
- **구현**:
  ```ts
  'use server';

  export async function getMembers(): Promise<GetAllMembersResult>
  // SupabaseMemberRepository + GetAllMembersUseCase 호출

  export async function updateMemberRole(
    targetUserId: string,
    newRoleId: string
  ): Promise<{ success: true } | { error: string }>
  // 1. createClient()로 현재 사용자 확인 (없으면 error 반환)
  // 2. 현재 사용자 admin 역할 확인 (아니면 error 반환)
  // 3. UpdateMemberRoleUseCase.execute({
  //      targetUserId, newRoleId, requestingUserId: user.id })
  // 4. 성공 → { success: true }
  // 5. Error → { error: err.message }
  ```
- **상태**: [ ] 미완료

---

### T12 [IMPL] Page 서버 컴포넌트 업데이트
- **depends**: T11
- **파일**: `src/app/admin/members/page.tsx` (수정, 현재 stub)
- **구현**:
  ```tsx
  export default async function AdminMembersPageRoute() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { members, roles } = await getMembers();

    const initialMembers: MemberRow[] = members.map(m => ({
      id: m.id,
      email: m.email,
      displayName: '-',
      roleId: m.roleId,
      roleName: m.roleName,
      createdAt: m.createdAt.toISOString(),
    }));

    const roleOptions: RoleOption[] = roles;

    return (
      <AdminMembersPage
        initialMembers={initialMembers}
        roles={roleOptions}
        currentUserId={user!.id}
        updateMemberRole={updateMemberRole}
      />
    );
  }
  ```
- **상태**: [ ] 미완료

---

## Phase 5 — UI Layer (TDD)

### T13 [P][TEST] MemberTable 컴포넌트 테스트 작성
- **depends**: T05 (타입 정의)
- **파일**: `src/features/admin/__tests__/MemberTable.test.tsx` (신규)
- **테스트 케이스**:
  - 회원 목록이 테이블 행으로 렌더링됨 (이메일, 이름("-"), 역할, 가입일)
  - 역할 컬럼에 `<select>` 요소가 현재 roleId로 선택된 상태로 렌더링됨
  - `currentUserId === member.id`인 행의 `<select>`는 `disabled`
  - `loadingMemberIds`에 포함된 memberId의 `<select>`는 `disabled`
  - `<select>` 변경(onChange) 시 `onRoleChange(memberId, newRoleId)` 콜백 호출
  - 회원 없을 때 "등록된 회원이 없습니다" 메시지 렌더링
- **상태**: [ ] 미완료

---

### T14 [P][TEST] AdminMembersPage 컴포넌트 테스트 작성
- **depends**: T05
- **파일**: `src/features/admin/__tests__/AdminMembersPage.test.tsx` (신규)
- **테스트 케이스**:
  - 초기 회원 목록 렌더링 확인
  - 역할 변경 성공 시: `updateMemberRole` mock 호출 + `toast.success` 호출
  - 역할 변경 실패 시: `toast.error` 호출 + 드롭다운 이전 값으로 롤백
  - 역할 변경 중: 해당 회원 드롭다운 `disabled` 상태
  - 빈 회원 목록 시 빈 상태 메시지 표시
- **상태**: [ ] 미완료

---

### T15 [IMPL] MemberTable 컴포넌트 구현
- **depends**: T13
- **파일**: `src/features/admin/MemberTable.tsx` (신규)
- **Props**:
  ```ts
  interface MemberTableProps {
    members: MemberRow[];
    roles: RoleOption[];
    currentUserId: string;
    loadingMemberIds: Set<string>;
    onRoleChange: (memberId: string, newRoleId: string) => void;
  }
  ```
- **구현**:
  - `<table>` 기반 레이아웃 (SkillTable.tsx 스타일 참조)
  - 컬럼: 이메일 | 이름 | 역할 | 가입일
  - 역할 컬럼: `<select>` — `value={member.roleId}`, `disabled` 조건 처리
  - 빈 상태: `members.length === 0` 시 colspan 메시지 행
  - `createdAt` 포맷: `new Date(member.createdAt).toLocaleDateString('ko-KR')`
- **상태**: [ ] 미완료

---

### T16 [IMPL] AdminMembersPage 클라이언트 컴포넌트 구현
- **depends**: T14, T15, T11
- **파일**: `src/features/admin/AdminMembersPage.tsx` (신규)
- **Props**:
  ```ts
  interface AdminMembersPageProps {
    initialMembers: MemberRow[];
    roles: RoleOption[];
    currentUserId: string;
    updateMemberRole: (
      targetUserId: string,
      newRoleId: string
    ) => Promise<{ success: true } | { error: string }>;
  }
  ```
- **구현**:
  ```ts
  'use client';
  // useState: members, loadingMemberIds (Set<string>)
  async function handleRoleChange(memberId: string, newRoleId: string) {
    // 1. setLoadingMemberIds(prev => new Set(prev).add(memberId))
    // 2. result = await updateMemberRole(memberId, newRoleId)
    // 3. if 'error' in result: toast.error(result.error) — 롤백 불필요 (members 상태 미변경)
    // 4. else: setMembers(prev => prev.map(m =>
    //      m.id === memberId ? {...m, roleId: newRoleId, roleName: roles.find...} : m))
    //    toast.success('역할이 변경되었습니다.')
    // 5. finally: setLoadingMemberIds(prev => { prev.delete(memberId); return new Set(prev) })
  }
  ```
- **상태**: [ ] 미완료

---

## Phase 6 — 브레드크럼프 (헤더 동적화)

### T17 [P][IMPL] AdminBreadcrumb 클라이언트 컴포넌트 구현
- **depends**: 없음 (독립)
- **파일**: `src/features/admin/AdminBreadcrumb.tsx` (신규)
- **구현**:
  ```tsx
  'use client';
  import { usePathname } from 'next/navigation';
  import { ChevronRightIcon } from '@/shared/ui/icons';

  const ADMIN_BREADCRUMB_MAP: Record<string, string> = {
    '/admin/members': '회원관리',
    '/admin/skills': '스킬관리',
  };

  export function AdminBreadcrumb() {
    const pathname = usePathname();
    const tabLabel = ADMIN_BREADCRUMB_MAP[pathname] ?? '어드민';
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-sm font-medium">어드민</span>
        <ChevronRightIcon size={16} />
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {tabLabel}
        </span>
      </div>
    );
  }
  ```
- **상태**: [ ] 미완료

---

### T18 [P][IMPL] Header.tsx breadcrumb prop 추가
- **depends**: 없음 (독립)
- **파일**: `src/shared/ui/Header.tsx` (수정)
- **변경 내용**:
  - `HeaderProps`에 `breadcrumb?: React.ReactNode` 추가
  - 기존 하드코딩된 breadcrumb 영역을 `{breadcrumb ?? <기존 하드코딩 JSX>}` 로 교체
  - 기존 마켓플레이스 페이지의 Header 사용처(breadcrumb 미전달)는 현재 동작 유지 (기본값)
- **상태**: [ ] 미완료

---

### T19 [IMPL] admin layout.tsx 수정
- **depends**: T17, T18
- **파일**: `src/app/admin/layout.tsx` (수정)
- **변경 내용**:
  ```tsx
  import { AdminBreadcrumb } from '@/features/admin/AdminBreadcrumb';

  // Header 사용부 수정:
  <Header
    user={{ email: user.email, avatarUrl: user.user_metadata?.avatar_url as string | undefined }}
    breadcrumb={<AdminBreadcrumb />}
  />
  ```
- **상태**: [ ] 미완료

---

> ### 🔵 CHECKPOINT 2
> **전체 테스트 통과 + 브라우저 확인**
> ```bash
> npx jest src/admin src/features/admin/__tests__/MemberTable.test.tsx src/features/admin/__tests__/AdminMembersPage.test.tsx
> ```
> 수동 확인:
> - [ ] `/admin/members` 접근 시 회원 목록 테이블 렌더링
> - [ ] 역할 드롭다운 동작 (변경 성공/실패 Toast)
> - [ ] 자기 자신 드롭다운 disabled
> - [ ] 헤더 브레드크럼프 `어드민 > 회원관리` 표시
> - [ ] `/admin/skills` 탭 이동 시 브레드크럼프 `어드민 > 스킬관리` 갱신

---

## 태스크 의존성 요약

```
T01[P]─┐
T02[P]─┤→ T03[P]──────────┐
       └→ T04──→ T05──────┼─→ T06[P]→ T08[P]─→ T10─→ T11─→ T12
                           └─→ T07[P]→ T09[P]─┘       │
                                                       ↓
T13[P](의존: T05)──→ T15──→ T16 ←─────────────────────┘
T14[P](의존: T05)──┘

T17[P] ─┐
T18[P] ─┴──→ T19
```

## 전체 태스크 완료 체크리스트

- [ ] T01 UserRole 테스트
- [ ] T02 MemberProfile 테스트
- [ ] T03 UserRole 구현
- [ ] T04 MemberProfile 구현
- [ ] T05 MemberRepository 포트
- [ ] T06 GetAllMembersUseCase 테스트
- [ ] T07 UpdateMemberRoleUseCase 테스트
- [ ] T08 GetAllMembersUseCase 구현
- [ ] T09 UpdateMemberRoleUseCase 구현
- [ ] T10 SupabaseMemberRepository 구현
- [ ] 🔵 CHECKPOINT 1
- [ ] T11 Server Actions 구현
- [ ] T12 Page 서버 컴포넌트 업데이트
- [ ] T13 MemberTable 테스트
- [ ] T14 AdminMembersPage 테스트
- [ ] T15 MemberTable 구현
- [ ] T16 AdminMembersPage 구현
- [ ] T17 AdminBreadcrumb 구현
- [ ] T18 Header.tsx 수정
- [ ] T19 admin layout.tsx 수정
- [ ] 🔵 CHECKPOINT 2
