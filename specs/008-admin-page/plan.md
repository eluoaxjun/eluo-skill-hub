# Implementation Plan: 어드민 페이지

**Branch**: `008-admin-page` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-admin-page/spec.md`

## Summary

관리자 전용 어드민 페이지(`/admin`)를 구현한다. role 기반 접근제어(admin/user), 글래스모피즘 사이드바 레이아웃, 대시보드(요약 카드 + 최근 목록), 회원 관리·스킬 관리·피드백 관리 탭(목록 조회 전용)을 포함한다. 기존 Supabase 테이블(profiles, roles, skills, skill_feedback_logs, categories)을 활용하며 스키마 변경 없이 구현한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, Tailwind CSS v4, Shadcn UI, Radix UI, lucide-react, @supabase/ssr ^0.8.0, @supabase/supabase-js ^2.98.0
**Storage**: Supabase (PostgreSQL) — profiles, roles, skills, categories, skill_feedback_logs, bookmarks 테이블 (모두 RLS 활성)
**Testing**: Jest + React Testing Library (단위), Playwright (E2E)
**Target Platform**: Web (Vercel 배포)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 대시보드 초기 로드 2초 이내, 탭 전환 1초 이내
**Constraints**: 서버사이드 role 검증 필수, RLS 기반 데이터 접근
**Scale/Scope**: 관리자 1~5명, 회원 수백~수천 명 규모

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | 모든 엔티티, props, 함수에 명시적 타입 사용. `any` 금지 |
| II. Clean Architecture | PASS | `src/admin/` 모듈에 domain/application/infrastructure 레이어 분리 |
| III. Test Coverage | PASS | 도메인 로직 단위 테스트 + E2E 테스트 작성 |
| IV. Feature Module Isolation | PASS | `src/admin/` 독립 모듈, `src/features/admin/` UI 컴포넌트 |
| V. Security-First | PASS | 미들웨어 + 서버 컴포넌트에서 role 검증, RLS 활용 |
| Tech Stack | PASS | 기존 스택 변경 없음 |

## Project Structure

### Documentation (this feature)

```text
specs/008-admin-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── admin-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── admin/
│       ├── layout.tsx           # 어드민 레이아웃 (사이드바 + 메인, role 검증)
│       ├── page.tsx             # 대시보드 탭 (/admin)
│       ├── members/
│       │   └── page.tsx         # 회원 관리 탭 (/admin/members)
│       ├── skills/
│       │   └── page.tsx         # 스킬 관리 탭 (/admin/skills)
│       └── feedbacks/
│           └── page.tsx         # 피드백 관리 탭 (/admin/feedbacks)
│
├── admin/                       # Admin bounded context
│   ├── domain/
│   │   └── types.ts             # Admin 도메인 타입 (DashboardStats, MemberRow 등)
│   ├── application/
│   │   ├── get-dashboard-stats-use-case.ts
│   │   ├── get-members-use-case.ts
│   │   ├── get-skills-use-case.ts
│   │   ├── get-feedbacks-use-case.ts
│   │   └── __tests__/           # Use case 단위 테스트
│   └── infrastructure/
│       └── supabase-admin-repository.ts  # Supabase 쿼리 구현
│
├── features/
│   └── admin/
│       ├── AdminSidebar.tsx     # 사이드바 네비게이션 컴포넌트
│       ├── AdminHeader.tsx      # 헤더 컴포넌트 (제목, 검색, 알림)
│       ├── DashboardContent.tsx # 대시보드 메인 콘텐츠
│       ├── SummaryCard.tsx      # 요약 카드 컴포넌트
│       ├── RecentSkillsList.tsx # 최근 스킬 목록
│       ├── RecentMembersTable.tsx # 최근 회원 테이블
│       ├── MembersTable.tsx     # 회원 관리 전체 테이블
│       ├── SkillsTable.tsx      # 스킬 관리 전체 테이블
│       ├── FeedbacksTable.tsx   # 피드백 관리 전체 테이블
│       ├── AccessDenied.tsx     # 비관리자 접근 거부 안내
│       └── __tests__/           # 컴포넌트 단위 테스트
│
├── __tests__/
│   └── e2e/
│       └── admin.spec.ts        # E2E 테스트
│
└── proxy.ts                     # 미들웨어 (admin 라우트 보호 로직 추가)
```

**Structure Decision**: Next.js App Router의 파일시스템 라우팅을 활용하여 `/admin` 하위 라우트를 구성한다. Clean Architecture 원칙에 따라 `src/admin/` 모듈에 domain/application/infrastructure 레이어를 분리하고, UI 컴포넌트는 `src/features/admin/`에 배치한다.

## Complexity Tracking

> No constitution violations. No entries needed.
