# Technology Stack

## Architecture

Domain-Driven Design (DDD) 기반 3계층 아키텍처를 채택한다.
바운디드 컨텍스트별로 모듈을 분리하며, 컨텍스트 간 통신은 도메인 이벤트를 사용한다.

```
domain (순수 비즈니스 로직, 외부 의존성 금지)
  ↑
application (유스케이스, 도메인 오케스트레이션)
  ↑
infrastructure (DB, API, 외부 서비스 어댑터)
```

## Core Technologies

- **Language**: TypeScript (strict mode, `any` 타입 금지)
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Node.js 20+
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS v4

## Key Libraries

| 라이브러리 | 용도 |
|---|---|
| `@supabase/supabase-js` | Supabase 클라이언트 (DB, Auth, Storage) |
| `react` / `react-dom` v19 | UI 렌더링 |
| `next` v16 | 풀스택 프레임워크 |

## Development Standards

### Type Safety
- TypeScript strict mode 활성화
- `any` 타입 사용 절대 금지 — `unknown` 또는 명시적 타입 사용
- 가능한 한 인터페이스 기반으로 계약 정의

### Code Quality
- ESLint (eslint-config-next) 기반 린팅
- Tailwind CSS v4 유틸리티 클래스 기반 스타일링

### Testing
- **Unit**: Jest + ts-jest (도메인/애플리케이션 계층)
- **Component**: React Testing Library (UI 컴포넌트)
- **E2E**: Playwright (사용자 시나리오)

## Development Environment

### Required Tools
- Node.js 20+
- npm (패키지 매니저)
- Supabase CLI (선택)

### Common Commands
```bash
# Dev: npm run dev
# Build: npm run build
# Test: npm run test
# Test (watch): npm run test:watch
# Test (coverage): npm run test:coverage
# Test (E2E): npm run test:e2e
# Lint: npm run lint
```

## Key Technical Decisions

| 결정 | 근거 |
|---|---|
| DDD 3계층 | 비즈니스 로직과 인프라 분리, 테스트 용이성 확보 |
| Supabase MCP | AI 에이전트가 DB를 직접 조작 가능, 별도 ORM 불필요 |
| Next.js App Router | 서버 컴포넌트 기반 성능 최적화, 파일 기반 라우팅 |
| Aggregate Root 패턴 | 데이터 일관성 보장, 도메인 불변식 강제 |
| 도메인 이벤트 | 바운디드 컨텍스트 간 느슨한 결합 |

---
_Document standards and patterns, not every dependency_
