# Implementation Plan: 어드민 스킬관리 페이지 디자인

**Branch**: `010-admin-skill-management` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-admin-skill-management/spec.md`

## Summary

기존 어드민 스킬 관리 페이지의 테이블 레이아웃을 HTML 레퍼런스(`stitch-html/admin-skills.html`)의 카드 그리드 디자인으로 전환하고, 디바운스 검색 및 상태별 필터 탭 기능을 추가한다. 기존 Clean Architecture 패턴(도메인 → 애플리케이션 → 인프라)을 유지하며, 회원관리 페이지의 검색 패턴을 재사용한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, Tailwind CSS v4, Shadcn UI, Radix UI, lucide-react 0.576.0, @supabase/ssr ^0.8.0, @supabase/supabase-js ^2.98.0
**Storage**: Supabase (PostgreSQL) — `skills` 테이블 (categories FK), RLS 활성
**Testing**: Playwright (E2E) + React Testing Library (Unit)
**Target Platform**: Web (Next.js on Vercel)
**Project Type**: Web application (Admin 모듈)
**Performance Goals**: 카드 그리드 렌더링 1초 이내, 검색 결과 반영 0.5초 이내
**Constraints**: DB 스키마 변경 없음, 기존 페이지네이션 유지
**Scale/Scope**: 관리자 전용 페이지, 스킬 수십~수백 건 규모

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | 모든 새 컴포넌트/타입에 명시적 타입 적용. `any` 사용 없음. `SkillStatusFilter` 타입 정의. |
| II. Clean Architecture | PASS | 도메인(types.ts) → 애플리케이션(use case) → 인프라(repository) 순 변경. UI 컴포넌트는 `src/features/admin/`에 배치. |
| III. Test Coverage | PASS | 새 컴포넌트(SkillCard, SkillSearch, SkillStatusFilter) 단위 테스트 + E2E 스킬 관리 플로우 테스트 작성. |
| IV. Feature Module Isolation | PASS | admin 모듈 내부에서만 변경. 다른 모듈 의존성 없음. |
| V. Security-First | PASS | 기존 admin 레이아웃의 서버 사이드 role 검증 유지. RLS 기존 정책 사용. |
| Tech Stack | PASS | 신규 의존성 없음. 기존 스택만 사용. |

## Project Structure

### Documentation (this feature)

```text
specs/010-admin-skill-management/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── admin/
│   ├── domain/
│   │   └── types.ts                          # SkillRow 확장, SkillStatusFilter 추가
│   ├── application/
│   │   └── get-skills-use-case.ts            # search, status 파라미터 추가
│   └── infrastructure/
│       └── supabase-admin-repository.ts      # getSkills 쿼리 확장
├── app/admin/skills/
│   └── page.tsx                              # searchParams 처리 확장
└── features/admin/
    ├── SkillsCardGrid.tsx                    # 신규: 카드 그리드 컨테이너
    ├── SkillCard.tsx                         # 신규: 개별 스킬 카드
    ├── SkillSearch.tsx                       # 신규: 검색 입력 (MemberSearch 패턴)
    ├── SkillStatusFilter.tsx                 # 신규: 상태 필터 탭
    └── SkillsTable.tsx                       # 삭제 대상 (카드 그리드로 대체)
```

**Structure Decision**: 기존 admin 모듈 구조(domain/application/infrastructure + features/admin)를 그대로 유지. 신규 UI 컴포넌트 4개를 `src/features/admin/`에 추가하고, 기존 `SkillsTable.tsx`를 `SkillsCardGrid.tsx`로 대체한다.

## Phase 0: Research Summary

연구 결과는 [research.md](./research.md) 참조. 주요 결정:

| ID | Decision | Rationale |
|----|----------|-----------|
| R-001 | DB `active`/`inactive` → UI Published/Draft 매핑 | DB 스키마 변경 불필요 |
| R-002 | MemberSearch 패턴 재사용 (URL params + 300ms 디바운스) | 검증된 기존 패턴 |
| R-003 | categories.icon 필드 활용 | DB에 이미 아이콘 데이터 존재 |
| R-004 | URL param `status`로 서버 사이드 필터링 | 검색과 일관된 방식 |
| R-005 | Tailwind 유틸리티로 glass-card 구현 | 추가 의존성 불필요 |
| R-006 | AdminRepository.getSkills() 시그니처 확장 | Clean Architecture 패턴 유지 |
| R-007 | SkillRow에 categoryIcon 필드 추가 | 카드 아이콘 표시 지원 |

## Phase 1: Design

### 1.1 데이터 모델 변경

상세 내용은 [data-model.md](./data-model.md) 참조.

**핵심 변경**:
- `SkillRow` 인터페이스에 `categoryIcon: string` 추가
- `SkillStatusFilter` 타입 추가: `'all' | 'active' | 'inactive'`
- `AdminRepository.getSkills()` 시그니처: `(page, pageSize, search?, status?)` 로 확장

### 1.2 컴포넌트 설계

#### SkillsCardGrid (Server → Client boundary)

```
Props:
  - result: PaginatedResult<SkillRow>
  - searchQuery?: string
  - statusFilter: SkillStatusFilter
  - searchInput: React.ReactNode (Suspense 래핑된 SkillSearch)

Renders:
  - 페이지 헤더 (제목 + 부제 + SkillStatusFilter)
  - SkillSearch (slot으로 주입)
  - 카드 그리드 (3/2/1열 반응형)
  - 각 카드: SkillCard 컴포넌트
  - 마지막: "새 스킬 추가하기" 플레이스홀더 카드
  - 하단: 페이지네이션 (기존 패턴 유지)
```

#### SkillCard

```
Props:
  - skill: SkillRow

Renders:
  - 카테고리 아이콘 (categoryIcon 기반 lucide 아이콘, 카테고리별 배경색)
  - 상태 뱃지 (Published: green, Draft: slate)
  - 스킬명 (font-bold)
  - 설명 (line-clamp-2)
  - 카테고리명
  - 수정/삭제 버튼
  - glass-card 스타일 + 호버 애니메이션
```

#### SkillSearch (Client Component)

```
패턴: MemberSearch와 동일
- 300ms 디바운스
- URL param: q
- page를 1로 리셋
- placeholder: "스킬명 또는 설명으로 검색"
```

#### SkillStatusFilter (Client Component)

```
Props:
  - currentStatus: SkillStatusFilter

Renders:
  - 3개 탭 버튼: 전체 / 배포됨 / 초안
  - 활성 탭: bg-primary text-white
  - 비활성 탭: text-slate-500 hover:text-primary
  - 클릭 시 URL param status 변경 + page=1 리셋
```

### 1.3 데이터 흐름

```
URL: /admin/skills?q=검색어&status=active&page=2
  ↓
SkillsPage (Server Component)
  → searchParams에서 q, status, page 추출
  → GetSkillsUseCase.execute(page, 10, search, status)
    → SupabaseAdminRepository.getSkills(page, 10, search, status)
      → Supabase query: .from('skills').select(... categories(name, icon))
                        .ilike('title', '%검색어%')  // 또는 or('title.ilike, description.ilike')
                        .eq('status', 'active')
                        .range(from, to)
  ↓
SkillsCardGrid (result, searchInput, statusFilter)
  → SkillStatusFilter (currentStatus)
  → SkillSearch (디바운스 → URL 업데이트)
  → SkillCard[] (각 스킬)
  → Pagination
```

### 1.4 스타일링 가이드

**glass-card 효과** (HTML 레퍼런스 기반):
```
bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg shadow-[#000080]/5 rounded-2xl
```

**호버 효과**:
```
transition-all hover:-translate-y-1 hover:shadow-xl
```

**상태 뱃지**:
- Published: `px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase`
- Draft: `px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase`

**카테고리 아이콘 배경색** (카테고리별 매핑):
```
Customer Service → blue-100/blue-600
Analytics → purple-100/purple-600
Creative → orange-100/orange-600
Productivity → emerald-100/emerald-600
Development → indigo-100/indigo-600
기본값 → slate-100/slate-600
```

## Constitution Re-Check (Post Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | SkillStatusFilter 유니온 타입, SkillRow 확장 모두 명시적 타입. |
| II. Clean Architecture | PASS | 도메인 → 애플리케이션 → 인프라 레이어 순 변경. UI는 features 디렉토리. |
| III. Test Coverage | PASS | 신규 4개 컴포넌트 단위 테스트 + E2E 검색/필터 플로우 필요. |
| IV. Feature Module Isolation | PASS | admin 모듈 내부 변경만. 크로스 모듈 의존 없음. |
| V. Security-First | PASS | 서버 사이드 인증/role 검증 유지. 클라이언트에서 민감 정보 없음. |

## Complexity Tracking

해당 없음. Constitution 위반 사항 없음.
