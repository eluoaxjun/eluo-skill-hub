# Implementation Plan: 어드민 회원관리 — 검색 & 페이지네이션

**Branch**: `009-admin-member-management` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-admin-member-management/spec.md`
**Scope**: User Story 4 (검색) + User Story 5 (페이지네이션 개선). US1~US3은 이미 구현 완료.

## Summary

관리자 회원관리 페이지(`/admin/members`)에 검색 기능을 추가한다. 관리자는 이름 또는 이메일로 회원을 검색할 수 있으며, 검색은 debounce(300ms) 후 서버사이드에서 수행된다. 검색어와 페이지 번호는 URL 파라미터(`?q=검색어&page=번호`)로 관리되어 브라우저 뒤로 가기와 URL 공유를 지원한다. 페이지네이션은 이미 구현되어 있으며, 검색과의 연동(검색 시 1페이지 리셋)을 추가한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, Shadcn UI, @supabase/ssr 0.8.0, @supabase/supabase-js 2.98.0
**Storage**: Supabase (PostgreSQL) — profiles 테이블 ILIKE 검색
**Testing**: Playwright (E2E), Jest + React Testing Library (Unit)
**Target Platform**: Web (Vercel 배포)
**Project Type**: Web Application (Next.js App Router)
**Performance Goals**: 검색 결과 debounce 포함 1초 이내 표시, 페이지 로드 2초 이내
**Constraints**: RLS 유지, admin 역할 서버사이드 검증 필수
**Scale/Scope**: 내부 사용 (eluocnc.com 도메인 한정), 회원 수 수백~수천 명 예상

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | 검색 파라미터 타입 명시, `any` 미사용 |
| II. Clean Architecture | PASS | domain→application→infrastructure 3계층 유지. Repository에 search 파라미터 추가, Use Case에서 전달 |
| III. Test Coverage | PASS | 검색 기능 단위 테스트 + E2E 테스트 계획 포함 |
| IV. Feature Module Isolation | PASS | admin 모듈 내에서 완결. 신규 shared 의존성 없음 |
| V. Security-First | PASS | 검색은 Server Component에서 서버사이드 실행. SQL Injection은 Supabase SDK의 parameterized query로 방지 |

**Post-Design Re-check**: PASS — 모든 원칙 충족

## Project Structure

### Documentation (this feature)

```text
specs/009-admin-member-management/
├── plan.md              # This file
├── spec.md              # Feature specification (US4, US5 추가됨)
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Schema (변경 없음)
├── quickstart.md        # Phase 1: Setup guide (검색 사용법 추가)
├── contracts/
│   └── server-actions.md  # Phase 1: 기존 유지 (신규 Server Action 없음)
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── admin/
│   ├── domain/
│   │   └── types.ts                          # 수정: AdminRepository.getMembers 시그니처에 search 파라미터 추가
│   ├── application/
│   │   └── get-members-use-case.ts           # 수정: search 파라미터 전달
│   └── infrastructure/
│       └── supabase-admin-repository.ts      # 수정: getMembers에 ILIKE 검색 쿼리 추가
├── app/
│   └── admin/
│       └── members/
│           ├── page.tsx                      # 수정: searchParams에서 q 파라미터 읽기
│           └── actions.ts                    # 변경 없음
├── features/
│   └── admin/
│       ├── MemberSearch.tsx                  # 신규: 검색 입력 Client Component (debounce 300ms)
│       ├── MembersTable.tsx                  # 수정: 검색 결과 빈 상태 메시지, searchQuery prop 추가
│       └── RoleSelect.tsx                    # 변경 없음
└── shared/
    └── ui/
        └── input.tsx                         # 이미 존재 (Shadcn Input)
```

**Structure Decision**: 기존 admin 모듈 구조를 유지. 신규 파일은 `MemberSearch.tsx` 1개이며, 나머지는 기존 파일에 search 파라미터를 추가하는 수정이다. 검색은 Server Component에서 처리하므로 별도 Server Action이 필요 없다.

### Architecture: 검색 데이터 흐름

```text
[MemberSearch.tsx (Client)]
  ↓ debounce 300ms → router.push(?q=검색어&page=1)
  ↓
[page.tsx (Server Component)]
  ↓ searchParams.q, searchParams.page 읽기
  ↓
[GetMembersUseCase.execute(page, 10, search)]
  ↓
[SupabaseAdminRepository.getMembers(page, 10, search)]
  ↓ Supabase: .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  ↓
[MembersTable (props: result, roles, currentUserId, searchQuery)]
```

**핵심 결정 사항**:
- **Server Component 기반 검색**: 검색어가 URL 파라미터로 전달되면 Server Component가 리렌더링되며, 별도 API 엔드포인트나 Server Action 불필요
- **URL 파라미터 기반 상태 관리**: `useRouter().push()` + `useSearchParams()`로 구현. React state와 URL의 이중 관리 방지
- **Supabase `.or()` 메서드**: name과 email 필드에 ILIKE 검색. Supabase SDK가 parameterized query를 생성하므로 SQL Injection 안전

## Complexity Tracking

> 위반 사항 없음. 모든 설계가 Constitution 원칙을 준수한다.
