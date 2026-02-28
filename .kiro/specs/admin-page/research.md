# Research & Design Decisions

---
**Purpose**: 어드민 페이지 기능의 기술 설계를 위한 탐색 결과, 아키텍처 조사 및 의사결정 근거를 기록한다.
---

## Summary
- **Feature**: `admin-page`
- **Discovery Scope**: Extension (기존 `user-account` 바운디드 컨텍스트 확장)
- **Key Findings**:
  - Supabase RLS에서 동일 테이블의 컬럼을 참조하는 정책은 `SECURITY DEFINER` 함수를 통해 우회해야 순환 참조를 방지할 수 있다.
  - Next.js 미들웨어는 Edge Runtime에서 실행되므로 DB 조회가 어렵다. 역할 기반 접근 제어는 서버 컴포넌트/레이아웃 레벨에서 수행하는 것이 적합하다.
  - 기존 `UserProfile` 엔티티, `UserRepository` 인터페이스, `SupabaseUserRepository` 구현체가 이미 존재하여 `role` 속성 확장만으로 대부분의 도메인 요구사항을 충족할 수 있다.

## Research Log

### Supabase RLS 관리자 역할 정책 패턴
- **Context**: 요구사항 5에서 관리자만 전체 사용자 프로필을 조회/수정할 수 있는 RLS 정책을 요구한다. `profiles` 테이블의 `role` 컬럼을 RLS 정책 내에서 직접 참조하면 순환 참조 문제가 발생할 수 있다.
- **Sources Consulted**:
  - [Supabase Custom Claims & RBAC 공식 문서](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
  - [Setting Up RLS for User and Admin Roles (DEV Community)](https://dev.to/shahidkhans/setting-up-row-level-security-in-supabase-user-and-admin-2ac1)
  - [Supabase RLS 공식 문서](https://supabase.com/docs/guides/database/postgres/row-level-security)
- **Findings**:
  - `SECURITY DEFINER` 함수를 사용하여 RLS를 우회하는 관리자 확인 함수를 생성하는 것이 권장 패턴이다.
  - `is_admin(user_id UUID) RETURNS BOOLEAN` 형태의 함수를 생성하고, RLS 정책에서 이 함수를 호출하여 관리자 여부를 확인한다.
  - `SECURITY DEFINER` 함수는 RLS 정책을 우회하므로 `search_path`를 빈 문자열로 설정하여 보안을 강화해야 한다.
  - 기존 프로젝트의 `handle_new_user()` 트리거 함수도 동일한 패턴(`SECURITY DEFINER SET search_path = ''`)을 사용하고 있어 일관성이 유지된다.
- **Implications**: 관리자 확인을 위한 별도의 PostgreSQL 함수가 필요하며, 이 함수를 기존 RLS 정책과 함께 사용한다.

### Next.js 미들웨어 vs 서버 컴포넌트 역할 확인
- **Context**: `/admin` 경로에 대한 역할 기반 접근 제어를 미들웨어에서 할지, 서버 컴포넌트/레이아웃에서 할지 결정해야 한다.
- **Sources Consulted**:
  - [Next.js Middleware Authentication: Protecting Routes in 2025](https://www.hashbuilds.com/articles/next-js-middleware-authentication-protecting-routes-in-2025)
  - [How to Use Middleware for RBAC in Next.js 15 App Router](https://www.jigz.dev/blogs/how-to-use-middleware-for-role-based-access-control-in-next-js-15-app-router)
- **Findings**:
  - 미들웨어는 Edge Runtime에서 실행되어 Supabase DB 직접 조회가 제한적이다.
  - 인증 여부 확인(auth.getUser)은 미들웨어에서 가능하지만, `profiles` 테이블의 `role` 컬럼 조회는 서버 컴포넌트에서 수행하는 것이 안정적이다.
  - 기존 미들웨어는 이미 인증 여부 확인과 리다이렉트를 처리하고 있으므로, 비인증 사용자의 `/admin` 접근은 이미 `/login`으로 리다이렉트된다.
  - 역할 확인은 `/admin` 레이아웃의 서버 컴포넌트에서 수행하고, 비관리자에게는 접근 불가 안내를 렌더링하는 방식이 적합하다.
- **Implications**: 미들웨어 수정 없이 기존 인증 흐름을 활용하고, `/admin` 라우트 그룹의 레이아웃에서 역할 확인을 수행한다.

### 기존 코드베이스 패턴 분석
- **Context**: 기존 DDD 3계층 아키텍처 패턴과의 일관성을 유지해야 한다.
- **Findings**:
  - `UserProfile` 엔티티: `Entity<string>` 기반, `create()`/`reconstruct()` 정적 팩토리 패턴 사용
  - `UserRepository` 인터페이스: `findById()`, `update()` 메서드 정의
  - `SupabaseUserRepository`: `SupabaseClient` 주입, `profiles` 테이블 직접 쿼리
  - Server Actions: `createSupabaseServerClient()`로 서버 클라이언트 생성 후 리포지토리 주입
  - UI: `@/components/ui/` 공유 컴포넌트(shadcn/ui), Tailwind CSS 스타일링
  - 기존 마이그레이션: `supabase/migrations/` 디렉토리에 SQL 파일로 관리
- **Implications**: 동일한 패턴을 따라 `role` 확장 및 신규 유스케이스를 구현한다.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 기존 DDD 3계층 확장 | `user-account` 컨텍스트 내에서 역할 관련 도메인/유스케이스 추가 | 기존 패턴과 일관성, 최소 변경 범위 | 관리 기능이 커지면 별도 컨텍스트 분리 필요 가능 | 현재 규모에 적합 |
| 별도 admin 바운디드 컨텍스트 | `src/admin/` 독립 모듈 생성 | 관심사 완전 분리 | 과도한 분리, 기존 UserProfile 중복 | 규모가 커질 때 고려 |

## Design Decisions

### Decision: `user-account` 컨텍스트 내 역할 관리 확장
- **Context**: 관리자 역할 관리를 어디에 배치할 것인가
- **Alternatives Considered**:
  1. 별도 `admin` 바운디드 컨텍스트 생성
  2. 기존 `user-account` 컨텍스트 확장
- **Selected Approach**: 기존 `user-account` 컨텍스트를 확장하여 `role` 속성 추가 및 관리 유스케이스 배치
- **Rationale**: 역할은 사용자의 본질적 속성이며, 현재 관리 기능 범위가 사용자 관리에 한정되어 있어 별도 컨텍스트 분리는 과도하다.
- **Trade-offs**: 향후 관리 기능이 대폭 확장되면 컨텍스트 분리를 재검토해야 한다.
- **Follow-up**: 관리 기능이 스킬 관리, 통계 등으로 확장될 때 별도 컨텍스트 분리 여부 재검토

### Decision: SECURITY DEFINER 함수 기반 RLS 관리자 정책
- **Context**: `profiles` 테이블 RLS 정책에서 동일 테이블의 `role` 컬럼 참조 시 순환 참조 방지
- **Alternatives Considered**:
  1. JWT 커스텀 클레임에 역할 포함 (Supabase Auth Hook)
  2. 별도 `user_roles` 테이블 분리
  3. `SECURITY DEFINER` 함수를 통한 역할 확인
- **Selected Approach**: `SECURITY DEFINER` 함수(`is_admin`)를 생성하여 RLS 정책에서 호출
- **Rationale**: 가장 간단한 구현이면서 기존 프로젝트 패턴(`handle_new_user` 함수)과 일관성을 유지한다. JWT 클레임 방식은 Auth Hook 설정이 추가로 필요하고, 별도 테이블은 불필요한 복잡도를 추가한다.
- **Trade-offs**: 역할 변경 시 실시간 반영(JWT 재발급 불필요), 함수 호출 오버헤드 미미
- **Follow-up**: 역할 종류가 증가하면 JWT 클레임 방식으로의 마이그레이션 검토

### Decision: 서버 컴포넌트 레이아웃에서 역할 확인
- **Context**: `/admin` 경로 접근 시 관리자 역할 확인 위치 결정
- **Alternatives Considered**:
  1. 미들웨어에서 역할 확인 및 리다이렉트
  2. 서버 컴포넌트(레이아웃)에서 역할 확인
- **Selected Approach**: `/admin` 라우트 그룹의 `layout.tsx` 서버 컴포넌트에서 역할 확인
- **Rationale**: 미들웨어는 Edge Runtime 제약으로 DB 조회가 불안정할 수 있다. 기존 미들웨어가 인증 여부 리다이렉트를 이미 처리하므로, 역할 확인은 레이아웃에서 수행하고 비관리자에게 접근 불가 UI를 렌더링한다.
- **Trade-offs**: 비관리자가 `/admin` 접근 시 리다이렉트 대신 안내 메시지 페이지가 렌더링된다(요구사항 2.4와 일치).
- **Follow-up**: 없음

## Risks & Mitigations
- **관리자 전원 역할 해제 위험** -- 자기 자신의 역할 변경을 UI 및 유스케이스 레벨에서 차단하고, 최소 1명의 관리자가 유지되도록 도메인 규칙을 적용한다.
- **RLS 정책 누락으로 인한 데이터 노출** -- 마이그레이션 스크립트에 기존 정책 유지를 명시하고, 관리자 정책을 추가적으로 적용한다.
- **초기 관리자 설정 실패** -- 마이그레이션에서 `jrlee@eluocnc.com` 계정이 아직 미가입 상태일 수 있으므로, 해당 이메일이 가입 시 자동으로 admin 역할이 부여되도록 트리거를 보완하거나, 마이그레이션 시점에 존재하는 계정만 업데이트하고 미존재 시 경고를 남긴다.

## References
- [Supabase Custom Claims & RBAC 공식 문서](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) -- 역할 기반 접근 제어 구현 패턴
- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/database/postgres/row-level-security) -- Row Level Security 기본 개념 및 정책 작성법
- [Setting Up RLS for User and Admin Roles (DEV Community)](https://dev.to/shahidkhans/setting-up-row-level-security-in-supabase-user-and-admin-2ac1) -- SECURITY DEFINER 함수를 활용한 관리자 RLS 정책 구현 예제
- [Next.js Middleware Authentication (HashBuilds)](https://www.hashbuilds.com/articles/next-js-middleware-authentication-protecting-routes-in-2025) -- Next.js 미들웨어 인증 패턴
