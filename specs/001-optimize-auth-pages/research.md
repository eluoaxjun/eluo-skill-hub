# Research: 인증 페이지 로딩 성능 최적화

**Phase**: 0 — Research
**Date**: 2026-03-03
**Feature**: [spec.md](./spec.md)

---

## 1. 현재 성능 병목 분석

코드베이스 탐색을 통해 세 가지 핵심 병목을 특정했다.

### 1-A. 외부 CDN 폰트 @import (최우선)

**파일**: `src/app/globals.css` 1번째 줄

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css");
```

**문제**: CSS `@import url()`은 렌더 블로킹(render-blocking) 리소스다.
브라우저는 이 외부 CDN 요청이 완료되기 전까지 페이지 렌더링을 시작하지 못한다.
`cdn.jsdelivr.net`으로의 네트워크 왕복(DNS 조회 + TCP 연결 + TLS 핸드셰이크 + 다운로드)이
첫 화면 표시를 직접 차단한다.

**해결 방향**: Next.js의 `next/font/local`을 사용해 폰트를 로컬에서 서빙한다.
`next/font`는 자동으로 `font-display: swap`을 적용하고, 폰트 파일을 정적 경로로 내보내
외부 네트워크 요청을 제거한다.

- **Decision**: Pretendard 폰트를 `next/font/local`로 로컬 서빙
- **Rationale**: 외부 CDN 의존성 제거 → 렌더 블로킹 없음 → FCP/TTI 직접 단축
- **Alternatives considered**:
  - `@fontsource/pretendard` npm 패키지: 가능하지만 `next/font`와 통합이 less ergonomic
  - CDN 유지 + `<link rel="preconnect">`: 여전히 외부 요청 필요, 완전 해결 아님
  - 시스템 폰트 폴백 사용: 브랜드 일관성 훼손

### 1-B. highlight.js CSS 전역 로드 (두 번째)

**파일**: `src/app/layout.tsx` 3번째 줄

```typescript
import "highlight.js/styles/github.css";
```

**문제**: 코드 하이라이팅 CSS가 **모든 페이지**에 로드된다.
로그인·회원가입 페이지에는 코드 블록이 전혀 없으므로 이 CSS는 불필요한 네트워크
페이로드다. `highlight.js/styles/github.css`는 약 15–20KB(gzip 전)다.

**해결 방향**: 루트 레이아웃에서 해당 import를 제거하고, 코드 하이라이팅이 필요한
페이지(스킬 상세, 마크다운 렌더링 페이지)의 레이아웃 또는 컴포넌트에만 이 CSS를 추가한다.

- **Decision**: `highlight.js` CSS를 루트 layout에서 제거 → 필요한 컨텍스트로 이동
- **Rationale**: 인증 페이지의 초기 CSS 번들 크기 감소
- **Alternatives considered**:
  - dynamic import로 지연 로드: CSS는 dynamic import가 어려움, 코드 복잡도 증가
  - CSS-in-JS로 스코핑: 현재 스택(Tailwind)과 이질적

### 1-C. Route-Level Loading State 부재 (세 번째)

**현황**: `src/app/login/loading.tsx`, `src/app/signup/loading.tsx` 파일이 존재하지 않는다.

**문제**: Next.js App Router에서 서버 컴포넌트가 렌더링을 완료할 때까지 브라우저에는
빈 화면(또는 이전 페이지)이 표시된다. 로그인 페이지는 `searchParams`를 await하는
비동기 서버 컴포넌트이므로, 이 대기 시간 동안 사용자는 아무것도 볼 수 없다.

**해결 방향**: Next.js App Router의 `loading.tsx` 파일을 추가한다.
`loading.tsx`는 `<Suspense>` 경계를 자동으로 생성하여 서버 렌더링 중에
즉시 스켈레톤 UI를 표시한다.

- **Decision**: `loading.tsx` 파일을 login/signup 라우트에 추가
- **Rationale**: 서버 렌더링 대기 중 즉각적인 시각적 피드백 제공 → 체감 성능 향상
- **Alternatives considered**:
  - 수동 `<Suspense>` 래핑: 동일 효과, `loading.tsx`가 더 간결
  - Streaming SSR: 현 구조에서 필요 없음 (페이지 단순)

---

## 2. 기술 스택 확인

| 항목 | 현황 |
|------|------|
| Next.js 버전 | 16.1.6 (App Router, `next/font` 지원) |
| React 버전 | 19.2.3 |
| 폰트 현재 방식 | CDN @import (cdn.jsdelivr.net) |
| CSS 프레임워크 | Tailwind CSS v4 |
| 테스트 | Jest + RTL + Playwright 설치 완료 |
| `next.config.ts` | 빈 상태 (최적화 설정 없음) |
| `middleware.ts` | 없음 (Supabase 세션 갱신 미설정) |

---

## 3. 추가 조사: next/font/local + Pretendard

Pretendard Variable 폰트를 `next/font/local`로 통합하는 표준 패턴:

```typescript
// src/app/layout.tsx
import localFont from 'next/font/local'

const pretendard = localFont({
  src: '../fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})
```

폰트 파일 조달 방법:
- [GitHub: orioncactus/pretendard](https://github.com/orioncactus/pretendard) releases 에서
  `PretendardVariable.woff2` 다운로드 → `src/fonts/` 또는 `public/fonts/` 에 배치
- `next/font/local`은 `src/` 기준 상대 경로 사용 권장

---

## 4. 성능 측정 방법

구현 전 기준점(baseline) 및 구현 후 개선 검증을 위한 측정 방법:

- **Playwright + PerformanceObserver**: `performance.getEntriesByType('paint')` 로 FCP 측정
- **Lighthouse CLI**: `lighthouse http://localhost:3000/login --output json`
- **Chrome DevTools**: Network 탭에서 render-blocking resources 확인

측정 환경 기준:
- Production 빌드 (`npm run build && npm run start`)
- "Fast 4G" 쓰로틀링 (DevTools → Network conditions)
- 첫 방문 시뮬레이션: 캐시 비활성화 (Disable cache 체크)

---

## 5. 결론 및 구현 우선순위

| 우선순위 | 작업 | 예상 개선 효과 |
|----------|------|----------------|
| P1 | Pretendard → `next/font/local` 전환 | FCP 1-3초 단축 (외부 요청 제거) |
| P2 | `highlight.js` CSS를 auth 페이지에서 제거 | 초기 CSS 페이로드 15-20KB 감소 |
| P3 | `loading.tsx` 스켈레톤 추가 | 체감 로딩 시간 개선, CLS 방지 |

세 가지 변경 모두 도메인 로직 및 기존 인증 기능에 **영향 없음**.
기존 값 객체(Email, Password), 유스케이스, 레포지토리 인터페이스는 변경 없음.
