# Implementation Plan: 006-admin-user-management

## 개요

| 항목 | 내용 |
|------|------|
| Feature | 어드민 회원관리 페이지 |
| Route | `/admin/members` |
| 구현 범위 | 회원 목록 테이블, 역할 변경 드롭다운, 헤더 브레드크럼프 동적화 |
| 영향 범위 | `src/admin/`, `src/features/admin/`, `src/app/admin/members/`, `src/shared/ui/Header.tsx`, `src/app/admin/layout.tsx` |

---

## 아키텍처 레이어별 구현 계획

```
[Domain]         MemberProfile (Entity) + UserRole (VO) + MemberRepository (Port)
    ↓
[Application]    GetAllMembersUseCase + UpdateMemberRoleUseCase
    ↓
[Infrastructure] SupabaseMemberRepository
    ↓
[App Layer]      actions.ts (Server Actions) + page.tsx (Server Component)
    ↓
[Feature/UI]     AdminMembersPage (Client) + MemberTable (Client)
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 설명 |
|------|------|
| `src/admin/domain/entities/MemberProfile.ts` | 회원 엔티티 (Aggregate Root) |
| `src/admin/domain/value-objects/UserRole.ts` | 역할 값 객체 |
| `src/admin/application/ports/MemberRepository.ts` | 리포지토리 포트 인터페이스 |
| `src/admin/application/GetAllMembersUseCase.ts` | 전체 회원 조회 유스케이스 |
| `src/admin/application/UpdateMemberRoleUseCase.ts` | 역할 변경 유스케이스 |
| `src/admin/infrastructure/SupabaseMemberRepository.ts` | Supabase 구현체 |
| `src/features/admin/MemberTable.tsx` | 회원 테이블 UI 컴포넌트 |
| `src/features/admin/AdminMembersPage.tsx` | 회원관리 페이지 클라이언트 컴포넌트 |
| `src/features/admin/AdminBreadcrumb.tsx` | 동적 브레드크럼프 클라이언트 컴포넌트 |
| `src/app/admin/members/actions.ts` | 서버 액션 |
| `src/admin/domain/__tests__/UserRole.test.ts` | UserRole 단위 테스트 |
| `src/admin/domain/__tests__/MemberProfile.test.ts` | MemberProfile 단위 테스트 |
| `src/admin/application/__tests__/GetAllMembersUseCase.test.ts` | 유스케이스 테스트 |
| `src/admin/application/__tests__/UpdateMemberRoleUseCase.test.ts` | 유스케이스 테스트 |
| `src/features/admin/__tests__/MemberTable.test.tsx` | 컴포넌트 테스트 |
| `src/features/admin/__tests__/AdminMembersPage.test.tsx` | 페이지 통합 테스트 |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/app/admin/members/page.tsx` | 기존 stub → 서버 컴포넌트로 완성 |
| `src/shared/ui/Header.tsx` | `breadcrumb?: React.ReactNode` 슬롯 prop 추가 |
| `src/app/admin/layout.tsx` | `<AdminBreadcrumb />`를 Header에 전달 |

---

## 상세 구현 명세

### 1. `UserRole` 값 객체

```ts
// src/admin/domain/value-objects/UserRole.ts
const VALID_ROLES = ['admin', 'user'] as const;
type RoleName = typeof VALID_ROLES[number];

export class UserRole {
  private constructor(private readonly _value: RoleName) {}

  static create(value: string): UserRole {
    if (!VALID_ROLES.includes(value as RoleName)) {
      throw new Error(`Invalid role: ${value}`);
    }
    return new UserRole(value as RoleName);
  }

  get value(): RoleName { return this._value; }
  equals(other: UserRole): boolean { return this._value === other._value; }
}
```

### 2. `MemberProfile` 엔티티 (Aggregate Root)

```ts
// src/admin/domain/entities/MemberProfile.ts
export interface MemberProfileProps {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  createdAt: Date;
}

export class MemberProfile extends Entity<string> {
  // private readonly fields
  // static create(props): MemberProfile
  // changeRole(newRoleId: string, newRoleName: string): MemberProfile
  //   → 새 인스턴스 반환 (immutable)
  // getters: email, roleId, roleName, createdAt
}
```

### 3. `MemberRepository` 포트

```ts
// src/admin/application/ports/MemberRepository.ts
export interface MemberRepository {
  findAll(): Promise<MemberProfile[]>;
  updateRole(memberId: string, newRoleId: string): Promise<void>;
  findAllRoles(): Promise<Array<{ id: string; name: string }>>;
}
```

### 4. `GetAllMembersUseCase`

```ts
// src/admin/application/GetAllMembersUseCase.ts
export interface GetAllMembersResult {
  members: MemberProfile[];
  roles: Array<{ id: string; name: string }>;
}

export class GetAllMembersUseCase {
  async execute(): Promise<GetAllMembersResult>
  // findAll() + findAllRoles() 병렬 호출
}
```

### 5. `UpdateMemberRoleUseCase`

```ts
// src/admin/application/UpdateMemberRoleUseCase.ts
export interface UpdateMemberRoleInput {
  targetUserId: string;
  newRoleId: string;
  requestingUserId: string; // 자기 자신 보호용
}

export class UpdateMemberRoleUseCase {
  async execute(input: UpdateMemberRoleInput): Promise<void>
  // 1. requestingUserId === targetUserId → Error('자기 자신의 역할은 변경할 수 없습니다')
  // 2. repository.updateRole(targetUserId, newRoleId)
}
```

### 6. `SupabaseMemberRepository`

```ts
// src/admin/infrastructure/SupabaseMemberRepository.ts
// findAll(): profiles JOIN roles 쿼리 → MemberProfile.create() 매핑
// updateRole(): profiles UPDATE
// findAllRoles(): roles SELECT
```

### 7. Server Actions (`actions.ts`)

```ts
// src/app/admin/members/actions.ts
'use server';

// getMembers(): 회원 목록 + roles 목록 조회
// updateMemberRole(targetUserId, newRoleId):
//   - 현재 로그인 사용자 확인 (미로그인 → error)
//   - admin 역할 확인 (미admin → error)
//   - UpdateMemberRoleUseCase.execute()
//   - 성공/실패 반환
```

### 8. Page 서버 컴포넌트

```tsx
// src/app/admin/members/page.tsx
export default async function AdminMembersPageRoute() {
  const { members, roles } = await getMembers();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AdminMembersPage
      initialMembers={...}
      roles={...}
      currentUserId={user!.id}
      updateMemberRole={updateMemberRole}
    />
  );
}
```

### 9. `AdminMembersPage` 클라이언트 컴포넌트

```tsx
// src/features/admin/AdminMembersPage.tsx
'use client';

interface AdminMembersPageProps {
  initialMembers: MemberRow[];
  roles: RoleOption[];
  currentUserId: string;
  updateMemberRole: (targetUserId: string, newRoleId: string) => Promise<UpdateResult>;
}

// useState로 members 관리
// handleRoleChange(memberId, newRoleId):
//   - 로딩 상태 set
//   - updateMemberRole 호출
//   - 성공: toast.success + members 상태 업데이트
//   - 실패: toast.error + 드롭다운 롤백
//   - finally: 로딩 상태 해제
```

### 10. `MemberTable` 컴포넌트

```tsx
// src/features/admin/MemberTable.tsx
// 컬럼: 이메일 | 이름(-) | 역할(드롭다운) | 가입일
// 역할 컬럼: <select> 요소
//   - 자기 자신 → disabled
//   - 로딩 중 → disabled
//   - onChange → onRoleChange(memberId, newRoleId)
```

### 11. `AdminBreadcrumb` 클라이언트 컴포넌트

```tsx
// src/features/admin/AdminBreadcrumb.tsx
'use client';

const ADMIN_BREADCRUMB_MAP: Record<string, string> = {
  '/admin/members': '회원관리',
  '/admin/skills': '스킬관리',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const tabLabel = ADMIN_BREADCRUMB_MAP[pathname] ?? '어드민';
  return (
    // 어드민 > {tabLabel}
  );
}
```

### 12. `Header.tsx` 수정

```tsx
// breadcrumb prop 추가
interface HeaderProps {
  user?: HeaderUser;
  breadcrumb?: React.ReactNode;  // 추가
}

export function Header({ user, breadcrumb }: HeaderProps) {
  return (
    <header ...>
      <div>  {/* Breadcrumb 영역 */}
        {breadcrumb ?? <DefaultBreadcrumb />}
      </div>
      ...
    </header>
  );
}
```

### 13. `layout.tsx` 수정

```tsx
// AdminBreadcrumb import 후 Header에 전달
<Header
  user={{ email: user.email, avatarUrl: ... }}
  breadcrumb={<AdminBreadcrumb />}
/>
```

---

## TDD 테스트 계획

### 단위 테스트

| 파일 | 테스트 케이스 |
|------|--------------|
| `UserRole.test.ts` | 유효한 값 생성 성공, 유효하지 않은 값 → Error, equals() |
| `MemberProfile.test.ts` | create() 성공, changeRole() 불변 반환, getter 검증 |
| `GetAllMembersUseCase.test.ts` | 정상 조회 반환, repository mock |
| `UpdateMemberRoleUseCase.test.ts` | 정상 변경, 자기 자신 → Error, repository.updateRole 호출 검증 |

### 통합 테스트 (RTL)

| 파일 | 테스트 케이스 |
|------|--------------|
| `MemberTable.test.tsx` | 회원 목록 렌더링, 역할 드롭다운 표시, 자기 자신 disabled, 로딩 중 disabled, onChange 콜백 |
| `AdminMembersPage.test.tsx` | 역할 변경 성공 → toast success, 역할 변경 실패 → toast error + 롤백, 초기 빈 상태 메시지 |

---

## Constitution 준수 체크

| 원칙 | 준수 여부 | 내용 |
|------|----------|------|
| domain 계층 외부 의존성 금지 | ✅ | `MemberProfile`, `UserRole`은 순수 TS, 외부 import 없음 |
| Aggregate Root를 통한 데이터 변경 | ✅ | 역할 변경은 `MemberProfile.changeRole()` 경유 후 Repository 호출 |
| any 타입 금지 | ✅ | 모든 타입 명시적으로 선언 |
| 컨텍스트 간 통신은 도메인 이벤트 | ✅ (해당 없음) | 단일 컨텍스트 내 작업 |
| TDD 필수 | ✅ | 도메인/유스케이스/컴포넌트 테스트 포함 |
| 서버 사이드 인가 검증 | ✅ | `actions.ts`에서 admin 역할 확인 후 UseCase 실행 |
| 네이밍 컨벤션 | ✅ | Entity: PascalCase, UseCase 접미사, Repository 접미사 |
