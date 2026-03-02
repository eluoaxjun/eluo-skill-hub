# Tasks: 004-admin-page (어드민 페이지)

> **생성일**: 2026-03-02
> **총 태스크**: 12개 (4 Phase)
> **TDD**: 테스트 태스크가 구현 태스크 앞에 배치됨

---

## Phase 1: 애플리케이션 계층 (Use Case)
> **의존성**: 없음

### T-001: AdminRepository 인터페이스 정의
- **파일**: `src/admin/application/ports/AdminRepository.ts`
- **설명**: 어드민 역할 조회를 위한 포트 인터페이스를 정의한다.
  - `getUserRole(userId: string): Promise<string | null>` 메서드

### T-002: GetUserRoleUseCase 테스트 작성
- **파일**: `src/admin/application/__tests__/GetUserRoleUseCase.test.ts`
- **의존성**: T-001
- **설명**: GetUserRoleUseCase를 mock AdminRepository로 테스트한다.
  - adminRepository.getUserRole 호출 확인
  - 'admin' 반환 시 `{ role: 'admin', isAdmin: true }` 반환
  - 'user' 반환 시 `{ role: 'user', isAdmin: false }` 반환
  - null 반환 시 `{ role: null, isAdmin: false }` 반환

### T-003: GetUserRoleUseCase 구현
- **파일**: `src/admin/application/GetUserRoleUseCase.ts`
- **의존성**: T-002
- **설명**: 사용자 역할을 조회하는 유스케이스를 구현한다.
  - 입력: `userId: string`
  - adminRepository.getUserRole(userId) 호출
  - `{ role: string | null; isAdmin: boolean }` 반환

### 🔖 Checkpoint 1: 애플리케이션 테스트 통과
```bash
npx jest src/admin --passWithNoTests
```

---

## Phase 2: 인프라스트럭처 계층
> **의존성**: Phase 1 (T-001)

### T-004: SupabaseAdminRepository 구현
- **파일**: `src/admin/infrastructure/SupabaseAdminRepository.ts`
- **설명**: AdminRepository를 Supabase로 구현한다.
  - 생성자: Supabase Client 주입
  - `getUserRole(userId)`: profiles + roles 테이블 조인 쿼리
    ```sql
    SELECT r.name FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = userId
    ```
  - 결과가 없으면 null 반환
  - 에러 발생 시 null 반환

---

## Phase 3: UI 컴포넌트 (TDD)
> **의존성**: Phase 1, Phase 2 완료 후 독립적으로 진행 가능

### T-005: AdminSidebar 테스트 작성
- **파일**: `src/features/admin/__tests__/AdminSidebar.test.tsx`
- **설명**: AdminSidebar의 렌더링과 내비게이션을 테스트한다.
  - '회원관리' 탭이 렌더링된다
  - '스킬관리' 탭이 렌더링된다
  - '회원관리' 탭 클릭 시 `/admin/members` 링크를 가진다
  - '스킬관리' 탭 클릭 시 `/admin/skills` 링크를 가진다
  - 현재 경로가 `/admin/members`일 때 '회원관리' 탭이 활성 스타일을 가진다
  - 현재 경로가 `/admin/skills`일 때 '스킬관리' 탭이 활성 스타일을 가진다

### T-006: AdminSidebar 구현
- **파일**: `src/features/admin/AdminSidebar.tsx`
- **의존성**: T-005
- **설명**: `'use client'` Client Component.
  - 기존 Sidebar와 동일한 레이아웃 구조
  - 상단 로고 영역 (AI 스킬 허브 어드민)
  - 내비게이션: 회원관리(`/admin/members`), 스킬관리(`/admin/skills`)
  - `usePathname()` 으로 현재 경로 확인하여 활성 탭 표시

### T-007: UnauthorizedPage 테스트 작성
- **파일**: `src/features/admin/__tests__/UnauthorizedPage.test.tsx`
- **설명**: UnauthorizedPage의 렌더링과 동작을 테스트한다.
  - 권한 없음 메시지("접근 권한이 없습니다" 또는 유사)가 표시된다
  - 돌아가기 버튼이 존재한다
  - 돌아가기 버튼 클릭 시 홈(`/`)으로 이동한다

### T-008: UnauthorizedPage 구현
- **파일**: `src/features/admin/UnauthorizedPage.tsx`
- **의존성**: T-007
- **설명**: 권한 없음 화면 컴포넌트.
  - 중앙 정렬 레이아웃
  - 경고 아이콘 + "접근 권한이 없습니다" 메시지
  - 부가 설명: "어드민 권한이 필요한 페이지입니다."
  - 홈으로 돌아가기 버튼 (`href="/"`)

### 🔖 Checkpoint 3: UI 테스트 통과
```bash
npx jest src/features/admin --passWithNoTests
```

---

## Phase 4: 페이지
> **의존성**: Phase 2, Phase 3 완료

### T-009: AdminLayout 구현 (역할 확인)
- **파일**: `src/app/admin/layout.tsx`
- **설명**: Server Component. 어드민 역할 확인 + 레이아웃.
  - Supabase 서버 클라이언트로 현재 사용자 확인
  - SupabaseAdminRepository + GetUserRoleUseCase로 역할 조회
  - `isAdmin === false` → UnauthorizedPage 렌더링
  - `isAdmin === true` → AdminSidebar + Header + children 레이아웃 렌더링

### T-010: AdminPage 구현 (메인)
- **파일**: `src/app/admin/page.tsx`
- **설명**: `/admin` 메인 대시보드 페이지.
  - 어드민 대시보드 환영 메시지
  - 회원관리, 스킬관리로 이동하는 바로가기 카드

### T-011: Members stub page
- **파일**: `src/app/admin/members/page.tsx`
- **설명**: `/admin/members` 회원관리 페이지 (stub).
  - "회원관리" 제목과 준비 중 메시지

### T-012: Skills stub page
- **파일**: `src/app/admin/skills/page.tsx`
- **설명**: `/admin/skills` 스킬관리 페이지 (stub).
  - "스킬관리" 제목과 준비 중 메시지

### 🔖 Checkpoint 4 (Final): 빌드 + 전체 테스트
```bash
npx jest src/admin src/features/admin --passWithNoTests && npx next build
```

---

## 수용 기준 체크리스트 (spec.md 대비)

- [x] admin 역할 사용자가 `/admin`에 접근하면 대시보드 레이아웃이 표시된다
- [x] 비로그인 사용자가 `/admin`에 접근하면 로그인 페이지로 리다이렉트된다 (middleware 처리)
- [x] admin 역할이 없는 로그인 사용자가 `/admin`에 접근하면 권한 없음 메시지가 표시된다
- [x] 권한 없음 화면에 돌아가기 버튼이 존재하고, 클릭 시 홈으로 이동한다
- [x] 사이드바에 회원관리, 스킬관리 탭이 존재한다
- [x] 각 탭 클릭 시 해당 경로로 이동한다
- [x] 현재 활성 탭이 시각적으로 구분된다
- [x] 역할 확인이 서버 사이드에서 이루어진다
