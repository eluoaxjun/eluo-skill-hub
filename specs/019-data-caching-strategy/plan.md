# Implementation Plan: 데이터 캐싱 전략 수립 및 최적화

**Feature Branch**: `019-data-caching-strategy`
**Created**: 2026-03-04

## Technical Context

### Tech Stack

- **Framework**: Next.js 16.1.6 (App Router) with React 19.2.3
- **Language**: TypeScript 5 (strict mode, `any` 금지)
- **Styling**: Tailwind CSS v4, Shadcn UI
- **Database**: Supabase (PostgreSQL) via `@supabase/ssr` + `@supabase/supabase-js`
- **Deploy**: Vercel

### Architecture

- **Clean Architecture**: domain → application → infrastructure 레이어 분리
- **Server Components**: 페이지 수준 데이터 페칭 (SSR)
- **Server Actions**: 클라이언트 → 서버 mutation 패턴
- **Repository Pattern**: `Supabase*Repository` 클래스들이 DB 접근 담당

## Implementation Approach

이 피처는 새 파일 생성 없이 **기존 파일 수정만** 수행하는 최적화 작업이다.

### 변경 대상 파일

1. **`src/app/(portal)/dashboard/page.tsx`** — 순차 쿼리를 `Promise.all`로 병렬화
2. **`src/app/(portal)/dashboard/actions.ts`** — `submitFeedbackAction`, `submitFeedbackReplyAction`에 `revalidatePath` 추가
3. **`src/app/(portal)/layout.tsx`** — 사용자 역할 조회 추가, 하위 컴포넌트에 전달
4. **`src/features/dashboard/DashboardLayoutClient.tsx`** — `isViewer` prop 수신
5. **`src/features/dashboard/DashboardSkillGrid.tsx`** — 레이아웃에서 전달받은 `isViewer` 사용
6. **`src/app/(portal)/dashboard/page.tsx`** — 역할 조회 제거 (레이아웃으로 이동)

### 새 의존성

없음 — 기존 라이브러리만 사용

### DB 스키마 변경

없음

## Constitution Check

- `any` 타입 사용 금지 ✅ (사용하지 않음)
- Clean Architecture 레이어 경계 유지 ✅ (기존 패턴 유지)
- 커밋 컨벤션 준수 ✅ (`feat:` prefix)
