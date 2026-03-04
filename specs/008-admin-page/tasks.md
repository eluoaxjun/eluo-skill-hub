# Tasks: 어드민 페이지

**Input**: Design documents from `/specs/008-admin-page/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/admin-api.md

**Tests**: Not explicitly requested in feature spec. Test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Admin 모듈 도메인 타입 정의 및 디렉토리 구조 생성

- [X] T001 Create admin domain types (AdminRepository interface, DashboardStats, RecentSkill, RecentMember, MemberRow, SkillRow, FeedbackRow, PaginatedResult) in src/admin/domain/types.ts — refer to contracts/admin-api.md for exact interface definitions and data-model.md for field mappings (skills.title not name, skill_feedback_logs not feedbacks)

---

## Phase 2: Foundational (Blocking Prerequisites) — includes US2 + US3

**Purpose**: 미들웨어 인증 처리, Supabase 리포지토리, 어드민 레이아웃(사이드바 + 헤더 + role 기반 접근제어)을 구축한다. US2(비관리자 차단)와 US3(탭 네비게이션)은 레이아웃과 분리 불가능하므로 이 단계에서 함께 구현한다.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [US2] Update middleware to redirect unauthenticated users from /admin/* paths to /signin in src/proxy.ts — add pathname.startsWith('/admin') condition alongside existing /signin, /signup redirect logic
- [X] T003 Implement SupabaseAdminRepository with all query methods (getDashboardStats, getRecentSkills, getRecentMembers, getMembers, getSkills, getFeedbacks) in src/admin/infrastructure/supabase-admin-repository.ts — use Supabase server client from src/shared/infrastructure/supabase/server.ts; use `{ count: 'exact', head: true }` for counts, `.range(from, to)` for pagination; join profiles→roles for member roleName, skills→categories for categoryName, skill_feedback_logs→profiles+skills for feedback userName/skillTitle
- [X] T004 [P] [US2] Create AccessDenied component displaying "관리자 전용 페이지입니다" message and a "대시보드로 이동" button linking to /dashboard in src/features/admin/AccessDenied.tsx — style consistent with existing auth page patterns (glass card, brand colors)
- [X] T005 [P] [US3] Create AdminSidebar client component with 4 navigation items (대시보드 /admin, 회원 관리 /admin/members, 스킬 관리 /admin/skills, 피드백 관리 /admin/feedbacks) and active tab highlighting using usePathname() in src/features/admin/AdminSidebar.tsx — use 'use client' directive; match glassmorphism sidebar style from stitch-html/admin-dashboard.html (glass-sidebar class, material icons via lucide-react, admin profile display at bottom); accept user profile props (name, role) for bottom section
- [X] T006 [P] Create AdminHeader component with page title, search input placeholder, notification and settings icon buttons in src/features/admin/AdminHeader.tsx — search and notification are UI-only (no functionality), match header style from stitch-html reference
- [X] T007 [US2] [US3] Create admin layout server component in src/app/admin/layout.tsx — fetch Supabase user via getUser(), query profiles table joined with roles to get role name, if not authenticated redirect('/signin'), if role !== 'admin' render AccessDenied instead of children, otherwise render flex layout with AdminSidebar (pass user name/role) + main area with AdminHeader + children

**Checkpoint**: Admin layout functional — admin sees sidebar + content area, non-admin sees AccessDenied, unauthenticated redirected to /signin. Tab navigation works via sidebar links.

---

## Phase 3: User Story 1 — 관리자 대시보드 접근 (Priority: P1) 🎯 MVP

**Goal**: 관리자가 `/admin`에 접속하면 전체 회원 수, 전체 스킬 수, 누적 피드백 수 요약 카드와 최근 등록된 스킬·회원 목록이 표시되는 대시보드를 본다.

**Independent Test**: admin 계정으로 /admin 접속 → 3개 요약 카드(숫자 표시) + 최근 스킬 5건 목록 + 최근 회원 5건 테이블이 렌더링됨을 확인

### Implementation for User Story 1

- [X] T008 [P] [US1] Create GetDashboardStats use case that calls AdminRepository.getDashboardStats(), getRecentSkills(5), getRecentMembers(5) and returns combined dashboard data in src/admin/application/get-dashboard-stats-use-case.ts
- [X] T009 [P] [US1] Create SummaryCard component accepting title (string), value (number), icon (LucideIcon), and optional change (string) props in src/features/admin/SummaryCard.tsx — match summary-card style from stitch-html reference (rounded-2xl, primary colors, large number display)
- [X] T010 [P] [US1] Create RecentSkillsList component accepting RecentSkill[] prop, displaying skill title, description, category, and relative time in src/features/admin/RecentSkillsList.tsx — match card layout from stitch-html reference (icon + text + timestamp, white rounded card with border)
- [X] T011 [P] [US1] Create RecentMembersTable component accepting RecentMember[] prop, displaying name, department/role, and status badge in src/features/admin/RecentMembersTable.tsx — match table layout from stitch-html reference (avatar + name, role column, Active/Pending badge)
- [X] T012 [US1] Create DashboardContent component composing 3 SummaryCards (회원 수, 스킬 수, 피드백 수) + grid with RecentSkillsList and RecentMembersTable in src/features/admin/DashboardContent.tsx — accept DashboardStats + RecentSkill[] + RecentMember[] props; match grid layout from stitch-html (3-col summary cards, 2-col content grid)
- [X] T013 [US1] Create admin dashboard page as server component in src/app/admin/page.tsx — instantiate SupabaseAdminRepository, execute GetDashboardStats use case, pass data to DashboardContent

**Checkpoint**: Admin dashboard fully functional — summary cards show real counts from Supabase, recent lists populated from DB

---

## Phase 4: User Story 4 — 회원 관리 (Priority: P2)

**Goal**: 관리자가 "/admin/members" 탭에서 전체 회원 목록을 이름, 이메일, 역할, 가입일, 상태 컬럼이 포함된 테이블로 조회할 수 있다.

**Independent Test**: admin 계정으로 /admin/members 접속 → 회원 테이블(이름, 이메일, 역할, 가입일, 상태 컬럼)이 표시되고 페이지네이션이 동작함

### Implementation for User Story 4

- [X] T014 [P] [US4] Create GetMembers use case calling AdminRepository.getMembers(page, pageSize) in src/admin/application/get-members-use-case.ts
- [X] T015 [P] [US4] Create MembersTable component accepting PaginatedResult<MemberRow> prop, rendering a table with columns: 이름(displayName), 이메일, 역할(roleName), 가입일(createdAt formatted), 상태(active/pending badge) and pagination controls (이전/다음 buttons with page numbers) in src/features/admin/MembersTable.tsx — pagination links use ?page=N query params
- [X] T016 [US4] Create members page as server component in src/app/admin/members/page.tsx — read `page` from searchParams, instantiate repository + use case, execute getMembers(page, 10), pass result to MembersTable

**Checkpoint**: Members tab shows paginated member list from profiles + roles tables

---

## Phase 5: User Story 5 — 스킬 관리 (Priority: P2)

**Goal**: 관리자가 "/admin/skills" 탭에서 전체 스킬 목록을 이름, 카테고리, 등록일, 상태가 포함된 형태로 조회할 수 있다.

**Independent Test**: admin 계정으로 /admin/skills 접속 → 스킬 테이블(이름, 카테고리, 등록일, 상태 컬럼)이 표시되고 페이지네이션이 동작함

### Implementation for User Story 5

- [X] T017 [P] [US5] Create GetSkills use case calling AdminRepository.getSkills(page, pageSize) in src/admin/application/get-skills-use-case.ts
- [X] T018 [P] [US5] Create SkillsTable component accepting PaginatedResult<SkillRow> prop, rendering a table with columns: 이름(title), 카테고리(categoryName), 등록일(createdAt formatted), 상태(active/inactive badge) and pagination controls in src/features/admin/SkillsTable.tsx
- [X] T019 [US5] Create skills page as server component in src/app/admin/skills/page.tsx — read `page` from searchParams, instantiate repository + use case, execute getSkills(page, 10), pass result to SkillsTable

**Checkpoint**: Skills tab shows paginated skill list from skills + categories tables

---

## Phase 6: User Story 6 — 피드백 관리 (Priority: P3)

**Goal**: 관리자가 "/admin/feedbacks" 탭에서 전체 피드백 목록을 내용, 작성자, 작성일, 대상 스킬 정보가 포함된 형태로 조회할 수 있다.

**Independent Test**: admin 계정으로 /admin/feedbacks 접속 → 피드백 테이블(평점, 코멘트, 작성자, 대상 스킬, 작성일 컬럼)이 표시되고 페이지네이션이 동작함

### Implementation for User Story 6

- [X] T020 [P] [US6] Create GetFeedbacks use case calling AdminRepository.getFeedbacks(page, pageSize) in src/admin/application/get-feedbacks-use-case.ts
- [X] T021 [P] [US6] Create FeedbacksTable component accepting PaginatedResult<FeedbackRow> prop, rendering a table with columns: 평점(rating as stars or number), 코멘트(comment), 작성자(userName), 대상 스킬(skillTitle), 작성일(createdAt formatted) and pagination controls in src/features/admin/FeedbacksTable.tsx
- [X] T022 [US6] Create feedbacks page as server component in src/app/admin/feedbacks/page.tsx — read `page` from searchParams, instantiate repository + use case, execute getFeedbacks(page, 10), pass result to FeedbacksTable

**Checkpoint**: Feedbacks tab shows paginated feedback list from skill_feedback_logs + profiles + skills tables

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 엣지 케이스 처리, 반응형 대응, 빈 상태 처리

- [X] T023 Handle empty state for all tabs — when data count is 0, display "데이터가 없습니다" placeholder message in DashboardContent, MembersTable, SkillsTable, FeedbacksTable components
- [X] T024 [P] Add responsive styles for mobile/tablet — make sidebar collapsible or hidden on small screens with a hamburger toggle button in AdminSidebar, ensure tables scroll horizontally on narrow viewports
- [X] T025 Verify TypeScript strict mode compliance — run `tsc --noEmit` and fix any type errors across all new admin files (src/admin/**, src/features/admin/**, src/app/admin/**)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001 domain types) — BLOCKS all user stories
- **US1 Dashboard (Phase 3)**: Depends on Phase 2 completion
- **US4 Members (Phase 4)**: Depends on Phase 2 completion — can run in parallel with Phase 3
- **US5 Skills (Phase 5)**: Depends on Phase 2 completion — can run in parallel with Phase 3, 4
- **US6 Feedbacks (Phase 6)**: Depends on Phase 2 completion — can run in parallel with Phase 3, 4, 5
- **Polish (Phase 7)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1 Dashboard)**: Depends only on Foundational — no other story dependencies
- **US2 (P1 Access Control)**: Completed as part of Foundational (T002, T004, T007) — no separate phase needed
- **US3 (P2 Tab Navigation)**: Completed as part of Foundational (T005, T007) — sidebar + layout routing
- **US4 (P2 Members)**: Depends only on Foundational — independent of US1
- **US5 (P2 Skills)**: Depends only on Foundational — independent of US1, US4
- **US6 (P3 Feedbacks)**: Depends only on Foundational — independent of all other stories

### Within Each User Story

- Use cases and UI components marked [P] can be created in parallel
- Page component depends on both use case + UI component completion
- Repository (T003) contains all query methods for all stories — created once in Foundational

### Parallel Opportunities

**Phase 2 (after T002, T003):**
```
T004 (AccessDenied) ──┐
T005 (AdminSidebar) ──┼── All parallel → T007 (layout.tsx)
T006 (AdminHeader)  ──┘
```

**Phase 3 (US1):**
```
T008 (use case)          ──┐
T009 (SummaryCard)       ──┤
T010 (RecentSkillsList)  ──┼── All parallel → T012 (DashboardContent) → T013 (page.tsx)
T011 (RecentMembersTable)──┘
```

**Phases 4-6 can run entirely in parallel with each other:**
```
Phase 4 (US4 Members):   T014 ─┬─ parallel ─── T016 (page)
                          T015 ─┘
Phase 5 (US5 Skills):    T017 ─┬─ parallel ─── T019 (page)
                          T018 ─┘
Phase 6 (US6 Feedbacks): T020 ─┬─ parallel ─── T022 (page)
                          T021 ─┘
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T007) → US2 + US3 complete
3. Complete Phase 3: US1 Dashboard (T008-T013)
4. **STOP and VALIDATE**: Admin dashboard renders with real data, non-admin sees AccessDenied, unauthenticated redirected
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Admin shell ready (layout, sidebar, access control)
2. Add US1 Dashboard → Test → Deploy (MVP!)
3. Add US4 Members → Test → Deploy
4. Add US5 Skills → Test → Deploy
5. Add US6 Feedbacks → Test → Deploy
6. Polish → Final Deploy

### Parallel Team Strategy

With multiple developers after Foundational:
- Developer A: US1 (Dashboard)
- Developer B: US4 (Members) + US5 (Skills)
- Developer C: US6 (Feedbacks) + Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US2 and US3 are completed within Phase 2 (Foundational) because their implementation (middleware, sidebar, layout role check) is prerequisite infrastructure for all other stories
- skills table uses `title` field (not `name`) — see data-model.md
- Feedback data comes from `skill_feedback_logs` table (not `feedbacks`) — see data-model.md
- All Supabase queries execute server-side via Server Components — no client-side data fetching
- Pagination uses URL query params (?page=N) for server-side rendering compatibility
- Search and notification in header are UI placeholders only (no functionality)
- Style reference: stitch-html/admin-dashboard.html (glassmorphism sidebar, navy primary, yellow accent)
