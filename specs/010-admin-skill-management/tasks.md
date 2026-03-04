# Tasks: 어드민 스킬관리 페이지 디자인

**Input**: Design documents from `/specs/010-admin-skill-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in spec. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No additional project setup needed. Existing admin module structure is reused.

(No tasks in this phase — project structure already exists.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain/application/infrastructure layer changes that MUST be complete before ANY user story UI can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Add `SkillStatusFilter` type and extend `SkillRow` with `categoryIcon` field in `src/admin/domain/types.ts`
- [X] T002 Extend `AdminRepository.getSkills()` interface signature to accept `search?: string` and `status?: SkillStatusFilter` parameters in `src/admin/domain/types.ts` (depends on T001)
- [X] T003 Update `SupabaseAdminRepository.getSkills()` to support search (ilike on title/description), status filter (eq on status), and select `categories(name, icon)` in `src/admin/infrastructure/supabase-admin-repository.ts` (depends on T002)
- [X] T004 Update `GetSkillsUseCase.execute()` to pass `search` and `status` parameters to repository in `src/admin/application/get-skills-use-case.ts` (depends on T002)

**Checkpoint**: Foundation ready — domain types extended, repository supports search/filter/icon, use case forwards params.

---

## Phase 3: User Story 1 — 스킬 목록 카드 그리드 조회 (Priority: P1) MVP

**Goal**: 기존 테이블 레이아웃을 HTML 레퍼런스 기반 카드 그리드로 전환. 스킬 카드에 아이콘, 상태 뱃지, 이름, 설명, 카테고리, 수정/삭제 버튼 표시. 빈 상태 및 "새 스킬 추가하기" 플레이스홀더 카드 포함.

**Independent Test**: `/admin/skills` 접속 시 스킬이 카드 그리드(3/2/1열 반응형)로 표시되고, 빈 상태 메시지 및 플레이스홀더 카드가 정상 렌더링되는지 확인.

### Implementation for User Story 1

- [X] T005 [P] [US1] Create `SkillCard` component with glass-card style, category icon (lucide), status badge (Published/Draft), title, description (line-clamp-2), category name, and edit/delete buttons in `src/features/admin/SkillCard.tsx`
- [X] T006 [P] [US1] Create `SkillsCardGrid` component with page header (title + subtitle), responsive card grid (3/2/1 columns), empty state message, "새 스킬 추가하기" placeholder card, and pagination in `src/features/admin/SkillsCardGrid.tsx`
- [X] T007 [US1] Update `SkillsPage` server component to pass result to `SkillsCardGrid` instead of `SkillsTable` in `src/app/admin/skills/page.tsx` (depends on T005, T006)
- [X] T008 [US1] Delete deprecated `SkillsTable` component `src/features/admin/SkillsTable.tsx` (depends on T007)

**Checkpoint**: 스킬 관리 페이지에 카드 그리드가 표시됨. 검색/필터 없이 전체 스킬 조회 가능.

---

## Phase 4: User Story 2 — 스킬 검색 (Priority: P1)

**Goal**: 검색 입력란에 키워드를 입력하면 스킬명/설명 기준으로 디바운스 검색되어 카드 그리드에 필터링 결과가 표시된다.

**Independent Test**: 검색란에 키워드 입력 후 매칭되는 스킬만 표시되고, 빈 결과 시 안내 메시지가 나타나며, 검색란 비움 시 전체 목록 복원되는지 확인.

### Implementation for User Story 2

- [X] T009 [US2] Create `SkillSearch` client component with 300ms debounce, URL param `q`, page reset to 1, placeholder "스킬명 또는 설명으로 검색" in `src/features/admin/SkillSearch.tsx`
- [X] T010 [US2] Integrate `SkillSearch` into `SkillsPage` — read `q` from searchParams, pass to use case, inject SkillSearch into SkillsCardGrid via slot in `src/app/admin/skills/page.tsx` (depends on T009)
- [X] T011 [US2] Update `SkillsCardGrid` to render `searchInput` slot in header area and show "검색 결과가 없습니다" empty state when search yields 0 results in `src/features/admin/SkillsCardGrid.tsx` (depends on T009)

**Checkpoint**: 검색 기능 동작. 키워드 입력 시 서버 사이드 필터링으로 매칭 스킬만 카드 그리드에 표시.

---

## Phase 5: User Story 3 — 상태별 필터 탭 (Priority: P2)

**Goal**: 페이지 상단에 전체/배포됨/초안 필터 탭을 제공하여 스킬을 상태별로 필터링할 수 있다. 검색과 동시 적용 가능.

**Independent Test**: 각 필터 탭 클릭 시 해당 상태의 스킬만 표시되고, 검색과 필터가 동시에 작동하는지 확인.

### Implementation for User Story 3

- [X] T012 [US3] Create `SkillStatusFilter` client component with 3 tab buttons (전체/배포됨/초안), active tab styling (bg-primary text-white), URL param `status` update with page reset in `src/features/admin/SkillStatusFilter.tsx`
- [X] T013 [US3] Integrate `SkillStatusFilter` into `SkillsPage` — read `status` from searchParams, pass to use case, pass currentStatus to SkillsCardGrid in `src/app/admin/skills/page.tsx` (depends on T012)
- [X] T014 [US3] Update `SkillsCardGrid` to render `SkillStatusFilter` in header area (right-aligned, next to title) in `src/features/admin/SkillsCardGrid.tsx` (depends on T012)

**Checkpoint**: 필터 탭 동작. 전체/배포됨/초안 전환 + 검색 조합 정상 작동.

---

## Phase 6: User Story 4 — 페이지 헤더 영역 (Priority: P2)

**Goal**: 페이지 상단에 "스킬 관리" 제목과 부제가 HTML 레퍼런스 레이아웃에 맞게 배치된다.

**Independent Test**: 페이지 진입 시 좌측 제목/부제, 우측 필터 탭이 HTML 레퍼런스와 일치하는 레이아웃으로 표시되는지 확인.

### Implementation for User Story 4

- [X] T015 [US4] Refine `SkillsCardGrid` header layout to match HTML reference — left: "스킬 관리" title (text-3xl font-black) + subtitle, right: SkillStatusFilter, with flex justify-between alignment in `src/features/admin/SkillsCardGrid.tsx`

**Checkpoint**: 헤더 레이아웃이 HTML 레퍼런스와 동일.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T016 Verify responsive layout across mobile (1 col), tablet (2 col), desktop (3 col) viewports in `src/features/admin/SkillsCardGrid.tsx`
- [X] T017 Verify filter tab state is preserved when search keyword changes and vice versa in `src/app/admin/skills/page.tsx`
- [X] T018 Run quickstart.md validation — access `/admin/skills`, test card grid, search, filter tabs, responsive layout per `specs/010-admin-skill-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped — existing project structure
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 + Phase 3 (needs SkillsCardGrid to render search input)
- **User Story 3 (Phase 5)**: Depends on Phase 2 + Phase 3 (needs SkillsCardGrid to render filter tabs)
- **User Story 4 (Phase 6)**: Depends on Phase 5 (refines header layout that includes filter tabs)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Depends on US1 (SkillsCardGrid must exist to render search slot)
- **US3 (P2)**: Depends on US1 (SkillsCardGrid must exist to render filter tabs)
- **US4 (P2)**: Depends on US3 (filter tabs must exist to finalize header layout)

### Within Each User Story

- Domain types before infrastructure
- Infrastructure before application use case
- Backend (use case) before page component
- Page component before UI components integration

### Parallel Opportunities

- T001 can run independently (type definitions)
- T005 and T006 can run in parallel (different component files)
- T003 and T004 can run in parallel after T002 (different files)
- US2 and US3 can run in parallel after US1 completes (different components, both integrate into SkillsCardGrid)

---

## Parallel Example: Phase 2 (Foundational)

```text
# Sequential: Type definitions first
T001: Add SkillStatusFilter type and extend SkillRow

# Then: Interface signature
T002: Extend AdminRepository.getSkills() interface

# Then parallel: Implementation of interface
T003: Update SupabaseAdminRepository.getSkills()  |  T004: Update GetSkillsUseCase.execute()
```

## Parallel Example: Phase 3 (User Story 1)

```text
# Parallel: Independent component files
T005: Create SkillCard component  |  T006: Create SkillsCardGrid component

# Sequential: Integration
T007: Update SkillsPage to use new components
T008: Delete SkillsTable
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T004)
2. Complete Phase 3: User Story 1 (T005–T008)
3. **STOP and VALIDATE**: 카드 그리드가 정상 렌더링되는지 확인
4. Deploy/demo if ready — 기본 카드 그리드 뷰 사용 가능

### Incremental Delivery

1. Phase 2 (Foundational) → 도메인/인프라 확장 완료
2. Phase 3 (US1: 카드 그리드) → 테스트 → MVP 배포 가능
3. Phase 4 (US2: 검색) → 테스트 → 검색 기능 추가
4. Phase 5 (US3: 필터 탭) → 테스트 → 상태 필터 추가
5. Phase 6 (US4: 헤더 정리) → 테스트 → 레이아웃 완성
6. Phase 7 (Polish) → 반응형/통합 검증

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Status mapping: DB `active` → UI "Published", DB `inactive` → UI "Draft"
- glass-card style: `bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg shadow-[#000080]/5 rounded-2xl`
- Hover effect: `transition-all hover:-translate-y-1 hover:shadow-xl`
- Search pattern: MemberSearch 패턴 재사용 (URL params + 300ms debounce)
- 수정/삭제/추가 버튼은 UI만 구현 (동작은 스펙 범위 밖)
