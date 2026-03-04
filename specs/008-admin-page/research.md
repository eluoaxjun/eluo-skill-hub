# Research: 어드민 페이지

**Feature Branch**: `008-admin-page`
**Date**: 2026-03-04

## R-001: Admin 라우트 접근제어 패턴

**Decision**: Next.js App Router의 Server Component layout에서 Supabase 세션 확인 + profiles/roles 조인으로 role 검증. 미들웨어(proxy.ts)에서 비인증 사용자 리다이렉트.

**Rationale**:
- Server Component에서 직접 role 검증하면 RLS와 함께 이중 보안 확보
- 미들웨어는 인증 여부만 빠르게 확인하고, 세부 role 판별은 layout 서버 컴포넌트에서 수행
- 기존 proxy.ts 패턴과 일관성 유지

**Alternatives considered**:
- 미들웨어에서 role까지 체크: 미들웨어에서 profiles 조인 쿼리 필요 → 불필요한 복잡도 증가
- API Route 기반 접근제어: App Router 서버 컴포넌트로 충분, 별도 API 불필요

## R-002: 대시보드 집계 쿼리 패턴

**Decision**: Supabase의 `count` 옵션(`{ count: 'exact', head: true }`)을 사용하여 각 테이블 행 수를 효율적으로 조회. 최근 목록은 `order('created_at', { ascending: false }).limit(5)`.

**Rationale**:
- `head: true`는 실제 데이터를 전송하지 않고 카운트만 반환하여 성능 최적화
- Supabase JS SDK가 PostgreSQL `COUNT(*)` 를 자동 생성
- 기존 RLS 정책이 admin에게 전체 조회 권한을 이미 부여 (profiles 테이블의 `is_admin` 정책)

**Alternatives considered**:
- PostgreSQL Function 사용: 오버엔지니어링, SDK로 충분
- 클라이언트에서 전체 데이터 로드 후 카운트: 비효율적

## R-003: 사이드바 네비게이션 구현 패턴

**Decision**: Next.js App Router의 `layout.tsx`에서 사이드바를 렌더링하고, `usePathname()` 훅으로 현재 경로를 감지하여 활성 탭을 하이라이트. 사이드바는 Client Component로 분리.

**Rationale**:
- layout.tsx는 하위 라우트 전환 시 리렌더링되지 않아 사이드바가 유지됨
- `usePathname()`은 클라이언트 사이드에서 현재 URL을 추적하는 표준 방법
- `<Link>` 컴포넌트로 클라이언트 사이드 네비게이션 지원

**Alternatives considered**:
- 탭 상태를 React state로 관리: URL과 동기화 이슈 발생 가능
- Server Component에서 `headers()`로 경로 파악: 클라이언트 네비게이션 시 업데이트 안 됨

## R-004: 데이터 모델 활용

**Decision**: 기존 Supabase 테이블을 그대로 활용한다. 스키마 변경 없음.

**Rationale**:
- `profiles` (3 rows), `roles` (2 rows), `skills` (2 rows), `categories` (5 rows), `skill_feedback_logs` (0 rows), `bookmarks` (0 rows) 테이블이 이미 존재
- RLS가 모든 테이블에 활성화되어 있음
- `is_admin()` 함수로 admin 여부 확인 가능
- skills 테이블의 필드명은 `title` (spec의 `name`이 아님) → 타입 정의 시 실제 스키마 반영

**Alternatives considered**:
- 별도 admin_dashboard_stats 뷰 생성: 현재 규모에서 불필요
- feedbacks 별도 테이블 생성: `skill_feedback_logs` 테이블이 이미 존재

## R-005: 비관리자 접근 거부 UI 패턴

**Decision**: `/admin/layout.tsx`에서 role 확인 후, admin이 아니면 `AccessDenied` 컴포넌트를 children 대신 렌더링. `/dashboard`로 이동하는 버튼 포함.

**Rationale**:
- layout 레벨에서 처리하면 모든 `/admin/*` 하위 라우트에 일괄 적용
- 에러 페이지가 아닌 안내 페이지로 UX 개선
- 리다이렉트가 아닌 안내 + 버튼 방식은 spec 요구사항과 일치

**Alternatives considered**:
- `redirect()` 함수로 즉시 리다이렉트: spec에서 안내 메시지 + 버튼 요구
- 별도 middleware 분기: layout에서 처리하는 것이 더 간결

## R-006: 목록 테이블 페이지네이션

**Decision**: 서버사이드 페이지네이션 (`.range(from, to)`) 사용. 페이지당 10건.

**Rationale**:
- 데이터 규모가 커질 수 있으므로 서버사이드 페이지네이션 필수
- Supabase의 `.range()` 메서드가 PostgreSQL `OFFSET`/`LIMIT` 매핑
- URL 쿼리 파라미터(`?page=2`)로 페이지 상태 관리

**Alternatives considered**:
- 무한 스크롤: 관리자 테이블에서는 전체 데이터 파악이 중요하므로 페이지네이션이 적합
- 클라이언트 사이드 필터링: 데이터 증가 시 성능 저하
