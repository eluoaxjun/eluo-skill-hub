# 구현 계획: 002-auth (로그인/로그아웃)

> **작성일**: 2026-03-02
> **Status**: Draft
> **Dependencies**: 001-root-page (완료)

---

## 1. 구현 개요

이메일/비밀번호 기반 회원가입, 로그인, 로그아웃 기능을 구현한다.
Supabase Auth를 활용하며, DDD 아키텍처 원칙에 따라 `auth` 바운디드 컨텍스트를 구성한다.

### 핵심 결정 사항
- **인증 처리**: Next.js Server Actions + Supabase Auth SDK
- **도메인 계층**: 최소화 — Email(@eluocnc.com 제한), Password 값 객체만 (C-03, C-11)
- **이메일 인증**: OTP 6자리 코드 방식 (C-12)
- **접근 제어**: middleware.ts에서 화이트리스트 기반 (C-04)
- **보안**: 이메일 존재 여부 미노출 (C-06), redirectTo 검증 (C-02)

---

## 2. 구현 단계

### Phase 1: 도메인 계층 (Value Objects + Tests)

**목표**: Email, Password 값 객체와 검증 규칙을 정의한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 1-1 | Email VO 테스트 작성 | `src/auth/domain/__tests__/Email.test.ts` | FR-30, FR-33 |
| 1-2 | Email VO 구현 | `src/auth/domain/value-objects/Email.ts` | FR-30, FR-33 |
| 1-3 | Password VO 테스트 작성 | `src/auth/domain/__tests__/Password.test.ts` | FR-31, FR-32, FR-33 |
| 1-4 | Password VO 구현 | `src/auth/domain/value-objects/Password.ts` | FR-31, FR-32, FR-33 |

**검증 기준**: 모든 도메인 테스트 통과

### Phase 2: 애플리케이션 계층 (Use Cases + Repository Interface)

**목표**: AuthRepository 포트와 3개의 유스케이스를 정의한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 2-1 | AuthRepository 인터페이스 정의 | `src/auth/application/ports/AuthRepository.ts` | — |
| 2-2 | SignUpUseCase 테스트 작성 | `src/auth/application/__tests__/SignUpUseCase.test.ts` | FR-05~09 |
| 2-3 | SignUpUseCase 구현 | `src/auth/application/SignUpUseCase.ts` | FR-05~09 |
| 2-4 | SignInUseCase 테스트 작성 | `src/auth/application/__tests__/SignInUseCase.test.ts` | FR-15~18 |
| 2-5 | SignInUseCase 구현 | `src/auth/application/SignInUseCase.ts` | FR-15~18 |
| 2-6 | SignOutUseCase 테스트 작성 | `src/auth/application/__tests__/SignOutUseCase.test.ts` | FR-26 |
| 2-7 | SignOutUseCase 구현 | `src/auth/application/SignOutUseCase.ts` | FR-26 |
| 2-8 | VerifyCodeUseCase 테스트 작성 | `src/auth/application/__tests__/VerifyCodeUseCase.test.ts` | FR-37~41 |
| 2-9 | VerifyCodeUseCase 구현 | `src/auth/application/VerifyCodeUseCase.ts` | FR-37~41 |

**검증 기준**: 유스케이스 테스트 통과 (AuthRepository는 mock)

### Phase 3: 인프라스트럭처 계층 (Supabase Auth Adapter)

**목표**: SupabaseAuthRepository를 구현하여 실제 Supabase Auth API와 연동한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 3-1 | SupabaseAuthRepository 구현 | `src/auth/infrastructure/SupabaseAuthRepository.ts` | — |
| 3-2 | Server Actions 정의 (signup) | `src/app/signup/actions.ts` | FR-01~11 |
| 3-3 | Server Actions 정의 (login) | `src/app/login/actions.ts` | FR-12~20 |
| 3-6 | Server Actions 정의 (verify-code) | `src/app/signup/verify-code/actions.ts` | FR-37~44 |
| 3-4 | redirectTo 검증 유틸 | `src/auth/infrastructure/sanitizeRedirectTo.ts` | FR-18, C-02 |
| 3-5 | redirectTo 유틸 테스트 | `src/auth/infrastructure/__tests__/sanitizeRedirectTo.test.ts` | C-02 |

**검증 기준**: sanitizeRedirectTo 테스트 통과, Server Actions 정의 완료

### Phase 4: 회원가입 UI (`/signup`)

**목표**: 회원가입 폼 페이지와 이메일 확인 안내 페이지를 구현한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 4-1 | SignupForm 컴포넌트 테스트 | `src/features/auth/__tests__/SignupForm.test.tsx` | FR-01~11 |
| 4-2 | SignupForm 컴포넌트 구현 | `src/features/auth/SignupForm.tsx` | FR-01~11, FR-34~35 |
| 4-3 | Signup 페이지 구현 | `src/app/signup/page.tsx` | FR-01~11 |
| 4-4 | VerifyCodeForm 테스트 | `src/features/auth/__tests__/VerifyCodeForm.test.tsx` | FR-37~44 |
| 4-5a | VerifyCodeForm 구현 | `src/features/auth/VerifyCodeForm.tsx` | FR-37~44 |
| 4-5b | VerifyCode 페이지 | `src/app/signup/verify-code/page.tsx` | FR-37~44, C-12 |
| 4-5 | AuthLayout (공유 레이아웃) | `src/features/auth/AuthLayout.tsx` | NFR-04, NFR-05 |

**검증 기준**: SignupForm 테스트 통과, 빌드 성공

### Phase 5: 로그인 UI (`/login`)

**목표**: 로그인 폼 페이지를 구현한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 5-1 | LoginForm 컴포넌트 테스트 | `src/features/auth/__tests__/LoginForm.test.tsx` | FR-12~20 |
| 5-2 | LoginForm 컴포넌트 구현 | `src/features/auth/LoginForm.tsx` | FR-12~20, FR-34~36 |
| 5-3 | Login 페이지 구현 | `src/app/login/page.tsx` | FR-12~20 |

**검증 기준**: LoginForm 테스트 통과, 빌드 성공

### Phase 6: 로그아웃 UI (ProfileDropdown)

**목표**: 기존 Header에서 ProfileDropdown을 분리하고 로그아웃 플로우를 구현한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 6-1 | ProfileDropdown 테스트 | `src/shared/ui/__tests__/ProfileDropdown.test.tsx` | FR-21~27 |
| 6-2 | ProfileDropdown 구현 | `src/shared/ui/ProfileDropdown.tsx` | FR-21~27 |
| 6-3 | LogoutConfirmDialog 구현 | `src/shared/ui/LogoutConfirmDialog.tsx` | FR-24~26 |
| 6-4 | Header 리팩토링 | `src/shared/ui/Header.tsx` (수정) | C-05 |
| 6-5 | Server Action (logout) | `src/app/logout/actions.ts` | FR-26 |

**검증 기준**: ProfileDropdown 테스트 통과, Header 기존 테스트 유지

### Phase 7: 접근 제어 (Middleware)

**목표**: middleware.ts에 화이트리스트 기반 접근 제어를 추가한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 7-1 | middleware.ts 확장 | `src/middleware.ts` (수정) | FR-28, FR-29, C-04 |

**검증 기준**: 빌드 성공

### Phase 8: 통합 검증 및 E2E

**목표**: 전체 플로우를 E2E 테스트로 검증한다.

| # | 작업 | 대상 파일 | FR |
|---|------|----------|-----|
| 8-1 | 회원가입 E2E 테스트 | `src/__tests__/e2e/signup.spec.ts` | US-001 |
| 8-2 | 로그인 E2E 테스트 | `src/__tests__/e2e/login.spec.ts` | US-002 |
| 8-3 | 로그아웃 E2E 테스트 | `src/__tests__/e2e/logout.spec.ts` | US-003 |
| 8-4 | 접근 제어 E2E 테스트 | `src/__tests__/e2e/access-control.spec.ts` | US-004 |
| 8-5 | 전체 빌드 + 전체 테스트 | — | 전체 |

---

## 3. 파일 구조 (최종)

```
src/
├── auth/                              ← 새 바운디드 컨텍스트
│   ├── domain/
│   │   ├── value-objects/
│   │   │   ├── Email.ts               ← 이메일 검증 VO
│   │   │   └── Password.ts            ← 비밀번호 검증 VO
│   │   └── __tests__/
│   │       ├── Email.test.ts
│   │       └── Password.test.ts
│   ├── application/
│   │   ├── ports/
│   │   │   └── AuthRepository.ts      ← 포트 (인터페이스)
│   │   ├── SignUpUseCase.ts
│   │   ├── SignInUseCase.ts
│   │   ├── SignOutUseCase.ts
│   │   └── __tests__/
│   │       ├── SignUpUseCase.test.ts
│   │       ├── SignInUseCase.test.ts
│   │       └── SignOutUseCase.test.ts
│   └── infrastructure/
│       ├── SupabaseAuthRepository.ts   ← Supabase Auth 어댑터
│       ├── sanitizeRedirectTo.ts       ← redirectTo 검증 유틸
│       └── __tests__/
│           └── sanitizeRedirectTo.test.ts
├── features/
│   └── auth/                          ← Auth UI 컴포넌트
│       ├── AuthLayout.tsx             ← 로그인/회원가입 공유 레이아웃
│       ├── SignupForm.tsx             ← 회원가입 폼 (Client Component)
│       ├── LoginForm.tsx              ← 로그인 폼 (Client Component)
│       ├── VerifyCodeForm.tsx         ← 인증 코드 입력 폼 (Client Component)
│       └── __tests__/
│           ├── SignupForm.test.tsx
│           ├── LoginForm.test.tsx
│           └── VerifyCodeForm.test.tsx
├── shared/ui/
│   ├── ProfileDropdown.tsx            ← 새로 분리 (Client Component)
│   ├── LogoutConfirmDialog.tsx        ← 새로 생성
│   └── Header.tsx                     ← 수정 (ProfileDropdown 합성)
├── app/
│   ├── login/
│   │   ├── page.tsx                   ← 로그인 페이지
│   │   └── actions.ts                 ← Server Actions (login)
│   ├── signup/
│   │   ├── page.tsx                   ← 회원가입 페이지
│   │   ├── actions.ts                 ← Server Actions (signup)
│   │   └── verify-code/
│   │       ├── page.tsx               ← 인증 코드 입력 페이지
│   │       └── actions.ts             ← Server Actions (verify-code)
│   └── logout/
│       └── actions.ts                 ← Server Actions (logout)
└── middleware.ts                       ← 수정 (접근 제어 추가)
```

---

## 4. 의존성 그래프

```
Phase 1 (Domain VOs)
  │
  ├──→ Phase 2 (Use Cases)  ── depends on Phase 1 VOs
  │       │
  │       ├──→ Phase 3 (Infrastructure) ── depends on Phase 2 ports
  │       │       │
  │       │       ├──→ Phase 4 (Signup UI) ── depends on Phase 3 actions
  │       │       ├──→ Phase 5 (Login UI)  ── depends on Phase 3 actions
  │       │       └──→ Phase 6 (Logout UI) ── depends on Phase 3 actions
  │       │               │
  │       │               └──→ Phase 7 (Middleware) ── depends on Phase 3
  │       │                       │
  │       │                       └──→ Phase 8 (E2E) ── depends on all
```

### 병렬 실행 가능 조합
- Phase 4, 5, 6은 서로 독립적이므로 **동시 실행 가능**
- Phase 1 → 2 → 3은 순차 실행 필수

---

## 5. 기술 상세

### 5.1 Server Actions 패턴

각 인증 액션은 `'use server'` 디렉티브를 사용한 Server Action으로 구현한다:

```
formData → VO 검증 → UseCase 실행 → SupabaseAuthRepository 호출 → 결과 반환/리다이렉트
```

- **회원가입**: 성공/실패 무관하게 동일 응답 후 `/signup/verify-email`로 리다이렉트 (C-06)
- **로그인**: 성공 시 `redirectTo` 검증 후 리다이렉트, 실패 시 에러 반환
- **로그아웃**: 세션 종료 후 `/`로 리다이렉트

### 5.2 폼 검증 전략 (C-10)

```
┌─ onBlur ──────────────────────────────────────────┐
│  필드 이탈 시 해당 필드만 검증                      │
│  Email.create() 또는 Password.create() 호출        │
│  실패 → 인라인 에러 표시                            │
└───────────────────────────────────────────────────┘

┌─ onChange ─────────────────────────────────────────┐
│  이미 에러가 표시된 필드만 재검증                    │
│  에러 조건 해소 → 에러 해제                          │
│  에러 없는 필드는 무시                               │
└───────────────────────────────────────────────────┘

┌─ onSubmit ────────────────────────────────────────┐
│  전체 필드 재검증                                   │
│  첫 번째 에러 필드로 포커스 이동                     │
│  모두 통과 → Server Action 호출                     │
└───────────────────────────────────────────────────┘
```

### 5.3 인증 상태 레이아웃 공유 패턴

AuthLayout은 로그인/회원가입 페이지의 공유 레이아웃이다:
- 중앙 정렬 카드
- 로고 + 서비스명
- 다크 모드 지원
- 반응형 (모바일: 풀 너비, 데스크탑: 최대 400px 카드)

### 5.4 ProfileDropdown 아키텍처 (C-05)

```
Header (Server Component)
  └── ProfileDropdown (Client Component) ← props: { email, avatarUrl }
        ├── 아바타 버튼 (트리거)
        ├── 드롭다운 메뉴
        │     ├── 이메일 표시
        │     └── 로그아웃 버튼
        └── LogoutConfirmDialog
              ├── "정말 로그아웃하시겠습니까?"
              ├── [취소] → 다이얼로그 닫기
              └── [로그아웃] → signOut → 리다이렉트
```

- 외부 클릭 감지: `useEffect` + `mousedown` 이벤트 리스너
- ESC 키: 드롭다운/다이얼로그 닫기

### 5.5 Middleware 접근 제어 로직

```
요청 들어옴
  │
  ├── 정적 리소스? → 통과 (기존 matcher)
  │
  ├── 세션 갱신 (기존 로직)
  │
  ├── getUser() → 인증 상태 확인
  │
  ├── 공개 경로 화이트리스트 체크
  │     /, /login, /signup, /signup/verify-code
  │
  ├── 비로그인 + 보호 경로 → /login?redirectTo={경로}
  │
  ├── 로그인 + 인증 경로(/login, /signup) → /
  │
  └── 그 외 → 통과
```

---

## 6. 요구사항 매핑

| FR | Phase | 구현 파일 |
|----|-------|----------|
| FR-01~04 | 4 | SignupForm.tsx, signup/page.tsx |
| FR-05~07 | 1,4 | Email.ts, Password.ts, SignupForm.tsx |
| FR-08 | 2,3 | SignUpUseCase.ts, signup/actions.ts |
| FR-09 | 3,4 | signup/actions.ts, verify-code/page.tsx |
| FR-37~44 | 2,3,4 | VerifyCodeUseCase.ts, verify-code/actions.ts, VerifyCodeForm.tsx |
| FR-10 | 4 | SignupForm.tsx |
| FR-11 | 4 | SignupForm.tsx |
| FR-12~14 | 5 | LoginForm.tsx, login/page.tsx |
| FR-15 | 1,5 | Email.ts, LoginForm.tsx |
| FR-16 | 2,5 | SignInUseCase.ts, LoginForm.tsx |
| FR-17 | 3 | login/actions.ts |
| FR-18 | 3 | login/actions.ts, sanitizeRedirectTo.ts |
| FR-19 | 5 | LoginForm.tsx |
| FR-20 | 5 | LoginForm.tsx |
| FR-21~23 | 6 | ProfileDropdown.tsx |
| FR-24~26 | 6 | LogoutConfirmDialog.tsx, logout/actions.ts |
| FR-27 | 6 | ProfileDropdown.tsx |
| FR-28 | 7 | middleware.ts |
| FR-29 | 7 | middleware.ts |
| FR-30 | 1 | Email.ts |
| FR-31~32 | 1 | Password.ts |
| FR-33 | 1 | Email.ts, Password.ts |
| FR-34~35 | 4,5 | SignupForm.tsx, LoginForm.tsx |
| FR-36 | 2,3 | SignInUseCase.ts, login/actions.ts |

| NFR | 구현 방법 |
|-----|----------|
| NFR-01 | Supabase Auth API 의존 (제어 불가, 모니터링) |
| NFR-02 | 일반 에러 메시지, 동일 응답 패턴 |
| NFR-03 | console.log 금지, localStorage 금지 |
| NFR-04 | Tailwind dark: 프리픽스, 기존 디자인 토큰 활용 |
| NFR-05 | Tailwind 반응형 유틸 (sm:, md:, lg:) |
| NFR-06 | 제출 중 버튼 disabled + isSubmitting 상태 |

---

## 7. 리스크 평가

| 리스크 | 영향 | 확률 | 대응 |
|--------|------|------|------|
| Supabase 이메일 확인 설정 미비 | 회원가입 후 로그인 불가 | 중 | 가정사항 2,3 사전 확인 |
| 이메일 템플릿 미수정 | 확인 콜백 URL 불일치 | 중 | Supabase 대시보드에서 수동 설정 필요 |
| middleware 무한 리다이렉트 | 페이지 접근 불가 | 낮 | 공개 경로 화이트리스트 엄격 관리 |
| Server Action에서 redirect 예외 | 에러 핸들링 복잡 | 낮 | try-catch에서 redirect 에러 제외 |

---

## 8. Constitution 준수 검증

| 원칙 | 준수 여부 | 설명 |
|------|-----------|------|
| §2 기술 스택 | ✅ | Next.js + TypeScript + Supabase + Jest + Playwright |
| §3 DDD 아키텍처 | ✅ | auth 바운디드 컨텍스트, 3계층 구조, VO + UseCase + Repository |
| §3 domain 외부 의존성 금지 | ✅ | Email, Password VO는 순수 검증 로직만 포함 |
| §3 Aggregate Root | ⚠️ N/A | Auth 컨텍스트는 엔티티/애그리게이트 없음 (VO만 사용) |
| §4 네이밍 컨벤션 | ✅ | PascalCase VO, UseCase 접미사, Repository 접미사 |
| §5 any 금지 | ✅ | strict TypeScript 준수 |
| §6 TDD | ✅ | 테스트 먼저 작성 (Phase 순서: 테스트 → 구현) |
| §7 인증/인가 | ✅ | Supabase Auth 기반, middleware 접근 제어 |
| §7 시크릿 관리 | ✅ | 환경변수 사용, 하드코딩 금지 |
| §8 성능 | ✅ | API 500ms 목표 (Supabase Auth 의존) |
| §9 커밋 컨벤션 | ✅ | feat/test prefix + 한글 설명 |

### ⚠️ 참고
- Auth 컨텍스트에는 Aggregate Root가 없다. 이는 의도적인 설계로, 인증 로직을 Supabase에 위임하고 도메인은 검증 규칙만 담당하기 때문이다 (C-03).
- 이 결정은 Constitution §3의 "Aggregate Root를 통해서만 데이터를 변경"과 충돌하지 않는다. Auth 컨텍스트는 자체 데이터를 변경하지 않으며, Supabase Auth가 데이터를 관리한다.
