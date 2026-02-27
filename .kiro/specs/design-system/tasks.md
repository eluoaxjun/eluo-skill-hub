# Implementation Plan

- [x] 1. 디자인 토큰 이식 — globals.css에 레퍼런스 CSS 변수 및 Tailwind v4 테마 매핑 구성
- [x] 1.1 라이트 모드 및 다크 모드 CSS 변수 정의
  - `globals.css`에 `@import "tailwindcss"` 및 `@import "tw-animate-css"`를 선언한다
  - `@custom-variant dark (&:is(.dark *))` 구문으로 다크 모드 변형을 정의한다
  - `:root` 블록에 레퍼런스 `theme.css`의 모든 라이트 모드 CSS 변수(background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, input-background, switch-background, ring, chart-1~5, radius, sidebar 계열, font-size, font-weight 계열)를 정의한다
  - `.dark` 블록에 레퍼런스의 다크 모드 CSS 변수 오버라이드를 모두 정의한다
  - 기존 `@media (prefers-color-scheme: dark)` 블록을 제거하고 class 기반으로 전환한다
  - _Requirements: 1.1, 1.2, 1.5, 3.2_

- [x] 1.2 Tailwind CSS v4 테마 매핑 및 전역 기본 스타일 정의
  - `@theme inline` 블록에서 CSS 변수를 `--color-*` 커스텀 색상으로 매핑한다
  - `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` 반지름 값을 `calc(var(--radius) +/- offset)`으로 매핑한다
  - `--color-sidebar-*` 계열 변수를 매핑한다
  - `--font-sans: var(--font-noto-sans-kr)`, `--font-mono: var(--font-geist-mono)` 폰트 변수를 매핑한다
  - `@layer base` 블록에서 `* { @apply border-border outline-ring/50 }` 전역 리셋 스타일을 정의한다
  - `@layer base` 블록에서 `body { @apply bg-background text-foreground }` 기본 스타일을 정의한다
  - _Requirements: 1.3, 1.4_

- [x] 1.3 타이포그래피 기본 스타일 정의
  - `@layer base` 블록에서 `html`, `body` 요소에 Noto Sans KR 폰트 패밀리(fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)를 적용한다
  - h1(`--text-2xl`), h2(`--text-xl`), h3(`--text-lg`), h4(`--text-base`) 요소에 레퍼런스와 동일한 font-size, font-weight(`--font-weight-medium`), line-height(1.5)를 적용한다
  - `label`, `button` 요소에 `--text-base`, `--font-weight-medium`, line-height 1.5를 적용한다
  - `input` 요소에 `--text-base`, `--font-weight-normal`, line-height 1.5를 적용한다
  - `code`, `pre` 요소에 Geist Mono 폰트 패밀리를 적용한다
  - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [x] 2. 폰트 설정 및 루트 레이아웃 구성
- [x] 2.1 Noto Sans KR 폰트 로딩 및 Geist Sans 교체
  - `layout.tsx`에서 기존 Geist Sans(`@next/font/google`) import를 제거한다
  - `next/font/google`을 통해 `Noto_Sans_KR`을 로드한다(subsets: `["latin", "latin-ext"]`, weight: `["400", "500", "700"]`, variable: `"--font-noto-sans-kr"`, display: `"swap"`)
  - `Geist_Mono`를 유지하고 CSS 변수 `--font-geist-mono`로 등록한다
  - `<html>` 요소의 `className`에 두 폰트의 variable 클래스를 적용한다
  - `<html>` 요소의 `lang` 속성을 `"ko"`로 변경한다
  - Google Fonts CDN `@import`가 사용되지 않음을 확인한다
  - _Requirements: 2.1, 2.2, 2.7_

- [x] 2.2 ThemeProvider 클라이언트 컴포넌트 생성 및 루트 레이아웃 통합
  - `next-themes` 패키지를 설치한다
  - `src/shared/ui/components/theme-provider.tsx`에 `"use client"` 지시문이 포함된 ThemeProvider 래퍼 컴포넌트를 생성한다
  - `attribute="class"`, `defaultTheme="dark"`, `enableSystem=true` 설정을 적용한다
  - `layout.tsx`에서 `<html>` 요소에 `suppressHydrationWarning` 속성을 추가한다
  - `layout.tsx`의 `<body>` 내부에 `ThemeProvider`를 배치하여 자식 컴포넌트를 래핑한다
  - 사용자가 테마를 전환할 때 `<html>` 요소의 class 속성이 변경되어 CSS 변수가 즉시 전환되는지 확인한다
  - 시스템 테마가 "system"일 때 운영체제의 color-scheme 설정을 자동으로 따르는지 확인한다
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

- [x] 3. shadcn/ui CLI 초기화 및 컴포넌트 설치
- [x] 3.1 components.json 설정 및 shadcn/ui 초기화
  - `npx shadcn@latest init` 명령으로 `components.json` 설정 파일을 생성한다
  - `style: "new-york"`, `rsc: true`, `tsx: true` 기본 옵션을 설정한다
  - `tailwind.config`를 빈 문자열로 설정하여 Tailwind CSS v4 config-free 방식을 적용한다
  - `tailwind.css`를 `src/app/globals.css`로 설정한다
  - `aliases.components`를 `@/shared/ui/components`, `aliases.ui`를 `@/shared/ui/components`로 설정한다
  - `aliases.hooks`를 `@/shared/ui/hooks`, `aliases.lib`를 `@/shared/ui/lib`로 설정한다
  - `aliases.utils`를 `@/shared/ui/lib/utils`로 설정한다
  - CLI 실행 후 `globals.css`가 Task 1에서 구성한 내용을 유지하는지 확인하고, 변경된 경우 복원한다
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 3.2 cn() 유틸리티 함수 생성 및 검증
  - `src/shared/ui/lib/utils.ts`에 `cn()` 함수가 생성되었는지 확인한다 (shadcn/ui init이 자동 생성)
  - `cn()` 함수가 `clsx`와 `tailwind-merge`를 조합하여 Tailwind CSS 클래스 충돌을 자동 해결하는지 확인한다
  - `@/shared/ui/lib/utils` 경로로 import할 수 있는지 확인한다
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3.3 46개 프리미티브 컴포넌트 일괄 설치
  - `npx shadcn@latest add` 명령으로 46개 컴포넌트를 일괄 설치한다: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip
  - 설치된 모든 컴포넌트가 `src/shared/ui/components/` 디렉터리에 위치하는지 확인한다
  - UI 관련 커스텀 훅(useIsMobile 등)이 `src/shared/ui/hooks/` 디렉터리에 생성되었는지 확인한다
  - 컴포넌트 파일 이름이 kebab-case 명명 규칙을 따르는지 확인한다
  - React 19 피어 의존성 충돌이 발생할 경우 호환 가능한 Radix UI 버전으로 해결한다
  - 모든 컴포넌트가 `@/shared/ui/lib/utils`에서 `cn()` 함수를 import하는지 확인한다
  - 필요한 컴포넌트에 `"use client"` 지시문이 올바르게 포함되어 있는지 확인한다
  - _Requirements: 4.5, 4.6, 4.7, 5.1, 5.2, 5.5, 7.3, 8.3_

- [x] 4. 제외 라이브러리 검증 및 의존성 정리
  - `package.json`에 MUI 관련 패키지(`@mui/material`, `@mui/icons-material`)가 포함되지 않았는지 확인한다
  - `package.json`에 Emotion 관련 패키지(`@emotion/react`, `@emotion/styled`)가 포함되지 않았는지 확인한다
  - `package.json`에 `react-router` 패키지가 포함되지 않았는지 확인한다
  - shadcn/ui 컴포넌트가 필요로 하는 피어 의존성(Radix UI, class-variance-authority, clsx, tailwind-merge, lucide-react 등)만 설치되어 있는지 확인한다
  - Next.js와 충돌하거나 대체 가능한 레퍼런스 의존성이 없는지 점검한다
  - `@/shared/ui/components/button`과 같은 절대 경로 import가 정상 해석되는지 확인한다
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.4_

- [x] 5. 빌드 검증 및 품질 확인
- [x] 5.1 TypeScript 빌드 및 타입 안전성 검증
  - `npm run build` 명령을 실행하여 디자인 시스템 관련 파일에서 빌드 오류가 발생하지 않는지 확인한다
  - 설치된 모든 컴포넌트 파일이 TypeScript strict mode에서 타입 오류 없이 컴파일되는지 확인한다
  - `any` 타입이 사용된 파일이 없는지 정적 분석한다
  - 설치된 컴포넌트가 React 19 및 Next.js 16 환경에서 정상적으로 렌더링 가능한 상태인지 확인한다
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x]* 5.2 수용 기준 기반 통합 확인
  - 46개 컴포넌트 파일이 모두 `src/shared/ui/components/`에 존재하는지 확인한다
  - `src/shared/ui/lib/utils.ts`와 `src/shared/ui/hooks/use-mobile.ts` 파일이 존재하는지 확인한다
  - 레퍼런스 `theme.css`의 모든 CSS 변수가 `globals.css`에 포함되어 있는지 1:1 대조 검증한다
  - `npm run dev` 실행 후 라이트/다크 모드 전환, Noto Sans KR 폰트 적용, 기본 컴포넌트 렌더링이 시각적으로 정상인지 스모크 테스트한다
  - `npm ls`로 의존성 트리에 충돌이 없는지 확인한다
  - _Requirements: 1.5, 4.6, 8.3, 8.5_
