# Feature Specification: 프로젝트 환경 세팅

**Feature Branch**: `002-project-setup`
**Created**: 2026-03-03
**Status**: Draft
**Input**: 프로젝트 환경세팅 — constitution.md 기반 설정, 브랜드 컬러 (#FEFE01, #00007F, #F0F0F0) 적용, localFont 연동

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 브랜드 컬러 시스템 적용 (Priority: P1)

개발자가 새 UI 컴포넌트를 작성할 때, 헥스 코드를 직접 입력하지 않고 Eluo 브랜드
컬러 토큰(노랑 #FEFE01, 네이비 #00007F, 라이트 그레이 #F0F0F0)을 시맨틱 이름으로
사용할 수 있다. 사용자가 앱에 접속하면 브랜드 아이덴티티에 맞는 색상이 일관되게
적용된다.

**Why this priority**: 브랜드 컬러가 설계 토큰으로 등록되지 않으면 이후 모든 UI
작업에서 헥스 코드 하드코딩이 반복된다. 이 설정이 없으면 다른 모든 UI 개발이 브랜드
불일치 상태로 진행된다.

**Independent Test**: 앱의 루트 페이지를 브라우저에서 열었을 때 브랜드 컬러 세 가지가
각각 사용된 영역이 보이고, 컬러 토큰 이름으로 스타일을 변경했을 때 모든 연결된 엘리먼트에
반영된다.

**Acceptance Scenarios**:

1. **Given** 개발자가 컴포넌트를 작성 중일 때, **When** 브랜드 컬러 토큰(예: `brand-yellow`, `brand-navy`, `brand-light`)을 클래스명에 사용하면, **Then** 해당 헥스 색상(#FEFE01, #00007F, #F0F0F0)이 렌더링된다.
2. **Given** 앱이 빌드된 상태에서, **When** 사용자가 루트 페이지를 방문하면, **Then** 화면에 세 가지 브랜드 컬러가 모두 사용된 영역이 표시된다.
3. **Given** 설정 파일에서 토큰 값을 수정하면, **When** 앱을 재시작하면, **Then** 해당 토큰을 사용하는 모든 컴포넌트에 변경사항이 반영된다.

---

### User Story 2 - 로컬 폰트 설정 (Priority: P2)

사용자가 앱을 처음 방문하면 외부 CDN 없이 로컬에서 서빙되는 Pretendard Variable
폰트로 모든 텍스트가 렌더링된다. 개발자는 별도 설정 없이 모든 컴포넌트에서 동일한
폰트를 사용할 수 있다.

**Why this priority**: 폰트가 글로벌로 적용되어야 이후 모든 페이지에서 타이포그래피
일관성이 보장된다. 로컬 서빙은 성능과 브랜드 독립성 모두에 기여한다.

**Independent Test**: 브라우저 DevTools 네트워크 탭에서 외부 폰트 요청이 없고,
앱 내 모든 텍스트가 Pretendard 폰트로 렌더링됨을 확인한다.

**Acceptance Scenarios**:

1. **Given** 앱이 실행 중일 때, **When** 브라우저 네트워크 탭을 확인하면, **Then** `app/font/` 경로에서 폰트 파일이 로드되며 외부 폰트 서버 요청은 없다.
2. **Given** 새 페이지 컴포넌트를 추가할 때, **When** 별도 폰트 설정 없이 텍스트를 렌더링하면, **Then** 글로벌로 적용된 Pretendard 폰트가 사용된다.
3. **Given** JavaScript가 비활성화된 환경에서도, **When** 페이지를 로드하면, **Then** 폰트가 정상적으로 표시된다.

---

### User Story 3 - 컨스티튜션 기반 프로젝트 기반 설정 (Priority: P3)

개발자가 새 코드를 작성할 때, TypeScript strict 모드와 ESLint `any` 금지 규칙이
자동으로 동작하여 컨스티튜션 원칙 I(타입 안전성)을 빌드 타임에 강제한다. 모듈
경계 규칙을 위반하는 임포트도 Lint 단계에서 잡힌다.

**Why this priority**: 코드 품질 규칙이 자동으로 강제되지 않으면 사람이 매 PR마다
수동으로 검토해야 하며, 컨스티튜션 위반이 main에 병합될 위험이 높다.

**Independent Test**: `any` 타입이 포함된 임시 파일을 작성하고 린트를 실행하면 오류가
발생하고, 다른 도메인의 infrastructure를 직접 임포트하는 코드를 작성하면 경고가 나타난다.

**Acceptance Scenarios**:

1. **Given** 개발자가 `any` 타입을 코드에 작성했을 때, **When** 린트 또는 타입 체크를 실행하면, **Then** 오류가 발생하고 빌드가 중단된다.
2. **Given** TypeScript strict 모드가 활성화된 상태에서, **When** 타입 추론이 불가능한 값을 사용하면, **Then** 컴파일 오류가 발생한다.
3. **Given** 프로젝트 설정이 완료된 상태에서, **When** `npm run build`를 실행하면, **Then** 타입 오류 없이 빌드가 성공한다.

---

### Edge Cases

- `app/font/` 경로에 폰트 파일이 없거나 경로가 잘못된 경우 빌드 오류가 발생하는가?
- 브랜드 컬러 토큰이 기존 Tailwind 기본 색상(예: `yellow-*`)과 충돌하지 않는가?
- strict 모드 활성화로 인해 기존 코드에 타입 오류가 발생하는 경우 처리 방법은?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 프로젝트 스타일 설정 시스템은 Eluo 브랜드 컬러 토큰 세 가지(yellow: #FEFE01, navy: #00007F, light: #F0F0F0)를 시맨틱 이름으로 제공해야 한다.
- **FR-002**: 브랜드 컬러 토큰은 텍스트, 배경, 보더 등 모든 UI 영역에서 일관되게 사용 가능해야 한다.
- **FR-003**: 글로벌 폰트 설정은 `app/font/` 경로에 위치한 폰트 파일을 로컬로 서빙해야 하며, 외부 CDN에 의존해서는 안 된다.
- **FR-004**: 폰트는 Next.js `localFont` 방식으로 등록되어 앱 전체에 글로벌로 적용되어야 한다.
- **FR-005**: TypeScript 컴파일러는 strict 모드로 동작해야 하며, `any` 타입 사용 시 오류를 발생시켜야 한다.
- **FR-006**: ESLint 설정은 `@typescript-eslint/no-explicit-any` 규칙을 오류 수준으로 활성화해야 한다.
- **FR-007**: 프로젝트는 컨스티튜션의 기술 스택(NextJS App Router, TypeScript, Supabase MCP, Jest + RTL, Playwright, Tailwind CSS + shadcn/ui)을 모두 포함한 의존성 환경을 갖춰야 한다.
- **FR-008**: 루트 페이지(`/`)는 브랜드 컬러 세 가지가 모두 사용된 기본 레이아웃을 표시해야 한다.

### Assumptions

- `app/font/` 경로에 Pretendard Variable 폰트 파일(`.woff2` 포맷)이 이미 존재한다고 가정한다.
- 기존 코드베이스가 이미 Next.js App Router 구조로 초기화되어 있다고 가정한다.
- Tailwind CSS가 이미 설치되어 있으며, 설정 파일이 존재한다고 가정한다.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 브랜드 컬러 세 가지가 Tailwind 토큰으로 등록되어, 개발자가 클래스명만으로 정확한 브랜드 색상을 사용할 수 있다.
- **SC-002**: 앱 방문 시 폰트 로드가 외부 네트워크 요청 없이 완료되며, First Contentful Paint 시 이미 올바른 폰트가 적용되어 있다(폰트 깜빡임 없음).
- **SC-003**: `any` 타입이 포함된 코드는 빌드 파이프라인의 타입 체크/린트 단계에서 100% 차단된다.
- **SC-004**: 설정 완료 후 `npm run build`가 타입 오류 없이 성공하고, 루트 페이지에서 브랜드 컬러와 로컬 폰트가 모두 적용된 상태로 렌더링된다.
