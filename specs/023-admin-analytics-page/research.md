# Research: 어드민 통계분석 페이지

**Branch**: `023-admin-analytics-page` | **Date**: 2026-03-06

## R-001: 차트 라이브러리 선택

**Decision**: Shadcn UI Charts (Recharts 기반) 사용

**Rationale**:
- Shadcn UI는 `npx shadcn@latest add chart`로 Recharts 기반 차트 컴포넌트를 제공
- 프로젝트의 기존 Shadcn UI 컴포넌트 시스템과 일관성 유지
- Tailwind CSS v4 CSS 변수 기반 테마와 자동 통합
- 별도 차트 라이브러리 설치 없이 Shadcn 생태계 내에서 해결

**Alternatives considered**:
- Recharts 직접 사용: Shadcn wrapper가 테마 통합을 자동 처리하므로 불필요
- Chart.js / Nivo / Victory: 추가 의존성이며 Shadcn 생태계와 스타일 불일치
- Tremor: React 19 호환성 이슈 가능성

## R-002: 날짜 유틸리티 라이브러리

**Decision**: date-fns 사용

**Rationale**:
- 트리 셰이킹 가능한 모듈식 구조로 번들 사이즈 최소화
- TypeScript 타입 안전성 기본 제공
- 기간 계산(subDays, startOfDay, endOfDay), 포매팅(format) 등 필요한 기능 제공

**Alternatives considered**:
- dayjs: 가볍지만 트리 셰이킹 미지원
- 네이티브 Date API: 기간 계산 로직 직접 구현 필요, 코드 복잡도 증가

## R-003: 데이터 집계 전략

**Decision**: Supabase PostgreSQL 서버 사이드 집계 (SQL 레벨)

**Rationale**:
- event_logs 테이블이 성장함에 따라 클라이언트 사이드 집계는 비효율적
- PostgreSQL의 GROUP BY, COUNT, DATE_TRUNC 등으로 효율적 집계 가능
- Supabase RPC (PostgreSQL 함수) 활용하여 복잡 집계 쿼리 최적화
- Next.js Server Component에서 서버 사이드 데이터 페칭으로 초기 로딩 최적화

**Alternatives considered**:
- 클라이언트 사이드 집계: 데이터 증가 시 성능 저하, 네트워크 비용 증가
- 사전 집계 테이블 (materialized view): 현재 데이터 규모에서는 오버엔지니어링

## R-004: 기간 필터 상태 관리

**Decision**: URL 검색 파라미터(searchParams) + React Query 기반 관리

**Rationale**:
- URL에 기간 정보를 포함하여 공유 가능한 링크 생성
- Next.js App Router의 searchParams 패턴과 일치
- React Query의 쿼리 키에 기간을 포함하여 자동 캐싱/리패칭
- 기존 admin 페이지의 패턴(HydrationBoundary + React Query)과 일관성 유지

**Alternatives considered**:
- useState 로컬 상태: 페이지 새로고침 시 필터 초기화, URL 공유 불가
- Zustand/Jotai: 추가 상태 관리 라이브러리 불필요, URL 기반이 더 적합

## R-005: Supabase RPC 함수 필요 여부

**Decision**: Supabase JS SDK의 기본 쿼리 빌더 + 필요 시 RPC 함수 추가

**Rationale**:
- 간단한 집계(COUNT, GROUP BY)는 Supabase JS SDK의 `.select()`, `.eq()`, `.gte()`, `.lte()`로 처리 가능
- 복잡한 집계(일별 추이, 이전 기간 대비 증감률)는 PostgreSQL 함수(RPC)로 구현하여 성능 최적화
- RPC 함수는 DB 레벨에서 실행되므로 네트워크 왕복 최소화

**Alternatives considered**:
- 전부 SDK 쿼리 빌더: 복잡 집계 시 다수의 API 호출 필요
- 전부 RPC: 간단한 쿼리도 함수화하면 관리 복잡도 증가

## R-006: 스킬 이름 조인 전략

**Decision**: event_logs.properties->skill_id를 skills 테이블과 조인하여 스킬 이름 표시

**Rationale**:
- skill.view, skill.template_download 이벤트의 properties에 skill_id가 포함됨
- 스킬 이름을 표시하려면 skills 테이블과 조인 필요
- PostgreSQL RPC 함수에서 조인 처리하여 단일 쿼리로 해결

**Alternatives considered**:
- 클라이언트 사이드 조인: 스킬 목록 별도 API 호출 필요, 비효율적
- event_logs에 스킬 이름 저장: 비정규화, 스킬 이름 변경 시 불일치
