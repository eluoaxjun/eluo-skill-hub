# Research: 006-admin-user-management

## 1. 코드베이스 현황 분석

### 1.1 DB 스키마 (Supabase MCP 확인)

| 테이블 | 컬럼 | 비고 |
|--------|------|------|
| `profiles` | `id` (uuid, FK→auth.users), `email` (text), `created_at` (timestamptz), `role_id` (uuid, FK→roles) | RLS enabled |
| `roles` | `id` (uuid), `name` (text, unique), `description` (text) | 현재 2행: `admin`, `user` |

**roles 데이터:**
```
a0000000-0000-0000-0000-000000000001 | admin | 관리자
a0000000-0000-0000-0000-000000000002 | user  | 일반 사용자
```

**이름(display name) 저장 위치:**
- `profiles` 테이블에는 이름 컬럼이 없다.
- Supabase Auth의 `auth.users.raw_user_meta_data`에 `full_name` 등이 있을 수 있으나, 서버 사이드에서 직접 조회 시 admin API 권한이 필요하다.
- **결론**: 이름 컬럼은 `profiles.email`을 주 식별자로 사용하고, 이름은 표시 불가 시 "-"로 대체한다. profiles에 name 컬럼이 없으므로 이름 컬럼 자체를 제거하거나, user_metadata 조회를 plan에 포함한다.
- **채택 결정**: 이름은 `"-"` 고정 표시 (향후 profiles에 name 컬럼 추가 시 확장 가능). 이메일 + 역할 + 가입일이 핵심.

---

### 1.2 기존 admin 도메인 구조

```
src/admin/
  application/
    ports/
      AdminRepository.ts        # getUserRole(userId): Promise<string|null>
    GetUserRoleUseCase.ts       # isAdmin: boolean 반환
    __tests__/
      GetUserRoleUseCase.test.ts
  infrastructure/
    SupabaseAdminRepository.ts  # profiles JOIN roles 쿼리
```

- `AdminRepository`는 `application/ports/`에 위치 (auth/skill-marketplace는 domain/repositories/)
- 새로운 `MemberRepository`도 동일한 패턴으로 `application/ports/`에 위치

---

### 1.3 기존 skill-management 패턴 (005, 구현 완료)

참조 패턴:
```
Server Component (page.tsx)
  → Server Actions (actions.ts) — 'use server'
    → UseCase → Repository
  → Client Component (AdminSkillsPage.tsx) — 'use client'
    ← props: initialData + server action functions
```

이 패턴을 `admin/members`에도 동일하게 적용한다.

---

### 1.4 Header 브레드크럼프 구현 방안 검토

**현재 Header.tsx:**
- Server Component (또는 RSC-safe)
- 브레드크럼프 하드코딩: "마켓플레이스 > 추천 스킬"
- `usePathname()` 사용 불가 (client hook)

**Option A: Header에 `breadcrumb?: React.ReactNode` 슬롯 추가**
- Header를 수정해 breadcrumb 영역을 외부에서 주입 가능하게 변경
- Admin layout에서 `<AdminBreadcrumb />` (client component)를 슬롯으로 전달
- 서버 컴포넌트가 클라이언트 컴포넌트를 props로 전달하는 것은 Next.js에서 지원
- **채택**: 기존 Header의 구조를 최소 변경하면서 유연성 확보

**Option B: Header 전체를 'use client'로 변경**
- 단순하지만 Header가 서버 컴포넌트였던 이점(직접 데이터 조회 등) 상실
- **미채택**

**Option C: AdminHeader를 별도 컴포넌트로 분리**
- 불필요한 파일 증가
- **미채택**

---

### 1.5 역할 변경 UX 패턴

- 드롭다운 선택 즉시 서버 액션 호출 (낙관적 업데이트 X → 요청 완료 후 상태 반영)
- 요청 중 드롭다운 disabled 처리
- 실패 시 이전 값으로 롤백 (useState로 관리)
- Toast(sonner) 라이브러리 이미 설치되어 있음 (admin layout에서 `<Toaster />` 사용)

---

## 2. 의존성

| 항목 | 상태 | 비고 |
|------|------|------|
| sonner (Toast) | 이미 설치 | `toast.success()`, `toast.error()` |
| Supabase client | 이미 설치 | `createClient()` from `@/shared/infrastructure/supabase/server` |
| shadcn/ui Select | 확인 필요 | components.json 존재하므로 설치 가능 |
| Entity base class | 이미 존재 | `@/shared/domain/types/Entity` |

### shadcn/ui Select 컴포넌트
`components.json`이 존재하므로 shadcn/ui가 설정되어 있다. 역할 드롭다운에 `<select>` HTML 기본 요소를 사용하거나 shadcn의 Select 컴포넌트를 사용할 수 있다.
→ **채택**: native `<select>` 요소 사용 (이미 Tailwind CSS로 스타일링 가능, 외부 의존성 추가 불필요)
