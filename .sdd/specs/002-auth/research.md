# 기술 리서치: 002-auth

> **작성일**: 2026-03-02
> **목적**: Supabase Auth + Next.js App Router 기반 인증 구현을 위한 기술 조사

---

## 1. Supabase Auth + Next.js Server Actions 패턴

### 공식 권장 패턴 (Supabase Docs)

**Server Actions (`actions.ts`)를 통한 인증 처리:**
```typescript
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/infrastructure/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) { redirect('/error') }
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) { redirect('/error') }
  revalidatePath('/', 'layout')
  redirect('/signup/verify-email')
}
```

### 핵심 포인트
- `createServerClient`(`@supabase/ssr`)를 사용하여 서버 사이드에서 쿠키 기반 세션 관리
- `signUp`은 이메일 확인이 활성화되어 있으면 확인 메일 발송 후 세션 없이 반환
- `signInWithPassword`는 이메일 확인이 완료된 사용자만 성공
- `signOut`은 세션 쿠키 삭제

---

## 2. 이메일 인증 코드(OTP) 플로우 (C-12)

### OTP 방식 인증 플로우

Supabase Auth는 이메일 OTP를 지원한다. 회원가입 시 6자리 인증 코드를 이메일로 발송하고,
사용자가 코드를 입력하면 `verifyOtp` API로 검증한다.

```
1. signUp({ email, password }) → Supabase가 6자리 코드 이메일 발송
2. 사용자가 /signup/verify-code 페이지에서 코드 입력
3. verifyOtp({ email, token: code, type: 'signup' }) → 세션 생성
4. 성공 → 대시보드로 리다이렉트
```

### 관련 Supabase API

```typescript
// 인증 코드 검증
const { error } = await supabase.auth.verifyOtp({
  email,
  token: code,    // 6자리 코드
  type: 'signup',
})

// 인증 코드 재발송
const { error } = await supabase.auth.resend({
  type: 'signup',
  email,
})
```

### Supabase 대시보드 설정 필요
- **Auth > Email Templates > Confirm signup** 에서 OTP 코드가 포함된 이메일 템플릿 설정
- 템플릿에 `{{ .Token }}` 변수를 사용하여 6자리 코드 표시
- `auth/confirm` Route Handler는 불필요 (OTP는 클라이언트에서 직접 검증)

---

## 3. Middleware 기반 접근 제어

### 현재 middleware.ts 상태
- 세션 갱신만 수행 중 (`supabase.auth.getUser()`)
- 접근 제어 로직 미구현

### 추가해야 할 로직
```
1. 세션 갱신 (기존)
2. 사용자 인증 상태 확인
3. 공개 경로 화이트리스트 체크
4. 비로그인 + 비공개 경로 → /login?redirectTo= 리다이렉트
5. 로그인 + 인증 페이지(/login, /signup) → / 리다이렉트
```

### 공개 경로 화이트리스트
```
/, /login, /signup, /signup/verify-email, /auth/confirm
```

---

## 4. 클라이언트 사이드 로그아웃

### Supabase signOut
```typescript
import { createClient } from '@/shared/infrastructure/supabase/client'

const supabase = createClient()
await supabase.auth.signOut()
```

- 브라우저 쿠키에서 세션을 삭제
- 이후 `router.push('/')` 또는 `router.refresh()`로 리다이렉트
- Server Action으로도 구현 가능하지만, 클라이언트에서 호출하는 것이 일반적

---

## 5. DDD 적용 시 고려사항

### Auth 바운디드 컨텍스트의 특수성
- 인증 자체는 Supabase에 위임하므로 풍부한 도메인 모델이 불필요
- **Email, Password 값 객체**만 도메인에 정의하여 검증 규칙 캡슐화
- 유스케이스는 Supabase Auth 호출을 조합하는 thin layer

### 결정 사항
| 계층 | 역할 | 파일 |
|------|------|------|
| domain | Email/Password 값 객체 (검증 규칙) | `src/auth/domain/value-objects/` |
| application | SignUp/SignIn/SignOut 유스케이스 | `src/auth/application/` |
| infrastructure | SupabaseAuthRepository | `src/auth/infrastructure/` |

---

## 6. redirectTo 보안

### 오픈 리다이렉트 방지
- `redirectTo` 값은 `/`로 시작하는 상대 경로만 허용
- `http://`, `https://`, `//`, `\` 등 절대 URL 차단
- 유효하지 않은 값은 기본값 `/`로 대체

### 검증 함수
```typescript
function sanitizeRedirectTo(redirectTo: string | null): string {
  if (!redirectTo) return '/'
  if (!redirectTo.startsWith('/')) return '/'
  if (redirectTo.startsWith('//')) return '/'
  return redirectTo
}
```

---

## 7. 에러 응답 처리

### Supabase Auth 에러 코드
| 시나리오 | HTTP 코드 | error.message |
|---------|-----------|---------------|
| 잘못된 이메일/비밀번호 | 400 | "Invalid login credentials" |
| 이미 가입된 이메일 (확인 활성) | 200 | 정상 응답 (보안상 동일 처리) |
| 레이트 리미팅 | 429 | "Rate limit exceeded" |
| 이메일 미확인 | 400 | "Email not confirmed" |

### 보안 매핑
- 로그인 실패 → "이메일 또는 비밀번호가 올바르지 않습니다" (일반 메시지)
- 회원가입 → 항상 "이메일 확인 메일을 발송했습니다" (이메일 존재 여부 미노출)
- 429 → "잠시 후 다시 시도해주세요"
