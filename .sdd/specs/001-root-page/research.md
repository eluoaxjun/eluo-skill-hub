# Research: 001-root-page 기술 리서치

> **Date**: 2026-03-02

---

## 1. Supabase Auth SSR (Next.js App Router)

### 패키지
- `@supabase/ssr` — SSR 환경에서 쿠키 기반 인증 관리
- `@supabase/supabase-js` — 이미 설치됨 (^2.98.0)

### 클라이언트 유형 (2종 필요)
1. **Browser Client** — Client Component에서 사용
   - `createBrowserClient(url, key)` from `@supabase/ssr`
2. **Server Client** — Server Component, Route Handler에서 사용
   - `createServerClient(url, key, { cookies })` from `@supabase/ssr`
   - `cookies()` from `next/headers` 활용

### Proxy (세션 갱신)
- Next.js Server Component는 쿠키를 **쓸 수 없음**
- `proxy.ts` (또는 `middleware.ts`)를 통해 만료된 Auth 토큰을 갱신
- Proxy 역할:
  1. `supabase.auth.getClaims()` 호출로 토큰 갱신
  2. 갱신된 토큰을 Server Component에 전달 (`request.cookies.set`)
  3. 갱신된 토큰을 브라우저에 전달 (`response.cookies.set`)

### 인증 상태 확인 (서버 사이드)
```typescript
// Server Component에서
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
```
- `getUser()`는 JWT를 검증하므로 `getSession()`보다 안전
- 서버에서 인증 확인 → FOUC 방지 (NFR-05 충족)

### 현재 프로젝트 상태
- `src/shared/infrastructure/supabase/client.ts`에 브라우저 클라이언트만 존재
- `@supabase/ssr` 미설치 → 설치 필요
- 서버 클라이언트, middleware/proxy 없음 → 새로 생성 필요

---

## 2. Tailwind CSS v4

### 현재 상태
- Tailwind v4 사용 중 (`@tailwindcss/postcss` v4)
- `tailwind.config.js` 파일 없음 (v4는 CSS 기반 설정)
- `globals.css`에서 `@theme inline` 사용

### 커스텀 디자인 토큰 추가 필요
reference.html의 디자인 토큰:
```css
@theme inline {
  --color-primary: #196ee6;
  --color-background-light: #f6f7f8;
  --color-background-dark: #111821;
}
```

### 다크 모드
- reference.html은 `class` 기반 다크 모드 사용 (`dark:` prefix)
- Tailwind v4에서도 `@variant dark (&:where(.dark, .dark *))` 설정 가능

---

## 3. 폰트

### reference.html 사용 폰트
- **Inter** — 영문 디스플레이용
- **Noto Sans KR** — 한글 본문용

### 적용 방법
- `next/font/google`로 Inter, Noto Sans KR 로드
- 현재 Geist 폰트 → Inter + Noto Sans KR로 교체

---

## 4. 아이콘

### reference.html 사용 아이콘
- **Material Symbols Outlined** — Google Fonts에서 로드하는 아이콘 폰트

### 선택지 분석
| 방식 | 장점 | 단점 |
|------|------|------|
| Material Symbols (폰트) | reference.html과 동일, 간편 | 외부 폰트 의존, 번들 크기 |
| Inline SVG 컴포넌트 | 외부 의존 없음, 트리 쉐이킹 | 직접 SVG 작성 필요 |
| `@fontsource/material-symbols` | npm으로 관리 가능 | 추가 패키지 도입 |

### 결정: Inline SVG 컴포넌트
- Constitution 원칙 "외부 라이브러리 최소화"에 부합
- 사용되는 아이콘 수가 제한적 (약 15개)
- 필요한 아이콘만 SVG로 포함하여 번들 크기 최적화
- 공용 `Icon` 컴포넌트로 래핑

---

## 5. Next.js App Router 라우팅 전략

### 문제
- `/` 경로에서 인증 여부에 따라 완전히 다른 UI 표시
- 두 개의 `page.tsx`를 같은 경로에 둘 수 없음

### 선택지 분석
| 방식 | 설명 | 장단점 |
|------|------|--------|
| A. 서버 컴포넌트 조건부 렌더링 | `page.tsx`에서 auth 확인 후 분기 | URL 변경 없음, FOUC 방지 |
| B. Middleware 리다이렉트 | `/` → `/dashboard` 리다이렉트 | URL 변경됨 (spec 미충족) |
| C. Route Group + Middleware | `(public)/`, `(auth)/` 그룹 | 같은 경로 충돌 문제 |

### 결정: A. 서버 컴포넌트 조건부 렌더링
- `src/app/page.tsx`를 서버 컴포넌트로 유지
- 서버에서 `getUser()` → 인증 상태에 따라 `LandingPage` 또는 `DashboardPage` 렌더링
- URL 변경 없이 spec 요구사항 충족
- FOUC 없음 (서버 사이드 렌더링)

### 대시보드 레이아웃 재사용
- `DashboardLayout` 컴포넌트를 분리하여 다른 인증 필요 페이지에서도 재사용
- 향후 `/marketplace`, `/my-agents` 등에서 공유

---

## 6. 결론

### 추가 설치 필요 패키지
- `@supabase/ssr` — Supabase SSR 인증

### 주요 기술 결정 요약
| 항목 | 결정 |
|------|------|
| 인증 확인 | 서버 컴포넌트에서 `getUser()` (FOUC 방지) |
| 라우팅 전략 | 단일 `page.tsx` 조건부 렌더링 |
| 아이콘 | Inline SVG 컴포넌트 |
| 폰트 | Inter + Noto Sans KR (`next/font/google`) |
| 다크 모드 | Tailwind class 기반 (`dark:`) |
| 디자인 토큰 | `globals.css` `@theme` 블록에 정의 |
