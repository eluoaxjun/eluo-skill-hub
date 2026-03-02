# 구현 계획: 004-admin-page (어드민 페이지)

> **작성일**: 2026-03-02
> **Status**: Draft
> **Dependencies**: 002-auth (완료), 003-sidebar-refactor (완료)

---

## 1. 구현 개요

`/admin` 라우트에 어드민 전용 대시보드를 구현한다.
Supabase `profiles` + `roles` 테이블로 역할을 조회하며, `admin` 역할 사용자만 접근을 허용한다.

### 핵심 결정 사항
- **역할 확인**: 서버 컴포넌트(`app/admin/layout.tsx`)에서 Supabase 쿼리로 수행
- **비인증 사용자**: 기존 middleware.ts가 `/login?redirectTo=/admin`으로 리다이렉트 (추가 작업 불필요)
- **비어드민 사용자**: `UnauthorizedPage` 컴포넌트 렌더링
- **레이아웃**: `AdminSidebar` + 기존 `Header` 조합의 `AdminLayout`
- **어드민 사이드바 탭**: 회원관리(`/admin/members`), 스킬관리(`/admin/skills`)

---

## 2. DB 스키마

```
roles: id(uuid), name(text: 'admin'|'user'), description(text)
profiles: id(uuid), email(text), created_at(timestamp), role_id(uuid) → roles.id

역할 확인 쿼리:
  SELECT r.name FROM profiles p
  JOIN roles r ON p.role_id = r.id
  WHERE p.id = <auth_user_id>
```

---

## 3. 구현 단계

### Phase 1: 애플리케이션 계층 (TDD)

| # | 작업 | 대상 파일 |
|---|------|----------|
| 1-1 | AdminRepository 인터페이스 | `src/admin/application/ports/AdminRepository.ts` |
| 1-2 | GetUserRoleUseCase 테스트 | `src/admin/application/__tests__/GetUserRoleUseCase.test.ts` |
| 1-3 | GetUserRoleUseCase 구현 | `src/admin/application/GetUserRoleUseCase.ts` |

### Phase 2: 인프라스트럭처 계층

| # | 작업 | 대상 파일 |
|---|------|----------|
| 2-1 | SupabaseAdminRepository | `src/admin/infrastructure/SupabaseAdminRepository.ts` |

### Phase 3: UI 컴포넌트 (TDD)

| # | 작업 | 대상 파일 |
|---|------|----------|
| 3-1 | AdminSidebar 테스트 | `src/features/admin/__tests__/AdminSidebar.test.tsx` |
| 3-2 | AdminSidebar 구현 | `src/features/admin/AdminSidebar.tsx` |
| 3-3 | UnauthorizedPage 테스트 | `src/features/admin/__tests__/UnauthorizedPage.test.tsx` |
| 3-4 | UnauthorizedPage 구현 | `src/features/admin/UnauthorizedPage.tsx` |

### Phase 4: 페이지

| # | 작업 | 대상 파일 |
|---|------|----------|
| 4-1 | AdminLayout (역할 확인) | `src/app/admin/layout.tsx` |
| 4-2 | AdminPage (메인) | `src/app/admin/page.tsx` |
| 4-3 | Members stub page | `src/app/admin/members/page.tsx` |
| 4-4 | Skills stub page | `src/app/admin/skills/page.tsx` |

---

## 4. 파일 구조 (최종)

```
src/
├── admin/                                ← 새 바운디드 컨텍스트
│   ├── application/
│   │   ├── ports/
│   │   │   └── AdminRepository.ts        ← 포트 (인터페이스)
│   │   ├── GetUserRoleUseCase.ts
│   │   └── __tests__/
│   │       └── GetUserRoleUseCase.test.ts
│   └── infrastructure/
│       └── SupabaseAdminRepository.ts    ← Supabase 어댑터
├── features/
│   └── admin/                            ← Admin UI 컴포넌트
│       ├── AdminSidebar.tsx              ← 어드민 전용 사이드바
│       ├── UnauthorizedPage.tsx          ← 권한 없음 페이지
│       └── __tests__/
│           ├── AdminSidebar.test.tsx
│           └── UnauthorizedPage.test.tsx
└── app/
    └── admin/
        ├── layout.tsx                    ← 역할 확인 + AdminLayout
        ├── page.tsx                      ← 어드민 대시보드 메인
        ├── members/
        │   └── page.tsx                  ← 회원관리 (stub)
        └── skills/
            └── page.tsx                  ← 스킬관리 (stub)
```

---

## 5. Constitution 준수 검증

| 원칙 | 준수 여부 | 설명 |
|------|-----------|------|
| §2 기술 스택 | ✅ | Next.js + TypeScript + Supabase + Jest |
| §3 DDD 아키텍처 | ✅ | admin 바운디드 컨텍스트, 3계층 |
| §3 domain 외부 의존성 금지 | ✅ | Application 계층은 인터페이스만 참조 |
| §5 any 금지 | ✅ | strict TypeScript 준수 |
| §6 TDD | ✅ | 테스트 먼저 작성 |
| §7 인증/인가 | ✅ | 서버 사이드 역할 확인 |
