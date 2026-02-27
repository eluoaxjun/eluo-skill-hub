# Design System 요구사항

## 소개

Eluo Skill Hub의 디자인 시스템 명세이다.
`AI Skills Platform Design/` 폴더에 존재하는 Vite + React 18 기반 레퍼런스 디자인(Figma 내보내기)의 디자인 토큰, UI 컴포넌트, 테마 시스템을 **Next.js 16 + React 19** 프로젝트로 이식한다.
디자인 토큰의 일관된 적용, 다크 모드 전환, 한글 타이포그래피 최적화, shadcn/ui 기반 컴포넌트 라이브러리 구축을 통해 모든 UI가 통일된 시각적 언어를 사용하도록 보장한다.

## 요구사항

### Requirement 1: 디자인 토큰 이식

**Objective:** 개발자로서, 레퍼런스 디자인의 CSS 변수 기반 디자인 토큰을 Next.js 프로젝트의 `src/app/globals.css`로 이식하여 모든 UI 컴포넌트가 일관된 색상, 간격, 반지름 값을 사용할 수 있게 한다.

#### Acceptance Criteria

1. The Design System shall `src/app/globals.css`에 레퍼런스 `theme.css`의 `:root` CSS 변수(background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1~5, radius, sidebar 계열)를 모두 포함한다.
2. The Design System shall `src/app/globals.css`에 `.dark` 선택자 블록을 포함하고, 레퍼런스의 다크 모드 CSS 변수를 모두 정의한다.
3. The Design System shall `@theme inline` 블록에서 모든 CSS 변수를 Tailwind CSS v4 커스텀 색상(`--color-*`), 반지름(`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`)으로 매핑한다.
4. The Design System shall `@layer base` 블록에서 `* { @apply border-border outline-ring/50 }` 및 `body { @apply bg-background text-foreground }` 전역 기본 스타일을 정의한다.
5. If 레퍼런스에 존재하는 CSS 변수가 `globals.css`에 누락된 경우, then the Design System shall 빌드 시 Tailwind CSS 유틸리티 클래스 참조 누락으로 인해 시각적 차이를 발생시키지 않아야 한다.

### Requirement 2: 타이포그래피 시스템

**Objective:** 개발자로서, 한글 최적화된 타이포그래피 시스템을 구축하여 Noto Sans KR 폰트가 자체 호스팅되고, 기본 HTML 요소에 일관된 타이포그래피 스타일이 적용되도록 한다.

#### Acceptance Criteria

1. The Design System shall `next/font/google`을 통해 Noto Sans KR 폰트(latin, latin-ext 서브셋 포함)를 로드하고 CSS 변수로 등록한다.
2. The Design System shall Geist Mono 폰트를 코드 블록(`<code>`, `<pre>`) 전용으로 유지하고 CSS 변수로 등록한다.
3. The Design System shall `@layer base` 블록에서 `html`, `body` 요소에 Noto Sans KR 폰트 패밀리(fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)를 적용한다.
4. The Design System shall `@layer base` 블록에서 h1(`--text-2xl`), h2(`--text-xl`), h3(`--text-lg`), h4(`--text-base`) 요소에 레퍼런스와 동일한 font-size, font-weight(`--font-weight-medium`), line-height(1.5) 값을 적용한다.
5. The Design System shall `@layer base` 블록에서 `label`, `button` 요소에 `--text-base`, `--font-weight-medium`, line-height 1.5를 적용한다.
6. The Design System shall `@layer base` 블록에서 `input` 요소에 `--text-base`, `--font-weight-normal`, line-height 1.5를 적용한다.
7. The Design System shall Google Fonts CDN `@import`를 사용하지 않고 `next/font/google` 자체 호스팅만 사용한다.

### Requirement 3: 다크 모드

**Objective:** 사용자로서, 라이트/다크 테마를 전환하거나 시스템 설정을 따를 수 있어, 선호하는 시각적 환경에서 플랫폼을 사용할 수 있게 한다.

#### Acceptance Criteria

1. The Design System shall `next-themes` 라이브러리와 class 기반 다크 모드 전환을 지원한다.
2. The Design System shall Tailwind CSS v4의 `@custom-variant dark (&:is(.dark *))` 구문을 사용하여 다크 모드 변형을 정의한다.
3. The Design System shall `ThemeProvider`를 루트 레이아웃에 제공하고 `attribute="class"`, `defaultTheme="dark"` 설정을 적용한다.
4. When 사용자가 테마를 전환할 때, the Design System shall `<html>` 요소의 class 속성을 변경하여 모든 CSS 변수가 즉시 전환되도록 한다.
5. The Design System shall 서버-클라이언트 하이드레이션 불일치(flash of unstyled content)를 방지하기 위해 `ThemeProvider`에 `suppressHydrationWarning` 속성을 적용한다.
6. While 시스템 테마가 "system"으로 설정된 경우, the Design System shall 운영체제의 color-scheme 설정을 자동으로 따른다.

### Requirement 4: shadcn/ui 컴포넌트 라이브러리 설치 및 구성

**Objective:** 개발자로서, shadcn/ui CLI로 프리미티브 컴포넌트를 설치하고 `src/shared/ui/` 경로에 배치하여, React 19 호환 및 Next.js App Router 통합이 보장된 재사용 가능한 컴포넌트를 확보한다.

#### Acceptance Criteria

1. The Design System shall `npx shadcn@latest init` 명령으로 `components.json` 설정 파일을 생성한다.
2. The Design System shall `components.json`에서 컴포넌트 출력 경로를 `src/shared/ui/components`로 설정한다.
3. The Design System shall `components.json`에서 유틸리티 함수(`cn()`) 경로를 `src/shared/ui/lib/utils`로 설정한다.
4. The Design System shall `components.json`에서 hooks 경로를 `src/shared/ui/hooks`로 설정한다.
5. The Design System shall `npx shadcn@latest add` 명령으로 레퍼런스의 46개 프리미티브 컴포넌트(accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip)를 설치한다.
6. The Design System shall 설치된 모든 컴포넌트가 `src/shared/ui/components/` 디렉터리에 위치하도록 한다.
7. If shadcn/ui CLI 설치 시 React 19 호환성 문제가 발생하는 경우, then the Design System shall 호환 가능한 Radix UI 버전으로 의존성을 해결한다.

### Requirement 5: 파일 구조 및 경로 규칙

**Objective:** 개발자로서, 디자인 시스템 파일이 프로젝트의 DDD 구조와 일관된 위치에 배치되어, 다른 바운디드 컨텍스트에서 쉽게 import하여 사용할 수 있게 한다.

#### Acceptance Criteria

1. The Design System shall `src/shared/ui/components/` 디렉터리에 shadcn/ui 프리미티브 컴포넌트를 배치한다.
2. The Design System shall `src/shared/ui/hooks/` 디렉터리에 UI 관련 커스텀 훅(useIsMobile 등)을 배치한다.
3. The Design System shall `src/shared/ui/lib/` 디렉터리에 유틸리티 함수(`cn()` 등)를 배치한다.
4. The Design System shall `@/shared/ui/components/button`과 같은 절대 경로 import를 지원한다.
5. The Design System shall UI 컴포넌트 파일 이름에 kebab-case 명명 규칙(예: `button.tsx`, `alert-dialog.tsx`)을 적용한다.

### Requirement 6: 제외 라이브러리 및 의존성 정리

**Objective:** 개발자로서, 레퍼런스에서 불필요하거나 충돌하는 라이브러리를 배제하여 프로젝트의 번들 크기를 최소화하고 의존성 충돌을 방지한다.

#### Acceptance Criteria

1. The Design System shall MUI 관련 패키지(`@mui/material`, `@mui/icons-material`)를 프로젝트 의존성에 포함하지 않는다.
2. The Design System shall Emotion 관련 패키지(`@emotion/react`, `@emotion/styled`)를 프로젝트 의존성에 포함하지 않는다.
3. The Design System shall `react-router` 패키지를 프로젝트 의존성에 포함하지 않는다(Next.js App Router 사용).
4. The Design System shall shadcn/ui 컴포넌트가 필요로 하는 피어 의존성(Radix UI, class-variance-authority, clsx, tailwind-merge, lucide-react 등)만 설치한다.
5. If 레퍼런스 의존성 중 Next.js와 충돌하거나 대체 가능한 라이브러리가 발견되면, then the Design System shall Next.js 생태계 호환 대안을 사용하거나 해당 의존성을 제외한다.

### Requirement 7: cn() 유틸리티 함수

**Objective:** 개발자로서, `cn()` 유틸리티 함수를 통해 조건부 클래스 이름을 안전하게 병합할 수 있어, Tailwind CSS 클래스 충돌 없이 컴포넌트 스타일을 확장할 수 있게 한다.

#### Acceptance Criteria

1. The Design System shall `src/shared/ui/lib/utils.ts`에 `cn()` 함수를 제공한다.
2. The Design System shall `cn()` 함수에서 `clsx`와 `tailwind-merge`를 조합하여 Tailwind CSS 클래스 충돌을 자동 해결한다.
3. The Design System shall 모든 shadcn/ui 컴포넌트가 `@/shared/ui/lib/utils`에서 `cn()` 함수를 import하도록 한다.

### Requirement 8: 컴포넌트 품질 검증

**Objective:** 개발자로서, 설치된 모든 컴포넌트가 정상적으로 렌더링되고 TypeScript 타입 오류 없이 빌드되는 것을 확인하여, 안정적인 디자인 시스템 기반을 보장한다.

#### Acceptance Criteria

1. The Design System shall 설치된 모든 컴포넌트 파일이 TypeScript strict mode에서 타입 오류 없이 컴파일되어야 한다.
2. The Design System shall `any` 타입을 사용하지 않아야 한다.
3. The Design System shall 모든 컴포넌트에 `"use client"` 지시문이 필요한 경우 올바르게 포함되어야 한다.
4. When `npm run build` 명령을 실행할 때, the Design System shall 디자인 시스템 관련 파일에서 빌드 오류가 발생하지 않아야 한다.
5. The Design System shall 설치된 컴포넌트가 React 19 및 Next.js 16 환경에서 정상적으로 렌더링되어야 한다.
