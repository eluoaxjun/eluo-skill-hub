# Research & Design Decisions

---
**Purpose**: auth-login-signup 기능의 디스커버리 단계에서 수행한 조사 결과와 설계 결정 근거를 기록한다.

**Usage**:
- 디스커버리 단계의 조사 활동과 결과를 기록한다.
- `design.md`에 포함하기에는 상세한 설계 결정 트레이드오프를 문서화한다.
- 향후 감사 또는 재사용을 위한 참조와 근거를 제공한다.
---

## Summary
- **Feature**: `auth-login-signup`
- **Discovery Scope**: New Feature (Supabase Auth 통합, 보안 민감 기능)
- **Key Findings**:
  - `@supabase/ssr` 패키지가 Next.js App Router의 SSR 인증에 필수이며, 기존 `@supabase/supabase-js` 직접 사용 방식에서 마이그레이션이 필요하다
  - Supabase Auth의 `signInWithPassword` 에러 응답이 보안상 계정 미존재와 패스워드 불일치를 구분하지 않으므로, 요구사항 1.8(미가입 이메일 안내)은 추가 조회 로직이 필요하다
  - Next.js Server Components는 쿠키를 직접 작성할 수 없어 미들웨어를 통한 토큰 갱신이 필수이다

## Research Log

### Supabase Auth SSR 아키텍처 (Next.js App Router)
- **Context**: Next.js 16 App Router 환경에서 Supabase Auth를 서버 사이드에서 안전하게 사용하는 방법 조사
- **Sources Consulted**:
  - [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
  - [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
  - [Migrating to SSR from Auth Helpers](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)
- **Findings**:
  - `@supabase/ssr` 패키지는 `createBrowserClient`(클라이언트 컴포넌트용)와 `createServerClient`(서버 컴포넌트/서버 액션/라우트 핸들러용) 두 함수를 제공한다
  - `createServerClient`는 `cookies().getAll()`과 `cookies().setAll()` 핸들러를 설정하여 쿠키 기반 세션 관리를 수행한다
  - 미들웨어에서 `supabase.auth.getUser()`를 호출하여 만료된 Auth 토큰을 갱신하고, `request.cookies.set`과 `response.cookies.set`을 통해 갱신된 토큰을 전달한다
  - 서버 코드에서 `supabase.auth.getSession()`은 JWT를 재검증하지 않으므로 신뢰하면 안 되고, `supabase.auth.getUser()`를 사용해야 한다
- **Implications**:
  - 기존 `src/shared/infrastructure/supabase/client.ts`의 `createClient` 직접 호출 방식을 SSR 호환 방식으로 리팩터링해야 한다
  - 브라우저 클라이언트와 서버 클라이언트를 분리하여 제공해야 한다
  - 루트 레벨에 `middleware.ts`를 추가하여 세션 갱신 프록시를 구성해야 한다

### Supabase signInWithPassword API 분석
- **Context**: 로그인 API의 에러 응답 형태와 이메일 미인증 사용자 처리 방식 조사
- **Sources Consulted**:
  - [JavaScript API Reference - signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
  - [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- **Findings**:
  - `signInWithPassword({ email, password })` 호출 시, 에러 응답이 계정 미존재와 잘못된 패스워드를 보안상 구분하지 않는다
  - 이메일 인증 미완료 사용자의 경우, Supabase 설정에 따라 로그인이 차단되며 `email_not_confirmed` 에러 코드가 반환된다
  - 반환 타입: `{ data: { user, session }, error: AuthError | null }`
- **Implications**:
  - 요구사항 1.7(잘못된 자격증명)과 1.8(미가입 이메일)을 Supabase 에러만으로 완전히 구분하기 어렵다. 통합 에러 메시지 패턴을 사용하되, `email_not_confirmed` 에러만 별도 처리한다
  - 요구사항 1.8의 "미가입 이메일 안내"는 보안 모범 사례와 충돌할 수 있어, 동일한 일반 에러 메시지 + 회원가입 링크 제공 방식으로 구현한다

### Supabase signUp 및 이메일 인증 흐름
- **Context**: 회원가입 후 이메일 인증 프로세스와 OTP 확인 방식 조사
- **Sources Consulted**:
  - [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
  - [Verify OTP](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- **Findings**:
  - `signUp({ email, password })` 호출 시 이메일 인증이 활성화되어 있으면(기본값) 인증 메일이 자동 발송된다
  - 인증 메일의 확인 URL은 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` 형태로 구성한다
  - `/auth/confirm` 라우트 핸들러에서 `token_hash`와 `type`을 사용하여 `supabase.auth.verifyOtp()`로 토큰을 교환한다
  - 이미 등록된 이메일로 `signUp`을 호출하면 Supabase가 중복 가입을 방지하며, 기존 사용자 데이터를 반환하되 세션은 생성하지 않는다 (가짜 사용자 객체 반환)
- **Implications**:
  - `/auth/confirm` 라우트 핸들러를 추가하여 이메일 인증 콜백을 처리해야 한다
  - 중복 이메일 감지는 반환된 사용자 객체의 `identities` 배열이 비어 있는지로 판별한다

### 기존 프로젝트 구조 분석
- **Context**: 현재 프로젝트의 DDD 구조, 사용 가능한 UI 컴포넌트, 기존 Supabase 클라이언트 패턴 조사
- **Sources Consulted**: 프로젝트 코드베이스 직접 분석
- **Findings**:
  - DDD 3계층 구조가 `src/shared/` 모듈에 이미 적용되어 있다 (Entity, ValueObject, DomainEvent 기반 클래스)
  - UI 컴포넌트: `react-hook-form` + `zod` 기반 폼 시스템, shadcn/ui 스타일 컴포넌트(Button, Input, Label, Card, Form 등)가 준비되어 있다
  - 기존 Supabase 클라이언트(`src/shared/infrastructure/supabase/client.ts`)는 `@supabase/supabase-js`의 `createClient`를 직접 사용하며 SSR 미지원이다
  - `middleware.ts`가 존재하지 않아 신규 생성이 필요하다
  - `@hookform/resolvers`(v5.2.2)와 `zod`(v4.3.6)가 이미 설치되어 있다
- **Implications**:
  - `user-account` 바운디드 컨텍스트를 신규 생성하여 인증 도메인 로직을 배치한다
  - 기존 `shared/infrastructure/supabase/client.ts`를 SSR 호환으로 리팩터링하고 서버 클라이언트를 추가한다
  - 기존 shadcn/ui 컴포넌트와 react-hook-form + zod 패턴을 재활용한다

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Server Action 기반 인증 | Next.js Server Action에서 Supabase Auth API를 호출하고 결과를 클라이언트에 반환 | 서버 사이드 보안, 쿠키 자동 관리, CSRF 보호 내장 | Server Action 내 에러 핸들링 패턴 필요 | 공식 Supabase 권장 패턴과 일치 |
| API Route 기반 인증 | `/api/auth/*` 라우트 핸들러에서 인증 처리 | REST API 인터페이스 명확, 외부 클라이언트 대응 가능 | 불필요한 API 계층 추가, CSRF 토큰 별도 관리 필요 | 현재 요구사항에 과도한 구조 |
| 클라이언트 직접 호출 | 브라우저에서 Supabase Auth를 직접 호출 | 구현 단순 | 서버 사이드 보호 라우트 구현 복잡, 세션 동기화 문제 | SSR 환경에서 권장하지 않음 |

## Design Decisions

### Decision: Server Action 기반 인증 처리
- **Context**: 로그인/회원가입 폼 제출 시 Supabase Auth API 호출 위치 결정
- **Alternatives Considered**:
  1. Server Action - 폼 제출을 서버에서 처리
  2. API Route Handler - REST 엔드포인트 구성
  3. 클라이언트 직접 호출 - 브라우저에서 Supabase 직접 호출
- **Selected Approach**: Server Action 방식. 각 인증 액션(`login`, `signup`)을 Server Action으로 구현하여 서버 사이드에서 Supabase Auth API를 호출한다.
- **Rationale**: Next.js App Router의 공식 권장 패턴이며, 쿠키 기반 세션 관리와 자연스럽게 통합된다. CSRF 보호가 내장되어 있고, 프로그레시브 인핸스먼트를 지원한다.
- **Trade-offs**: Server Action의 반환 타입이 직렬화 가능해야 하는 제약이 있으나, 인증 결과는 단순 객체이므로 문제가 없다.
- **Follow-up**: Server Action 에러 핸들링 패턴을 표준화하여 일관된 에러 응답 구조를 정의한다.

### Decision: @supabase/ssr 기반 클라이언트 분리
- **Context**: SSR 환경에서 안전한 세션 관리를 위한 Supabase 클라이언트 구성 방식
- **Alternatives Considered**:
  1. 기존 `@supabase/supabase-js` `createClient` 유지
  2. `@supabase/ssr` 패키지로 마이그레이션
- **Selected Approach**: `@supabase/ssr` 패키지를 도입하여 `createBrowserClient`와 `createServerClient`를 분리 구성한다.
- **Rationale**: `@supabase/auth-helpers`가 지원 중단되었고, `@supabase/ssr`이 Next.js App Router의 쿠키 기반 세션 관리를 공식 지원한다. 서버 코드에서 `getUser()`를 통한 JWT 검증이 가능하다.
- **Trade-offs**: 신규 의존성 추가 (`@supabase/ssr`). 기존 `client.ts`의 직접 호출 방식을 사용하는 코드가 있다면 마이그레이션이 필요하다.
- **Follow-up**: 기존 코드에서 `supabase` 싱글톤을 사용하는 부분을 확인하고, SSR 클라이언트로 전환한다.

### Decision: eluocnc.com 도메인 제한 - 클라이언트 + 서버 이중 검증
- **Context**: 회원가입 시 `@eluocnc.com` 도메인 이메일만 허용하는 요구사항의 구현 위치
- **Alternatives Considered**:
  1. 클라이언트 사이드 zod 검증만 적용
  2. 서버 사이드 Server Action에서만 검증
  3. 클라이언트 + 서버 이중 검증
- **Selected Approach**: zod 스키마에서 클라이언트 검증, Server Action에서 서버 검증을 이중으로 수행한다.
- **Rationale**: 클라이언트 검증으로 즉각적인 사용자 피드백을 제공하고, 서버 검증으로 우회 방지를 보장한다.
- **Trade-offs**: 검증 로직이 두 곳에 존재하나, 도메인 값 객체를 공유하여 중복을 최소화한다.
- **Follow-up**: 향후 허용 도메인 목록이 변경될 경우를 대비하여 도메인 검증 로직을 값 객체로 캡슐화한다.

## Risks & Mitigations
- **Supabase 에러 코드 변경 위험** - Supabase Auth 에러 코드가 버전에 따라 변경될 수 있다. AuthError 타입을 래핑하여 에러 매핑 계층을 분리한다.
- **이메일 인증 메일 미도착** - 이메일 발송 실패 시 사용자 경험 저하. 인증 메일 재발송 기능을 향후 확장 범위로 고려한다.
- **쿠키 크기 제한** - Supabase 세션 토큰이 쿠키 크기 제한(4KB)을 초과할 수 있다. `@supabase/ssr`이 청크 분할을 자동 처리하므로 문제없다.
- **미들웨어 성능 영향** - 모든 요청에서 미들웨어가 실행되므로 정적 자산 요청에 대한 매처 설정이 필요하다.

## References
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR 인증 공식 가이드
- [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - 클라이언트 생성 패턴
- [signInWithPassword API Reference](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) - 로그인 API 시그니처
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords) - 패스워드 인증 가이드
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) - 이메일 인증 템플릿 설정
- [Migrating to SSR from Auth Helpers](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers) - SSR 패키지 마이그레이션 가이드
