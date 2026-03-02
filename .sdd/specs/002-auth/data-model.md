# 데이터 모델: 002-auth

> **작성일**: 2026-03-02
> **바운디드 컨텍스트**: auth

---

## 1. 도메인 모델 개요

Auth 컨텍스트는 도메인 계층을 최소화한다 (C-03).
인증 로직 자체는 Supabase Auth에 위임하며, 도메인에는 입력 검증용 **값 객체(Value Object)**만 정의한다.

```
auth/
├── domain/
│   └── value-objects/
│       ├── Email.ts
│       └── Password.ts
├── application/
│   ├── SignUpUseCase.ts
│   ├── SignInUseCase.ts
│   ├── SignOutUseCase.ts
│   └── ports/
│       └── AuthRepository.ts    ← 인터페이스 (포트)
└── infrastructure/
    └── SupabaseAuthRepository.ts ← 구현체 (어댑터)
```

---

## 2. 값 객체 (Value Objects)

### Email

```typescript
class Email extends ValueObject<{ value: string }> {
  // 검증 규칙 (FR-30, C-11)
  // - 표준 이메일 형식 (RFC 5322 간소화)
  // - @eluocnc.com 도메인만 허용
  // - 빈 값 불허 (FR-33)

  static create(value: string): Email
  // - 빈 문자열 → "이메일을 입력해주세요"
  // - 형식 불일치 → "올바른 이메일 형식이 아닙니다"
  // - 도메인 불일치 → "eluocnc.com 이메일만 사용할 수 있습니다"
  // - 성공 → Email 인스턴스 반환

  get value(): string
}
```

**검증 규칙:**
- 정규식: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (기본 형식)
- 도메인 검증: `@eluocnc.com`으로 끝나야 함
- 빈 값 불허
- 에러 메시지: `"이메일을 입력해주세요"`, `"올바른 이메일 형식이 아닙니다"`, `"eluocnc.com 이메일만 사용할 수 있습니다"`

### Password

```typescript
class Password extends ValueObject<{ value: string }> {
  // 검증 규칙 (FR-31, FR-32, C-07)
  // - 최소 8자, 최대 72자 (bcrypt 호환)
  // - 영문(대소문자 무관) 1자 이상
  // - 숫자 1자 이상
  // - 특수문자 허용, 필수 아님
  // - 빈 값 불허 (FR-33)

  static create(value: string): Password
  // - 빈 문자열 → "비밀번호를 입력해주세요"
  // - 8자 미만 → "비밀번호는 8자 이상이어야 합니다"
  // - 72자 초과 → "비밀번호는 72자 이하여야 합니다"
  // - 영문 미포함 → "비밀번호에 영문을 포함해주세요"
  // - 숫자 미포함 → "비밀번호에 숫자를 포함해주세요"
  // - 성공 → Password 인스턴스 반환

  get value(): string
}
```

**검증 규칙:**
- 길이: `8 ≤ length ≤ 72`
- 영문: `/[a-zA-Z]/`
- 숫자: `/[0-9]/`
- 에러 메시지: 위 주석 참조

---

## 3. 애플리케이션 계층 (Use Cases)

### AuthRepository (포트/인터페이스)

```typescript
interface AuthResult {
  success: boolean
  error?: string       // Supabase 에러 메시지
  statusCode?: number  // HTTP 상태 코드 (429 감지용)
}

interface AuthRepository {
  signUp(email: string, password: string): Promise<AuthResult>
  signIn(email: string, password: string): Promise<AuthResult>
  signOut(): Promise<AuthResult>
}
```

### VerifyCodeUseCase (C-12 추가)

```typescript
// 인증 코드 검증 유스케이스
interface VerifyCodeResult {
  success: boolean
  error?: string
}

// AuthRepository에 메서드 추가
interface AuthRepository {
  // ... 기존 메서드
  verifyOtp(email: string, token: string): Promise<AuthResult>
  resendOtp(email: string): Promise<AuthResult>
}
```

### SignUpUseCase

```
입력: email(string), password(string), passwordConfirm(string)
처리:
  1. Email.create(email) → 유효성 검증 (@eluocnc.com 도메인 포함)
  2. Password.create(password) → 유효성 검증
  3. password === passwordConfirm 확인
  4. authRepository.signUp(email, password) 호출
출력: { success: true } 또는 { success: false, error: string }

※ 보안: 성공/실패와 관계없이 동일한 응답 반환 (C-06)
```

### SignInUseCase

```
입력: email(string), password(string)
처리:
  1. Email.create(email) → 유효성 검증
  2. Password.create(password) → 유효성 검증 (길이/형식만, 서버에서 비밀번호 매칭)
  3. authRepository.signIn(email, password) 호출
출력: { success: true, redirectTo: string } 또는 { success: false, error: string }

※ 실패 시: "이메일 또는 비밀번호가 올바르지 않습니다" (FR-16)
※ 429 시: "잠시 후 다시 시도해주세요" (FR-36)
```

### SignOutUseCase

```
입력: 없음
처리:
  1. authRepository.signOut() 호출
출력: { success: true } 또는 { success: false, error: string }
```

---

## 4. 인프라스트럭처 계층

### SupabaseAuthRepository

AuthRepository 인터페이스를 구현한다.
Supabase Auth SDK (`@supabase/ssr`)를 사용하여 실제 인증 API를 호출한다.

```
signUp    → supabase.auth.signUp({ email, password })
signIn    → supabase.auth.signInWithPassword({ email, password })
signOut   → supabase.auth.signOut()
verifyOtp → supabase.auth.verifyOtp({ email, token, type: 'signup' })
resendOtp → supabase.auth.resend({ type: 'signup', email })
```

- Server Actions에서 사용하므로 `createClient()` (서버)를 주입
- 로그아웃/OTP 검증은 클라이언트에서도 호출 가능

---

## 5. 외부 데이터 (Supabase Auth)

Supabase Auth가 관리하는 `auth.users` 테이블은 직접 조작하지 않는다.
Auth SDK를 통해서만 접근한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | 사용자 고유 ID |
| email | string | 사용자 이메일 |
| encrypted_password | string | bcrypt 해시 (Supabase 관리) |
| email_confirmed_at | timestamp | 이메일 확인 일시 |
| created_at | timestamp | 생성 일시 |
| user_metadata | jsonb | 추가 메타데이터 (avatar_url 등) |

---

## 6. 라우트 구조

| 경로 | 유형 | 접근 제어 |
|------|------|-----------|
| `/login` | 페이지 | 공개 (로그인 시 → `/` 리다이렉트) |
| `/signup` | 페이지 | 공개 (로그인 시 → `/` 리다이렉트) |
| `/signup/verify-code` | 페이지 | 공개 (인증 코드 입력) |
| `/` | 페이지 | 공개 (조건부 렌더링: 랜딩/대시보드) |
| 기타 모든 경로 | 페이지 | 보호 (비로그인 → `/login` 리다이렉트) |
