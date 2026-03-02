# Tasks: 002-auth (로그인/로그아웃)

> **생성일**: 2026-03-02
> **총 태스크**: 43개 (8 Phase)
> **TDD**: 테스트 태스크가 구현 태스크 앞에 배치됨

---

## Phase 1: 도메인 계층 (Value Objects)
> **US 매핑**: US-001, US-002 (입력 검증 규칙)
> **의존성**: 없음

### T-001: Email VO 단위 테스트 작성
- **파일**: `src/auth/domain/__tests__/Email.test.ts`
- **FR**: FR-30, FR-33, C-11
- **설명**: Email 값 객체의 검증 규칙을 테스트한다.
  - 빈 문자열 → "이메일을 입력해주세요"
  - 잘못된 형식 (`"abc"`, `"abc@"`, `"@test.com"`) → "올바른 이메일 형식이 아닙니다"
  - 다른 도메인 (`"user@gmail.com"`, `"user@example.com"`) → "eluocnc.com 이메일만 사용할 수 있습니다"
  - 올바른 형식 (`"user@eluocnc.com"`) → Email 인스턴스 생성
  - `value` getter로 원본 값 접근
  - 동일한 이메일 VO 간 `equals()` true
  - 다른 이메일 VO 간 `equals()` false

### T-002: Email VO 구현
- **파일**: `src/auth/domain/value-objects/Email.ts`
- **FR**: FR-30, FR-33, C-11
- **의존성**: T-001
- **설명**: `ValueObject<{ value: string }>`을 확장하여 이메일 검증 VO를 구현한다.
  - `static create(value: string): Email` — 팩토리 메서드
  - 검증 실패 시 Error throw (메시지: 한글)
  - 정규식: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (기본 형식)
  - 도메인 검증: `@eluocnc.com`으로 끝나야 함
  - 도메인 불일치 → "eluocnc.com 이메일만 사용할 수 있습니다"

### T-003: Password VO 단위 테스트 작성 [P]
- **파일**: `src/auth/domain/__tests__/Password.test.ts`
- **FR**: FR-31, FR-32, FR-33, C-07
- **설명**: Password 값 객체의 검증 규칙을 테스트한다.
  - 빈 문자열 → "비밀번호를 입력해주세요"
  - 7자 → "비밀번호는 8자 이상이어야 합니다"
  - 73자 → "비밀번호는 72자 이하여야 합니다"
  - 숫자만 → "비밀번호에 영문을 포함해주세요"
  - 영문만 → "비밀번호에 숫자를 포함해주세요"
  - `"Password1"` → Password 인스턴스 생성 성공
  - 특수문자 포함 `"Pass@123"` → 성공
  - 정확히 8자 `"Abcdef12"` → 성공 (경계값)
  - 정확히 72자 → 성공 (경계값)
  - `value` getter, `equals()` 테스트

### T-004: Password VO 구현 [P]
- **파일**: `src/auth/domain/value-objects/Password.ts`
- **FR**: FR-31, FR-32, FR-33, C-07
- **의존성**: T-003
- **설명**: `ValueObject<{ value: string }>`을 확장하여 비밀번호 검증 VO를 구현한다.
  - `static create(value: string): Password` — 팩토리 메서드
  - 길이: 8 ≤ length ≤ 72
  - 영문: `/[a-zA-Z]/`, 숫자: `/[0-9]/`

### 🔖 Checkpoint 1: 도메인 테스트 통과
```bash
npx jest src/auth/domain --passWithNoTests
```
- Email 테스트 전체 통과
- Password 테스트 전체 통과

---

## Phase 2: 애플리케이션 계층 (Use Cases)
> **US 매핑**: US-001, US-002, US-003
> **의존성**: Phase 1

### T-005: AuthRepository 인터페이스 정의
- **파일**: `src/auth/application/ports/AuthRepository.ts`
- **FR**: —, FR-37~44
- **설명**: 인증 포트 인터페이스를 정의한다.
  - `AuthResult` 타입: `{ success: boolean; error?: string; statusCode?: number }`
  - `AuthRepository` 인터페이스: `signUp`, `signIn`, `signOut`, `verifyOtp`, `resendOtp` 메서드

### T-006: SignUpUseCase 테스트 작성
- **파일**: `src/auth/application/__tests__/SignUpUseCase.test.ts`
- **FR**: FR-05~09, C-06
- **의존성**: T-005
- **설명**: SignUpUseCase를 mock AuthRepository로 테스트한다.
  - 이메일 검증 실패 시 validation error 반환
  - 비밀번호 검증 실패 시 validation error 반환
  - 비밀번호 불일치 시 "비밀번호가 일치하지 않습니다" 반환
  - 정상 입력 시 authRepository.signUp 호출
  - Repository 성공/실패 무관하게 동일 결과 반환 (C-06 보안)
  - 429 응답 시 "잠시 후 다시 시도해주세요" 반환

### T-007: SignUpUseCase 구현
- **파일**: `src/auth/application/SignUpUseCase.ts`
- **FR**: FR-05~09, C-06
- **의존성**: T-006, T-002, T-004
- **설명**: 회원가입 유스케이스를 구현한다.
  - 입력: `{ email, password, passwordConfirm }`
  - Email.create → Password.create → 비밀번호 일치 확인 → authRepository.signUp
  - 보안: 성공/실패 무관 동일 결과 (C-06). 429 제외

### T-008: SignInUseCase 테스트 작성 [P]
- **파일**: `src/auth/application/__tests__/SignInUseCase.test.ts`
- **FR**: FR-15~18, FR-36
- **의존성**: T-005
- **설명**: SignInUseCase를 mock AuthRepository로 테스트한다.
  - 이메일 검증 실패 시 validation error 반환
  - 비밀번호 검증 실패 시 validation error 반환
  - 정상 입력 시 authRepository.signIn 호출
  - Repository 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다" (FR-16)
  - 429 응답 시 "잠시 후 다시 시도해주세요" (FR-36)
  - 성공 시 `{ success: true }` 반환

### T-009: SignInUseCase 구현 [P]
- **파일**: `src/auth/application/SignInUseCase.ts`
- **FR**: FR-15~18, FR-36
- **의존성**: T-008, T-002, T-004
- **설명**: 로그인 유스케이스를 구현한다.
  - 입력: `{ email, password }`
  - Email.create → Password.create → authRepository.signIn
  - 실패 매핑: 429 → 레이트 리밋 메시지, 기타 → 일반 실패 메시지

### T-010: SignOutUseCase 테스트 작성 [P]
- **파일**: `src/auth/application/__tests__/SignOutUseCase.test.ts`
- **FR**: FR-26
- **의존성**: T-005
- **설명**: SignOutUseCase를 mock AuthRepository로 테스트한다.
  - authRepository.signOut 호출 확인
  - 성공 시 `{ success: true }` 반환
  - 실패 시 `{ success: false, error }` 반환

### T-011: SignOutUseCase 구현 [P]
- **파일**: `src/auth/application/SignOutUseCase.ts`
- **FR**: FR-26
- **의존성**: T-010
- **설명**: 로그아웃 유스케이스를 구현한다.
  - authRepository.signOut() 호출

### T-012a: VerifyCodeUseCase 테스트 작성 [P]
- **파일**: `src/auth/application/__tests__/VerifyCodeUseCase.test.ts`
- **FR**: FR-37~41
- **의존성**: T-005
- **설명**: VerifyCodeUseCase를 mock AuthRepository로 테스트한다.
  - 빈 코드 → validation error 반환
  - 6자리가 아닌 코드 → validation error 반환
  - 정상 코드 + verifyOtp 성공 → `{ success: true }` 반환
  - verifyOtp 실패 → "인증 코드가 올바르지 않습니다" 반환
  - 429 응답 시 "잠시 후 다시 시도해주세요" 반환

### T-012b: VerifyCodeUseCase 구현 [P]
- **파일**: `src/auth/application/VerifyCodeUseCase.ts`
- **FR**: FR-37~41
- **의존성**: T-012a
- **설명**: 인증 코드 검증 유스케이스를 구현한다.
  - 입력: `{ email, code }`
  - 코드 형식 검증 (6자리 숫자)
  - authRepository.verifyOtp(email, code) 호출
  - 실패 시 "인증 코드가 올바르지 않습니다"

### 🔖 Checkpoint 2: 애플리케이션 테스트 통과
```bash
npx jest src/auth --passWithNoTests
```
- 도메인 + 애플리케이션 테스트 전체 통과

---

## Phase 3: 인프라스트럭처 계층 (Supabase Auth Adapter)
> **US 매핑**: US-001, US-002, US-003, US-004
> **의존성**: Phase 2

### T-012: sanitizeRedirectTo 유틸 테스트 작성
- **파일**: `src/auth/infrastructure/__tests__/sanitizeRedirectTo.test.ts`
- **FR**: FR-18, C-02
- **설명**: redirectTo 검증 함수를 테스트한다.
  - `null` → `"/"`
  - `""` → `"/"`
  - `"/dashboard"` → `"/dashboard"`
  - `"https://evil.com"` → `"/"`
  - `"http://evil.com"` → `"/"`
  - `"//evil.com"` → `"/"`
  - `"\\evil.com"` → `"/"`
  - `"javascript:alert(1)"` → `"/"`
  - `"/login?foo=bar"` → `"/login?foo=bar"` (쿼리스트링 보존)

### T-013: sanitizeRedirectTo 유틸 구현
- **파일**: `src/auth/infrastructure/sanitizeRedirectTo.ts`
- **FR**: FR-18, C-02
- **의존성**: T-012
- **설명**: redirectTo 파라미터를 검증하는 함수를 구현한다.
  - `/`로 시작하며 `//`로 시작하지 않는 경로만 허용
  - 유효하지 않으면 기본값 `"/"` 반환

### T-014: SupabaseAuthRepository 구현
- **파일**: `src/auth/infrastructure/SupabaseAuthRepository.ts`
- **FR**: —, FR-37~44
- **의존성**: T-005
- **설명**: AuthRepository 인터페이스를 Supabase Auth SDK로 구현한다.
  - 생성자: Supabase Client를 주입받음
  - `signUp`: `supabase.auth.signUp({ email, password })` 호출
  - `signIn`: `supabase.auth.signInWithPassword({ email, password })` 호출
  - `signOut`: `supabase.auth.signOut()` 호출
  - `verifyOtp`: `supabase.auth.verifyOtp({ email, token, type: 'signup' })` 호출
  - `resendOtp`: `supabase.auth.resend({ type: 'signup', email })` 호출
  - 에러 발생 시 `{ success: false, error, statusCode }` 반환

### T-015: signup Server Action 구현
- **파일**: `src/app/signup/actions.ts`
- **FR**: FR-01~11, C-06
- **의존성**: T-007, T-014
- **설명**: `'use server'` 디렉티브 Server Action.
  - formData에서 email, password, passwordConfirm 추출
  - SupabaseAuthRepository + SignUpUseCase 조합
  - 검증 실패 → 에러 메시지 반환 (redirect 하지 않음)
  - 성공 → `/signup/verify-code?email={email}`로 redirect (C-12)
  - 보안: 성공/실패 무관 동일 처리 (C-06)

### T-016: login Server Action 구현 [P]
- **파일**: `src/app/login/actions.ts`
- **FR**: FR-12~20, FR-36
- **의존성**: T-009, T-013, T-014
- **설명**: `'use server'` 디렉티브 Server Action.
  - formData에서 email, password 추출
  - SupabaseAuthRepository + SignInUseCase 조합
  - redirectTo 파라미터를 sanitizeRedirectTo로 검증
  - 검증 실패 → 에러 메시지 반환
  - 로그인 실패 → 일반 에러 메시지 반환
  - 429 → "잠시 후 다시 시도해주세요"
  - 성공 → `revalidatePath('/', 'layout')` + redirect(redirectTo)

### T-017: logout Server Action 구현 [P]
- **파일**: `src/app/logout/actions.ts`
- **FR**: FR-26
- **의존성**: T-011, T-014
- **설명**: `'use server'` 디렉티브 Server Action.
  - SupabaseAuthRepository + SignOutUseCase 조합
  - 성공 → `revalidatePath('/', 'layout')` + redirect('/')

### T-017a: verify-code Server Action 구현 [P]
- **파일**: `src/app/signup/verify-code/actions.ts`
- **FR**: FR-37~44
- **의존성**: T-012b, T-014
- **설명**: `'use server'` 디렉티브 Server Action.
  - `verifyCode(formData)`: email + code 추출 → VerifyCodeUseCase 실행
    - 성공 → `revalidatePath('/', 'layout')` + redirect('/')
    - 실패 → 에러 메시지 반환
  - `resendCode(formData)`: email 추출 → authRepository.resendOtp 호출
    - 성공 → "인증 코드를 재발송했습니다" 반환
    - 429 → "잠시 후 다시 시도해주세요" 반환

### 🔖 Checkpoint 3: 인프라 테스트 + 빌드
```bash
npx jest src/auth --passWithNoTests
```
- sanitizeRedirectTo 테스트 통과
- 도메인 + 애플리케이션 테스트 유지

---

## Phase 4: 회원가입 UI (`/signup`)
> **US 매핑**: US-001
> **의존성**: Phase 3 (actions.ts)
> **병렬**: Phase 5, 6과 동시 실행 가능 [P]

### T-018: AuthLayout 공유 레이아웃 구현
- **파일**: `src/features/auth/AuthLayout.tsx`
- **FR**: NFR-04, NFR-05
- **설명**: 로그인/회원가입 페이지의 공유 레이아웃.
  - 전체 화면 중앙 정렬
  - 로고 아이콘 + "AI 스킬 허브" 제목
  - 카드 컨테이너 (모바일: 풀 너비, 데스크탑: max-w-md)
  - 다크 모드 지원
  - children prop으로 폼 영역 전달

### T-019: SignupForm 컴포넌트 테스트 작성
- **파일**: `src/features/auth/__tests__/SignupForm.test.tsx`
- **FR**: FR-01~11, FR-34~35
- **설명**: 회원가입 폼의 렌더링과 검증 로직을 테스트한다.
  - 이메일, 비밀번호, 비밀번호 확인 필드 렌더링
  - "회원가입" 버튼 렌더링
  - "이미 계정이 있으신가요? 로그인" 링크 → href="/login"
  - onBlur: 이메일 필드 이탈 시 형식 검증 에러 표시
  - onBlur: 비밀번호 필드 이탈 시 규칙 검증 에러 표시
  - onBlur: 비밀번호 확인 불일치 에러 표시
  - onChange: 에러 있는 필드 수정 시 에러 해제
  - onSubmit: 빈 폼 제출 시 모든 에러 표시 + 첫 에러 필드 포커스
  - 제출 중 버튼 disabled 상태

### T-020: SignupForm 컴포넌트 구현
- **파일**: `src/features/auth/SignupForm.tsx`
- **FR**: FR-01~11, FR-34~35
- **의존성**: T-018, T-019
- **설명**: `'use client'` Client Component.
  - `useActionState` (또는 자체 상태 관리)로 Server Action 연동
  - Email, Password VO를 import하여 클라이언트 검증
  - onBlur → 해당 필드 검증
  - onChange → 에러 필드만 재검증하여 해제
  - onSubmit → 전체 검증 + Server Action 호출
  - isSubmitting 상태로 버튼 disabled + 로딩 표시
  - 서버 에러 메시지 표시 영역

### T-021: Signup 페이지 구현
- **파일**: `src/app/signup/page.tsx`
- **FR**: FR-01~11
- **의존성**: T-018, T-020
- **설명**: `/signup` 라우트 페이지.
  - AuthLayout 안에 SignupForm 렌더링
  - Server Action import (`signup/actions.ts`)

### T-022: VerifyCodeForm 테스트 작성
- **파일**: `src/features/auth/__tests__/VerifyCodeForm.test.tsx`
- **FR**: FR-37~44
- **의존성**: —
- **설명**: 인증 코드 입력 폼의 렌더링과 동작을 테스트한다.
  - 이메일 주소가 화면에 표시된다
  - 6자리 코드 입력 필드가 존재한다
  - "인증하기" 버튼이 존재한다
  - 빈 코드 제출 시 에러 표시
  - "인증 코드 재발송" 버튼 클릭 시 재발송 호출
  - 재발송 성공 시 안내 메시지 표시
  - 제출 중 버튼 disabled 상태

### T-022a: VerifyCodeForm 구현
- **파일**: `src/features/auth/VerifyCodeForm.tsx`
- **FR**: FR-37~44
- **의존성**: T-022
- **설명**: `'use client'` Client Component.
  - props: `{ email }` (URL 쿼리 파라미터에서 전달)
  - 6자리 인증 코드 입력 필드
  - "인증하기" 버튼 → verify-code Server Action 호출
  - "인증 코드 재발송" 버튼 → resendCode Server Action 호출
  - 서버 에러/성공 메시지 표시
  - isSubmitting 상태 관리

### T-022b: VerifyCode 페이지 구현
- **파일**: `src/app/signup/verify-code/page.tsx`
- **FR**: FR-37~44, C-12
- **의존성**: T-018, T-022a
- **설명**: `/signup/verify-code` 라우트 페이지.
  - AuthLayout 안에 VerifyCodeForm 렌더링
  - searchParams에서 `email` 추출하여 VerifyCodeForm에 전달
  - email이 없으면 `/signup`으로 리다이렉트

### 🔖 Checkpoint 4: 회원가입 UI 테스트 + 빌드
```bash
npx jest src/features/auth --passWithNoTests && npx next build
```
- SignupForm 테스트 통과
- 빌드 성공 (TypeScript 에러 없음)

---

## Phase 5: 로그인 UI (`/login`)
> **US 매핑**: US-002
> **의존성**: Phase 3 (actions.ts)
> **병렬**: Phase 4, 6과 동시 실행 가능 [P]

### T-023: LoginForm 컴포넌트 테스트 작성
- **파일**: `src/features/auth/__tests__/LoginForm.test.tsx`
- **FR**: FR-12~20, FR-34~36
- **설명**: 로그인 폼의 렌더링과 검증 로직을 테스트한다.
  - 이메일, 비밀번호 필드 렌더링
  - "로그인" 버튼 렌더링
  - "계정이 없으신가요? 회원가입" 링크 → href="/signup"
  - onBlur: 이메일 형식 검증 에러 표시
  - onBlur: 비밀번호 규칙 검증 에러 표시
  - onChange: 에러 있는 필드 수정 시 에러 해제
  - onSubmit: 빈 폼 제출 시 모든 에러 표시 + 첫 에러 필드 포커스
  - 제출 중 버튼 disabled 상태
  - 서버 에러 메시지 표시 (일반 로그인 실패, 429 레이트 리밋)

### T-024: LoginForm 컴포넌트 구현
- **파일**: `src/features/auth/LoginForm.tsx`
- **FR**: FR-12~20, FR-34~36
- **의존성**: T-023
- **설명**: `'use client'` Client Component.
  - Email, Password VO를 import하여 클라이언트 검증
  - onBlur/onChange/onSubmit 3단계 검증 (C-10)
  - Server Action 결과로 서버 에러 표시
  - isSubmitting 상태 관리
  - 429 에러 시 "잠시 후 다시 시도해주세요" 표시 (FR-36)

### T-025: Login 페이지 구현
- **파일**: `src/app/login/page.tsx`
- **FR**: FR-12~20
- **의존성**: T-018, T-024
- **설명**: `/login` 라우트 페이지.
  - AuthLayout 안에 LoginForm 렌더링
  - searchParams에서 `redirectTo` 추출하여 LoginForm에 전달
  - Server Action import (`login/actions.ts`)

### 🔖 Checkpoint 5: 로그인 UI 테스트 + 빌드
```bash
npx jest src/features/auth --passWithNoTests && npx next build
```
- LoginForm 테스트 통과
- 빌드 성공

---

## Phase 6: 로그아웃 UI (ProfileDropdown)
> **US 매핑**: US-003
> **의존성**: Phase 3 (logout actions.ts)
> **병렬**: Phase 4, 5와 동시 실행 가능 [P]

### T-026: ProfileDropdown 컴포넌트 테스트 작성
- **파일**: `src/shared/ui/__tests__/ProfileDropdown.test.tsx`
- **FR**: FR-21~27
- **설명**: ProfileDropdown의 동작을 테스트한다.
  - 프로필 아바타가 렌더링된다
  - 아바타 클릭 시 드롭다운 메뉴가 표시된다
  - 드롭다운에 사용자 이메일이 표시된다
  - 드롭다운에 "로그아웃" 버튼이 표시된다
  - "로그아웃" 클릭 시 확인 다이얼로그가 표시된다
  - 확인 다이얼로그에 "정말 로그아웃하시겠습니까?" 텍스트
  - "취소" 클릭 시 다이얼로그 닫힘
  - 드롭다운 외부 클릭 시 메뉴 닫힘
  - avatarUrl이 있으면 이미지 표시, 없으면 이니셜 표시

### T-027: LogoutConfirmDialog 구현
- **파일**: `src/shared/ui/LogoutConfirmDialog.tsx`
- **FR**: FR-24~26
- **의존성**: —
- **설명**: 로그아웃 확인 다이얼로그 컴포넌트.
  - `'use client'` Client Component
  - props: `{ isOpen, onConfirm, onCancel }`
  - 오버레이 + 중앙 카드
  - "정말 로그아웃하시겠습니까?" 텍스트
  - [취소] 버튼 → onCancel
  - [로그아웃] 버튼 → onConfirm
  - ESC 키 → onCancel
  - 오버레이 클릭 → onCancel

### T-028: ProfileDropdown 구현
- **파일**: `src/shared/ui/ProfileDropdown.tsx`
- **FR**: FR-21~27
- **의존성**: T-026, T-027
- **설명**: `'use client'` Client Component.
  - props: `{ email, avatarUrl? }`
  - 아바타 버튼 (트리거) — 이미지 또는 이니셜
  - useState로 드롭다운 open/close 관리
  - useState로 다이얼로그 open/close 관리
  - useRef + useEffect로 외부 클릭 감지 (mousedown)
  - "로그아웃" 클릭 → 다이얼로그 오픈
  - 다이얼로그 확인 → logout Server Action 호출 + router.push('/')
  - 다이얼로그 취소 → 다이얼로그 닫기

### T-029: Header 리팩토링 (ProfileDropdown 합성)
- **파일**: `src/shared/ui/Header.tsx` (수정)
- **FR**: C-05
- **의존성**: T-028
- **설명**: 기존 Header에서 프로필 아바타 영역을 ProfileDropdown으로 교체한다.
  - 기존 아바타 `<div>` 제거
  - `<ProfileDropdown email={user.email} avatarUrl={user.avatarUrl} />` 삽입
  - Header는 Server Component로 유지
  - 기존 Header 테스트가 깨지지 않도록 주의

### T-030: Header 기존 테스트 업데이트
- **파일**: `src/shared/ui/__tests__/Header.test.tsx` (수정)
- **FR**: C-05
- **의존성**: T-029
- **설명**: Header 리팩토링에 맞춰 기존 테스트를 조정한다.
  - ProfileDropdown mock 처리 (Client Component)
  - 기존 브레드크럼, 네비게이션, 알림 테스트 유지
  - 프로필 아바타 관련 테스트는 ProfileDropdown 테스트로 이동 확인

### 🔖 Checkpoint 6: 로그아웃 UI 테스트 + 빌드
```bash
npx jest src/shared/ui --passWithNoTests && npx next build
```
- ProfileDropdown 테스트 통과
- Header 기존 테스트 통과
- 빌드 성공

---

## Phase 7: 접근 제어 (Middleware + Auth Callback)
> **US 매핑**: US-004
> **의존성**: Phase 3

### T-031: middleware.ts 접근 제어 확장
- **파일**: `src/middleware.ts` (수정)
- **FR**: FR-28, FR-29, C-04, C-09
- **설명**: 기존 세션 갱신 미들웨어에 접근 제어 로직을 추가한다.
  - 공개 경로 화이트리스트: `["/", "/login", "/signup", "/signup/verify-code"]`
  - `getUser()` 결과로 인증 상태 확인
  - 비로그인 + 보호 경로 → `/login?redirectTo={pathname}` 리다이렉트
  - 로그인 + 인증 경로(`/login`, `/signup`) → `/` 리다이렉트
  - 세션 만료 = 비로그인과 동일 처리 (C-09)
  - `/`는 리다이렉트 없이 통과 (조건부 렌더링은 page.tsx에서 처리)

### 🔖 Checkpoint 7: 빌드 + 전체 유닛 테스트
```bash
npx jest --passWithNoTests && npx next build
```
- 전체 유닛/통합 테스트 통과
- 빌드 성공 (TypeScript 에러 없음)
- 미들웨어 무한 리다이렉트 없음 확인

---

## Phase 8: 통합 검증 및 E2E
> **US 매핑**: US-001~004 전체
> **의존성**: Phase 4~7 전체 완료

### T-033: 회원가입 E2E 테스트 작성
- **파일**: `src/__tests__/e2e/signup.spec.ts`
- **US**: US-001
- **설명**: 회원가입 전체 플로우를 E2E로 테스트한다.
  - `/signup` 접속 시 폼 표시
  - `@eluocnc.com` 외 도메인 이메일 입력 시 인라인 에러 표시
  - 유효하지 않은 입력 시 인라인 에러 표시 (onBlur)
  - 유효한 입력으로 제출 시 `/signup/verify-code`로 리다이렉트
  - 인증 코드 입력 페이지에서 이메일 표시
  - "로그인" 링크 클릭 시 `/login`으로 이동

### T-034: 로그인 E2E 테스트 작성 [P]
- **파일**: `src/__tests__/e2e/login.spec.ts`
- **US**: US-002
- **설명**: 로그인 전체 플로우를 E2E로 테스트한다.
  - `/login` 접속 시 폼 표시
  - 유효하지 않은 입력 시 인라인 에러 표시
  - 잘못된 자격 증명 시 일반 오류 메시지 표시
  - 올바른 자격 증명 시 대시보드로 리다이렉트
  - "회원가입" 링크 클릭 시 `/signup`으로 이동

### T-035: 로그아웃 E2E 테스트 작성 [P]
- **파일**: `src/__tests__/e2e/logout.spec.ts`
- **US**: US-003
- **설명**: 로그아웃 전체 플로우를 E2E로 테스트한다.
  - 로그인 상태에서 프로필 아바타 클릭 → 드롭다운 표시
  - 드롭다운에 이메일 표시
  - "로그아웃" 클릭 → 확인 다이얼로그 표시
  - "취소" 클릭 → 다이얼로그 닫힘, 여전히 로그인 상태
  - "로그아웃" 확인 → 랜딩 페이지로 리다이렉트

### T-036: 접근 제어 E2E 테스트 작성 [P]
- **파일**: `src/__tests__/e2e/access-control.spec.ts`
- **US**: US-004
- **설명**: 접근 제어 플로우를 E2E로 테스트한다.
  - 비로그인 사용자 `/` 접근 → 랜딩 페이지 표시 (리다이렉트 없음)
  - 비로그인 사용자 보호 페이지 접근 → `/login?redirectTo=...` 리다이렉트
  - 로그인 후 `redirectTo` 경로로 이동 확인
  - 로그인 사용자 `/login` 접근 → `/` 리다이렉트
  - 로그인 사용자 `/signup` 접근 → `/` 리다이렉트

### T-037: 전체 빌드 검증
- **파일**: —
- **의존성**: T-033~036
- **설명**: 최종 빌드 및 테스트 스위트 실행.
  ```bash
  npx next build && npx jest --passWithNoTests
  ```
  - TypeScript 에러 없음
  - 전체 유닛/통합 테스트 통과
  - 빌드 성공

### T-038: tasks.md 수용 기준 체크
- **파일**: `.sdd/specs/002-auth/tasks.md` (본 파일)
- **의존성**: T-037
- **설명**: spec.md 수용 기준 체크리스트 대비 최종 점검.
  - 회원가입 체크리스트 (9항목)
  - 로그인 체크리스트 (7항목)
  - 로그아웃 체크리스트 (6항목)
  - 접근 제어 체크리스트 (5항목)
  - 공통 체크리스트 (4항목)

### 🔖 Checkpoint 8 (Final): 전체 통과
```bash
npx next build && npx jest --passWithNoTests
```
- 전체 빌드 성공
- 전체 테스트 통과
- 수용 기준 100% 달성

---

## 의존성 요약

```
T-001 ──→ T-002 ──┐
T-003 ──→ T-004 ──┤
                   ├──→ T-005 ──→ T-006 ──→ T-007 ──┐
                   │          ├──→ T-008 ──→ T-009 ──┤
                   │          └──→ T-010 ──→ T-011 ──┤
                   │                                  │
                   │    T-012 ──→ T-013 ──────────────┤
                   │                                  │
                   └──→ T-014 ───────────────────────┤
                                                     │
                   ┌─────────────────────────────────┘
                   │
                   ├──→ T-015 ──┐
                   ├──→ T-016 ──┤
                   ├──→ T-017 ──┤
                   │            │
                   │  ┌─────────┤ (Phase 4, 5, 6 병렬 가능)
                   │  │         │
                   │  │  T-018 ─┤──→ T-019 ──→ T-020 ──→ T-021
                   │  │         │                         T-022
                   │  │         │
                   │  │         ├──→ T-023 ──→ T-024 ──→ T-025
                   │  │         │
                   │  │         ├──→ T-026 ──→ T-027 ──→ T-028 ──→ T-029 ──→ T-030
                   │  │         │
                   │  └─────────┤
                   │            │
                   │            ├──→ T-031  (Middleware)
                   │            ├──→ T-032  (Auth Callback)
                   │            │
                   │            └──→ T-033~036 (E2E) ──→ T-037 ──→ T-038
                   │
```

### 병렬 실행 가능 태스크 [P]
| 그룹 | 태스크 | 조건 |
|------|--------|------|
| Phase 1 | T-001+T-002, T-003+T-004 | Email/Password 독립 |
| Phase 2 | T-006~T-007, T-008~T-009, T-010~T-011 | UseCase 간 독립 (T-005 이후) |
| Phase 3 | T-012~T-013, T-015, T-016, T-017 | 인프라 간 독립 |
| Phase 4~6 | 전체 Phase 4, Phase 5, Phase 6 | 서로 독립 |
| Phase 8 | T-033, T-034, T-035, T-036 | E2E 간 독립 |
