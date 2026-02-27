# Research & Design Decisions

---
**Purpose**: 루트 페이지 레이아웃 설계를 위한 디스커버리 조사 결과 및 설계 결정 사항을 기록한다.

**Usage**:
- 기존 코드베이스 분석 및 참조 디자인 프로젝트 조사 결과를 문서화한다.
- design.md에 담기에 과도한 상세 비교, 벤치마크, 조사 로그를 이 문서에 보관한다.
---

## Summary
- **Feature**: `root-page`
- **Discovery Scope**: Extension (기존 Next.js App Router 스캐폴드를 대시보드 레이아웃으로 확장)
- **Key Findings**:
  1. 참조 디자인 프로젝트(`AI Skills Platform Design/`)에서 Sidebar, MainLayout, Dashboard, SkillCard 등 UI 구조 패턴을 확인하였으며, Next.js App Router 패턴으로 변환이 필요하다.
  2. `next-themes` 기반 ThemeProvider가 이미 `layout.tsx`에 통합되어 있어 다크 모드 인프라가 구축되어 있다.
  3. `globals.css`에 사이드바 전용 CSS 변수(`--sidebar`, `--sidebar-foreground` 등)가 라이트/다크 모드 모두 정의되어 있다.

## Research Log

### 기존 코드베이스 분석
- **Context**: 현재 프로젝트의 레이아웃 구조와 활용 가능한 기존 코드를 파악하기 위해 조사하였다.
- **Sources Consulted**: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/shared/ui/components/theme-provider.tsx`, `package.json`, `tsconfig.json`
- **Findings**:
  - `layout.tsx`: Noto Sans KR + Geist Mono 폰트, ThemeProvider(attribute="class", defaultTheme="dark", enableSystem) 구성
  - `page.tsx`: Next.js 기본 보일러플레이트 (교체 대상)
  - `globals.css`: shadcn/ui 스타일 CSS 변수 시스템 (사이드바 전용 변수 포함), Tailwind CSS v4 `@theme inline` 구성
  - `theme-provider.tsx`: next-themes 래퍼 컴포넌트
  - `@/` 경로 별칭이 `./src/`로 설정되어 있다
- **Implications**: 기존 테마 인프라와 CSS 변수 시스템을 그대로 활용할 수 있다. 추가적인 테마 설정 없이 사이드바 색상 변수가 이미 준비되어 있다.

### 참조 디자인 프로젝트 분석
- **Context**: `AI Skills Platform Design/` 디렉토리에 Vite 기반 참조 구현이 존재한다. 해당 프로젝트의 UI 구조와 패턴을 Next.js App Router 아키텍처로 변환해야 한다.
- **Sources Consulted**: `MainLayout.tsx`, `Sidebar.tsx`, `Dashboard.tsx`, `SkillCard.tsx`, `skill.ts`, `mockSkills.ts`, shadcn/ui sidebar 컴포넌트
- **Findings**:
  - **MainLayout**: `flex h-screen` 기반 3분할 레이아웃 (Sidebar + Mobile Header + Main Content). `Outlet` 사용 (React Router) -> Next.js에서는 `children` prop으로 대체
  - **Sidebar**: 고정 너비(w-64), 모바일 대응(`translate-x` 기반 슬라이드), 카테고리 목록, 검색 필드, 로고 영역 포함
  - **Dashboard**: 히어로 섹션 + 스킬 카드 그리드(grid-cols-1 md:grid-cols-2 xl:grid-cols-3), 빈 상태 메시지, 카테고리/검색 필터링
  - **SkillCard**: 스킬명, 설명, 카테고리 태그, 아이콘 표시
  - **카테고리**: 참조 디자인은 "전체/업무 자동화/문서 작성/데이터 분석/코딩 지원/고객 지원/마케팅" 7개 -> 요구사항에 따라 "기획/디자인/퍼블리싱/개발/QA" 5개로 변경 필요
  - shadcn/ui sidebar 컴포넌트가 참조 프로젝트에 존재하나, 과도하게 복잡함 (SidebarProvider, Sheet 통합, 축소 모드 등). 요구사항 범위에 비해 불필요한 복잡성이 있다.
- **Implications**: 참조 디자인의 레이아웃 구조와 스타일링 패턴을 기반으로 하되, React Router 의존성을 제거하고 Next.js App Router 패턴(layout.tsx + page.tsx)으로 변환한다. shadcn/ui sidebar 컴포넌트 대신 커스텀 경량 사이드바를 구현한다.

### Next.js 16 App Router 레이아웃 패턴
- **Context**: Next.js 16 App Router에서 사이드바 + 헤더 + 메인 콘텐츠 레이아웃의 권장 패턴을 조사하였다.
- **Sources Consulted**: Next.js 공식 문서(nextjs.org/docs/app/getting-started/layouts-and-pages)
- **Findings**:
  - `layout.tsx`는 영속적인 UI(헤더, 사이드바, 푸터, 프로바이더)에만 사용하는 것이 권장된다.
  - 레이아웃 컴포넌트는 페이지 전환 시에도 React 컴포넌트 트리를 유지하여 상태 지속성과 성능을 보장한다.
  - 중첩 레이아웃을 통해 섹션별 레이아웃을 분리할 수 있다.
  - 대시보드 레이아웃은 `(dashboard)` 라우트 그룹 또는 직접 `app/layout.tsx`에 배치할 수 있다.
- **Implications**: 루트 레이아웃(`app/layout.tsx`)에는 HTML/body/ThemeProvider만 유지하고, 대시보드 레이아웃은 별도 클라이언트 컴포넌트로 분리하여 `page.tsx`에서 조합한다. 향후 라우팅 확장 시 라우트 그룹으로 마이그레이션할 수 있도록 설계한다.

### 아이콘 라이브러리 조사
- **Context**: 5개 직군(기획/디자인/퍼블리싱/개발/QA) 카테고리에 적합한 아이콘을 선정해야 한다.
- **Sources Consulted**: lucide.dev/icons, 참조 디자인 프로젝트
- **Findings**:
  - `lucide-react`는 참조 디자인 프로젝트에서 사용 중이나, 메인 프로젝트의 `package.json`에는 등록되어 있지 않다 -> 신규 의존성 추가 필요
  - 직군별 추천 아이콘: 기획(`ClipboardList`), 디자인(`Palette`), 퍼블리싱(`Globe`), 개발(`Code`), QA(`ShieldCheck`)
  - Tree-shakable 구조로 번들 사이즈 영향 최소화
- **Implications**: `lucide-react`를 의존성으로 추가한다. 아이콘 선택은 구현 단계에서 최종 결정할 수 있으나, 인터페이스에서 `LucideIcon` 타입을 사용하여 타입 안전성을 확보한다.

### 상태 관리 전략
- **Context**: 카테고리 선택, 검색어, 모바일 메뉴 토글, 다크 모드 등 클라이언트 상태를 어떤 방식으로 관리할지 결정해야 한다.
- **Sources Consulted**: 참조 디자인 프로젝트, Next.js App Router 패턴
- **Findings**:
  - 참조 디자인은 `useState`로 로컬 상태 관리 (MainLayout에서 selectedCategory, searchQuery, isMobileMenuOpen)
  - 다크 모드는 `next-themes`가 이미 처리
  - 카테고리 선택과 검색어는 형제 컴포넌트(Sidebar, Header, MainContent) 간 공유가 필요
  - 현재 단계에서는 URL 상태(searchParams)나 전역 상태 관리 라이브러리는 불필요
- **Implications**: `useDashboardState` 커스텀 훅으로 레이아웃 관련 상태를 캡슐화한다. 향후 URL 기반 카테고리 필터링으로 확장할 때 훅 내부만 변경하면 된다.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 커스텀 경량 컴포넌트 | Sidebar/Header/MainContent를 직접 구현 | 요구사항에 정확히 맞는 구현, 번들 최소화, 학습 비용 낮음 | 고급 기능(축소 모드 등) 수동 구현 필요 | 선택됨 - 현재 요구사항 범위에 최적 |
| shadcn/ui Sidebar 컴포넌트 활용 | 참조 프로젝트의 shadcn/ui sidebar 활용 | 풍부한 기능, 접근성 내장, Sheet 모바일 대응 | radix-ui, class-variance-authority 등 추가 의존성, 과도한 복잡성 | 향후 고급 기능 필요 시 마이그레이션 가능 |

## Design Decisions

### Decision: 커스텀 경량 사이드바 vs shadcn/ui Sidebar
- **Context**: 참조 프로젝트에 shadcn/ui Sidebar 컴포넌트가 존재하나, 현재 요구사항 대비 과도한 복잡성(700+ LOC, 다수의 서브 컴포넌트, radix-ui 의존성)을 가진다.
- **Alternatives Considered**:
  1. shadcn/ui Sidebar 컴포넌트 전체 마이그레이션 - 풍부한 기능이나 현재 불필요
  2. 커스텀 경량 Sidebar 직접 구현 - 요구사항 범위에 맞는 최소 구현
- **Selected Approach**: 커스텀 경량 Sidebar 직접 구현
- **Rationale**: 현재 요구사항은 5개 카테고리 내비게이션, 활성 상태 표시, 모바일 반응형 정도이며, shadcn/ui Sidebar의 축소 모드, 키보드 단축키 토글, 쿠키 상태 저장 등은 범위 밖이다. 참조 디자인의 `Sidebar.tsx` 패턴(약 120 LOC)이 더 적합하다.
- **Trade-offs**: 향후 사이드바 축소 기능이나 고급 접근성 기능이 필요하면 추가 구현 필요. 그러나 인터페이스를 잘 정의해 두면 마이그레이션 비용을 최소화할 수 있다.
- **Follow-up**: 사이드바 요구사항이 확장될 경우 shadcn/ui 컴포넌트 도입을 재검토한다.

### Decision: 상태 관리 - 커스텀 훅 vs Context API
- **Context**: Sidebar, Header, MainContent 간 카테고리/검색 상태 공유가 필요하다.
- **Alternatives Considered**:
  1. React Context API - 프로바이더 래퍼 필요, 불필요한 리렌더링 가능성
  2. 커스텀 훅 + Prop Drilling - 레이아웃 컴포넌트에서 상태 관리 후 하위 전달
  3. URL SearchParams - SSR 친화적이나 현재 단계에서 과도
- **Selected Approach**: 커스텀 훅(`useDashboardState`) + Prop Drilling
- **Rationale**: 상태 공유 범위가 단일 레이아웃 컴포넌트 내 3개 자식 컴포넌트로 제한되어 있다. Context의 복잡성 없이 prop으로 명시적 데이터 흐름을 유지하는 것이 더 명확하다. 참조 디자인도 동일한 패턴을 사용한다.
- **Trade-offs**: 컴포넌트 깊이가 깊어지면 Prop Drilling이 번거로워질 수 있으나, 현재 깊이는 1단계이므로 문제없다.
- **Follow-up**: 상태 공유 범위가 확대되면 Context API 또는 URL 기반 상태 관리로 전환한다.

### Decision: 다크 모드 토글 위치 및 저장 방식
- **Context**: 요구사항 6.2에서 헤더에 라이트/다크 모드 전환 토글을 요구한다. 요구사항 6.4에서 로컬 저장소 저장을 요구한다.
- **Alternatives Considered**:
  1. `next-themes` `setTheme` 활용 - 이미 통합된 라이브러리, localStorage 자동 저장
  2. 직접 구현 - CSS class 토글 + localStorage 수동 관리
- **Selected Approach**: `next-themes`의 `useTheme` 훅 활용
- **Rationale**: `next-themes`가 이미 ThemeProvider로 통합되어 있고, `useTheme` 훅이 `setTheme`, `theme`, `systemTheme`을 제공한다. localStorage 저장, 시스템 테마 감지, FOUC 방지 등이 자동 처리된다.
- **Trade-offs**: `next-themes`에 대한 의존성이 생기나, 이미 프로젝트에 설치되어 있으므로 추가 비용 없음.
- **Follow-up**: 없음. 기존 인프라를 그대로 활용한다.

## Risks & Mitigations
- `lucide-react` 신규 의존성 추가 필요 -- `package.json`에 추가하고 번들 영향을 확인한다 (tree-shakable이므로 영향 최소)
- 모바일 오버레이 사이드바의 애니메이션 성능 -- CSS `transform: translateX` + `transition` 기반으로 GPU 가속 활용 (참조 디자인 패턴 검증 완료)
- 향후 Supabase 데이터 연동 시 정적 목 데이터에서 동적 데이터로 전환 필요 -- 인터페이스를 명확히 정의하여 데이터 소스 교체 시 컴포넌트 변경 최소화

## References
- [Next.js App Router Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) -- 레이아웃 패턴 참조
- [Lucide Icons](https://lucide.dev/icons/) -- 아이콘 라이브러리 조사
- [next-themes](https://github.com/pacocoursey/next-themes) -- 다크 모드 구현 참조
