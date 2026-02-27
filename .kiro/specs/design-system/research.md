# Research & Design Decisions

---
**Purpose**: 디자인 시스템 이식에 대한 기술 조사 결과와 설계 결정 근거를 기록한다.

**Usage**:
- 디스커버리 단계에서 수행한 조사 활동과 결과를 기록한다.
- `design.md`에 담기에는 과도한 세부 사항이나 비교 분석을 보관한다.
---

## Summary
- **Feature**: `design-system`
- **Discovery Scope**: Extension (기존 Next.js 16 프로젝트에 레퍼런스 디자인 시스템 이식)
- **Key Findings**:
  1. shadcn/ui는 Tailwind CSS v4 + React 19를 공식 지원하며, `components.json`에서 `tailwind.config`를 빈 문자열로 설정하여 config-free 방식을 활용한다.
  2. 레퍼런스의 Radix UI 버전(React 18용)은 React 19와 피어 의존성 충돌이 발생할 수 있으므로, `npx shadcn@latest add`로 신규 설치하여 React 19 호환 버전을 자동 해결한다.
  3. `next/font/google`의 `Noto_Sans_KR`은 CSS 변수 방식으로 등록하며, `variable` 옵션을 통해 `--font-noto-sans-kr` 변수로 매핑한다.

## Research Log

### shadcn/ui Tailwind CSS v4 호환성
- **Context**: 레퍼런스 프로젝트가 Tailwind CSS v4 + Vite 환경이므로, Next.js 16 환경에서의 shadcn/ui 설치 호환성을 확인할 필요가 있다.
- **Sources Consulted**:
  - [shadcn/ui Tailwind v4 문서](https://ui.shadcn.com/docs/tailwind-v4)
  - [shadcn/ui components.json 문서](https://ui.shadcn.com/docs/components-json)
  - [shadcn/ui Next.js 설치 가이드](https://ui.shadcn.com/docs/installation/next)
- **Findings**:
  - shadcn/ui는 Tailwind v4를 공식 지원하며, `@theme inline` 디렉티브와 OKLCH 색상 형식을 사용한다.
  - `components.json`에서 `tailwind.config` 필드를 빈 문자열(`""`)로 설정하면 config-free 방식으로 동작한다.
  - `forwardRef` 패턴이 제거되고 `data-slot` 속성이 추가되는 등 React 19 호환 패턴으로 전환되었다.
  - `tailwindcss-animate` 대신 `tw-animate-css`를 사용한다.
  - 기본 스타일이 "new-york"으로 변경되었다.
- **Implications**:
  - 레퍼런스 컴포넌트를 직접 복사하지 않고 `npx shadcn@latest add`로 신규 설치하여 최신 React 19 호환 코드를 확보한다.
  - 레퍼런스의 디자인 토큰(CSS 변수)은 그대로 이식하되, 컴포넌트 코드는 CLI가 생성하는 최신 버전을 사용한다.

### components.json 커스텀 경로 설정
- **Context**: 프로젝트의 DDD 구조에 맞게 `src/shared/ui/` 경로에 컴포넌트를 배치해야 한다.
- **Sources Consulted**: [shadcn/ui components.json 스키마](https://ui.shadcn.com/docs/components-json)
- **Findings**:
  - `aliases` 필드에서 `ui`, `components`, `hooks`, `lib`, `utils` 경로를 자유롭게 지정할 수 있다.
  - `aliases.ui`가 CLI의 컴포넌트 설치 대상 디렉터리를 결정한다.
  - `@/` 경로 별칭은 `tsconfig.json`의 `paths` 설정과 연동된다.
- **Implications**:
  - `aliases.ui`를 `@/shared/ui/components`로 설정하면 CLI가 해당 경로에 컴포넌트를 자동 생성한다.
  - `aliases.hooks`를 `@/shared/ui/hooks`, `aliases.lib`를 `@/shared/ui/lib`로 설정한다.

### next/font/google Noto Sans KR 통합
- **Context**: 레퍼런스는 Google Fonts CDN `@import`를 사용하지만, Next.js에서는 `next/font/google` 자체 호스팅을 사용해야 한다.
- **Sources Consulted**:
  - [Next.js Font Optimization 공식 문서](https://nextjs.org/docs/app/getting-started/fonts)
  - [Next.js 공식 font API 레퍼런스](https://nextjs.org/docs/pages/api-reference/components/font)
- **Findings**:
  - `Noto_Sans_KR`을 `next/font/google`에서 import하고 `variable: "--font-noto-sans-kr"` 옵션으로 CSS 변수를 등록한다.
  - `subsets: ["latin", "latin-ext"]`로 서브셋을 지정한다 (한글은 기본 포함).
  - `weight` 옵션으로 필요한 굵기(400, 500, 700)를 명시한다.
  - CSS 변수는 `<html>` 요소의 `className`에 적용하여 전역으로 사용한다.
  - `@theme inline` 블록에서 `--font-sans: var(--font-noto-sans-kr)`로 매핑하면 Tailwind의 `font-sans` 유틸리티에서 사용 가능하다.
- **Implications**:
  - `layout.tsx`에서 폰트 인스턴스를 생성하고 `className`으로 CSS 변수를 주입한다.
  - 기존 Geist/Geist_Mono 폰트 설정은 Geist_Mono만 유지하고, Geist Sans는 Noto Sans KR로 대체한다.

### next-themes 다크 모드 통합
- **Context**: class 기반 다크 모드 전환을 위해 `next-themes` 라이브러리를 통합해야 한다.
- **Sources Consulted**:
  - [next-themes GitHub](https://github.com/pacocoursey/next-themes)
  - [shadcn/ui 다크 모드 가이드](https://ui.shadcn.com/docs/dark-mode/next)
- **Findings**:
  - `ThemeProvider`를 `"use client"` 래퍼 컴포넌트로 분리하여 App Router와 호환한다.
  - `attribute="class"` 설정으로 `<html>` 요소에 `dark` 클래스를 토글한다.
  - `suppressHydrationWarning`을 `<html>` 요소에 적용하여 하이드레이션 경고를 방지한다.
  - `defaultTheme="dark"` 설정으로 초기 테마를 다크 모드로 설정한다.
  - `enableSystem` 옵션으로 OS color-scheme 설정을 자동 감지한다.
- **Implications**:
  - `src/shared/ui/components/theme-provider.tsx`에 클라이언트 컴포넌트 래퍼를 생성한다.
  - `layout.tsx`에서 `<html>` 요소에 `suppressHydrationWarning` 적용 후, `<body>` 내부에 `ThemeProvider`를 배치한다.

### 레퍼런스 의존성 분석
- **Context**: 레퍼런스 `package.json`의 의존성 중 이식 대상과 제외 대상을 분류해야 한다.
- **Findings**:
  - **제외 대상**: `@emotion/react`, `@emotion/styled`, `@mui/material`, `@mui/icons-material`, `react-router`, `react-dnd`, `react-dnd-html5-backend`, `react-popper`, `@popperjs/core`, `react-slick`, `react-responsive-masonry`
  - **이식 대상** (shadcn/ui CLI가 자동 설치): Radix UI 패키지들 (React 19 호환 버전), `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
  - **별도 설치 필요**: `next-themes`, `tw-animate-css`, `sonner`, `vaul` (drawer), `cmdk` (command), `embla-carousel-react` (carousel), `input-otp`, `react-day-picker`, `date-fns` (calendar), `react-resizable-panels` (resizable), `recharts` (chart), `react-hook-form` (form)
  - **참고**: `motion` 패키지는 레퍼런스에 포함되어 있으나, shadcn/ui 기본 컴포넌트에서 직접 사용하지 않으므로 필요 시 추후 추가한다.
- **Implications**:
  - `npx shadcn@latest add` 명령이 필요한 피어 의존성을 자동으로 설치한다.
  - 제외 대상 라이브러리가 프로젝트에 절대 포함되지 않도록 한다.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| shadcn/ui CLI 신규 설치 | `npx shadcn@latest add`로 46개 컴포넌트를 일괄 설치 | React 19 호환 보장, 최신 코드, 자동 의존성 해결 | 레퍼런스의 커스텀 수정사항이 있을 경우 수동 반영 필요 | 선택됨 |
| 레퍼런스 코드 직접 복사 | 레퍼런스의 46개 `.tsx` 파일을 그대로 복사 | 레퍼런스와 완전 동일 | React 18 피어 의존성 충돌, `forwardRef` 패턴 비호환, import 경로 수동 수정 필요 | 기각 |
| 레퍼런스 복사 후 codemod | 복사 후 React 19 codemod 실행 | 레퍼런스 커스텀 유지 가능 | codemod 완전성 보장 불가, 추가 수동 수정 필요 | 기각 |

## Design Decisions

### Decision: shadcn/ui CLI 신규 설치 방식 채택
- **Context**: 레퍼런스의 46개 컴포넌트를 Next.js 16 + React 19 환경으로 이식해야 한다.
- **Alternatives Considered**:
  1. 레퍼런스 코드 직접 복사 -- React 18 의존성 충돌 위험
  2. 레퍼런스 복사 후 codemod 변환 -- 변환 완전성 미보장
  3. shadcn/ui CLI 신규 설치 -- React 19 호환 코드 자동 생성
- **Selected Approach**: `npx shadcn@latest init` + `npx shadcn@latest add [components]`로 신규 설치
- **Rationale**: CLI가 현재 프로젝트의 React/Next.js 버전을 감지하여 호환되는 코드를 생성한다. Radix UI 버전도 자동으로 React 19 호환 버전이 설치된다.
- **Trade-offs**: 레퍼런스에 커스텀 수정이 있었다면 누락될 수 있으나, 레퍼런스는 Figma 내보내기 결과물이므로 커스텀 수정이 없을 것으로 판단한다.
- **Follow-up**: 설치 후 레퍼런스 컴포넌트와 diff 비교하여 누락된 커스텀 사항이 없는지 확인한다.

### Decision: Geist Sans를 Noto Sans KR로 대체
- **Context**: 레퍼런스 디자인이 Noto Sans KR을 기본 폰트로 사용하며, 한글 최적화가 필요하다.
- **Alternatives Considered**:
  1. Geist Sans + Noto Sans KR 병행 -- 불필요한 폰트 로딩, 복잡성 증가
  2. Noto Sans KR 단독 사용 -- 레퍼런스와 일치, 한글 최적화
- **Selected Approach**: Geist Sans를 제거하고 Noto Sans KR을 `--font-sans` CSS 변수에 매핑한다. Geist Mono는 코드 블록용으로 유지한다.
- **Rationale**: 프로젝트가 한글 중심 서비스이므로 Noto Sans KR이 적합하다. Geist Mono는 코드 표시에 필요하므로 유지한다.
- **Trade-offs**: Noto Sans KR의 폰트 파일 크기가 Geist Sans보다 크지만, `next/font/google`의 자동 서브셋팅이 이를 최적화한다.

### Decision: @custom-variant dark 방식 채택
- **Context**: 다크 모드 CSS 변형을 Tailwind CSS v4 방식으로 정의해야 한다.
- **Selected Approach**: `@custom-variant dark (&:is(.dark *))` 구문을 `globals.css` 최상단에 배치한다.
- **Rationale**: 레퍼런스와 동일한 방식이며, Tailwind CSS v4의 공식 권장 패턴이다. `next-themes`의 class 기반 전환과 호환된다.

## Risks & Mitigations
- **React 19 피어 의존성 충돌** -- `npx shadcn@latest add` 시 `--legacy-peer-deps` 또는 `--force` 플래그로 해결. 최신 Radix UI는 React 19를 공식 지원하므로 발생 가능성이 낮다.
- **Noto Sans KR 폰트 로딩 지연** -- `next/font/google`의 `display: "swap"` 옵션으로 FOIT 방지. 필요한 weight만 명시하여 로딩량을 최소화한다.
- **레퍼런스 디자인 토큰 불일치** -- 설치 후 레퍼런스 `theme.css`와 `globals.css`의 CSS 변수를 1:1 비교 검증한다.
- **46개 컴포넌트 일괄 설치 시 충돌** -- 배치 설치 명령(`npx shadcn@latest add accordion alert ...`)으로 한 번에 처리하여 의존성 해결을 CLI에 위임한다.

## References
- [shadcn/ui Tailwind v4 문서](https://ui.shadcn.com/docs/tailwind-v4) -- Tailwind v4 마이그레이션 가이드 및 CSS 변수 패턴
- [shadcn/ui components.json 문서](https://ui.shadcn.com/docs/components-json) -- 구성 파일 스키마 및 aliases 설정
- [shadcn/ui Next.js 설치 가이드](https://ui.shadcn.com/docs/installation/next) -- Next.js 프로젝트 초기화 절차
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) -- next/font/google 사용법
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) -- ThemeProvider 설정 및 App Router 통합
- [shadcn/ui 다크 모드 가이드](https://ui.shadcn.com/docs/dark-mode/next) -- Next.js 다크 모드 구현
