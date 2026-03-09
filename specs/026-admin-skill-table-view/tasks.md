# Tasks: 스킬 관리 페이지 테이블뷰 추가

**Input**: Design documents from `/specs/026-admin-skill-table-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: 신규 컴포넌트 파일 생성 및 타입 정의

- [x] T001 [P] ViewMode 타입 정의 및 ViewModeToggle 컴포넌트 생성 in `src/features/admin/ViewModeToggle.tsx`
- [x] T002 [P] SkillTableView 컴포넌트 스캐폴딩 생성 in `src/features/admin/SkillTableView.tsx`

**Checkpoint**: 신규 파일 생성 완료, 빌드 에러 없음

---

## Phase 2: User Story 1 - 뷰 모드 토글 (Priority: P1) 🎯 MVP

**Goal**: 검색창 왼쪽에 그리드/테이블 토글 버튼을 배치하고, 클릭 시 뷰 모드를 전환한다.

**Independent Test**: 토글 버튼 클릭으로 그리드↔테이블 뷰가 전환되는지 확인

### Implementation for User Story 1

- [x] T003 [US1] ViewModeToggle 컴포넌트 구현: `viewMode` prop에 따라 LayoutGrid/List 아이콘 활성 상태 표시 in `src/features/admin/ViewModeToggle.tsx`
- [x] T004 [US1] SkillsCardGrid를 client component로 전환하고 `useState<'grid' | 'table'>('grid')` 추가 in `src/features/admin/SkillsCardGrid.tsx`
- [x] T005 [US1] SkillsCardGrid 검색창 왼쪽에 ViewModeToggle 배치 및 뷰 모드에 따른 조건부 렌더링 분기 추가 in `src/features/admin/SkillsCardGrid.tsx`

**Checkpoint**: 토글 버튼 클릭 시 그리드/테이블 영역이 전환됨 (테이블은 아직 스캐폴딩)

---

## Phase 3: User Story 2 - 테이블뷰 데이터 표시 (Priority: P1)

**Goal**: 테이블뷰에서 스킬 데이터를 행 단위로 표시한다.

**Independent Test**: 테이블뷰 전환 시 각 컬럼(제목, 카테고리, 버전, 상태, 태그, 생성일, 수정일)에 올바른 데이터 표시 확인

### Implementation for User Story 2

- [x] T006 [US2] SkillTableView 테이블 헤더 및 컬럼 레이아웃 구현 (제목, 카테고리, 버전, 상태, 태그, 생성일, 수정일, 액션) in `src/features/admin/SkillTableView.tsx`
- [x] T007 [US2] SkillTableView 각 행 데이터 매핑: 상태 뱃지(Published 초록/Draft 회색), 태그(최대 3개 + "+N"), 날짜 포맷팅 in `src/features/admin/SkillTableView.tsx`

**Checkpoint**: 테이블뷰에서 모든 스킬 데이터가 올바르게 표시됨

---

## Phase 4: User Story 3 - 테이블뷰 수정/삭제 동작 (Priority: P1)

**Goal**: 테이블뷰 각 행에서 수정/삭제 버튼이 그리드뷰와 동일하게 동작한다.

**Independent Test**: 테이블뷰에서 수정 클릭 시 수정 페이지 이동, 삭제 클릭 시 확인 다이얼로그 표시

### Implementation for User Story 3

- [x] T008 [US3] SkillTableView 액션 컬럼에 수정 Link(`/admin/skills/edit/[id]`)와 삭제 버튼 추가 in `src/features/admin/SkillTableView.tsx`
- [x] T009 [US3] SkillTableView에 SkillDeleteConfirmDialog 통합: 삭제 상태 관리 및 삭제 mutation 연결 in `src/features/admin/SkillTableView.tsx`

**Checkpoint**: 테이블뷰에서 수정/삭제가 그리드뷰와 동일하게 동작

---

## Phase 5: User Story 4 - 필터/검색/페이지네이션 연동 (Priority: P2)

**Goal**: 뷰 모드 전환 시 검색어, 필터, 페이지네이션 상태가 유지된다.

**Independent Test**: 카테고리 필터 적용 후 뷰 전환 시 동일 결과 유지 확인

### Implementation for User Story 4

- [x] T010 [US4] SkillsCardGrid에서 뷰 모드 전환이 기존 props(result, searchQuery, currentStatus, currentCategoryId)에 영향 없음을 확인하고 테이블뷰에도 동일 데이터 전달 in `src/features/admin/SkillsCardGrid.tsx`
- [x] T011 [US4] 빈 상태(data.length === 0) 처리를 뷰 모드와 무관하게 공통으로 렌더링하도록 구조화 in `src/features/admin/SkillsCardGrid.tsx`

**Checkpoint**: 모든 필터/검색 조합에서 뷰 전환 시 상태 유지 확인

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 스타일 정리 및 반응형 대응

- [x] T012 테이블뷰 반응형 처리: 좁은 화면에서 가로 스크롤 `overflow-x-auto` 적용 in `src/features/admin/SkillTableView.tsx`
- [x] T013 테이블뷰/그리드뷰 전환 시 애니메이션 또는 시각적 전환 효과 검토 및 적용 in `src/features/admin/SkillsCardGrid.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - 즉시 시작
- **Phase 2 (US1 토글)**: Phase 1 완료 후 시작
- **Phase 3 (US2 테이블 표시)**: Phase 2 완료 후 시작 (토글이 있어야 테이블 전환 가능)
- **Phase 4 (US3 수정/삭제)**: Phase 3 완료 후 시작 (테이블 행이 있어야 액션 추가 가능)
- **Phase 5 (US4 필터 연동)**: Phase 2 완료 후 시작 (Phase 3/4와 병렬 가능)
- **Phase 6 (Polish)**: Phase 4 완료 후 시작

### Parallel Opportunities

- T001, T002: 서로 다른 파일이므로 병렬 실행 가능
- Phase 5(US4)는 Phase 3/4와 병렬 가능 (다른 관심사)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001-T002)
2. Phase 2: US1 토글 구현 (T003-T005)
3. **STOP and VALIDATE**: 토글 버튼으로 뷰 전환 동작 확인

### Incremental Delivery

1. Setup + US1 토글 → 뷰 전환 기본 동작 확인
2. US2 테이블 데이터 표시 → 실제 데이터 확인
3. US3 수정/삭제 → 기존 기능 동등성 확인
4. US4 필터 연동 → 전체 동작 통합 확인
5. Polish → 반응형/UX 개선

---

## Notes

- 총 태스크: 13개
- US1: 3개, US2: 2개, US3: 2개, US4: 2개, Setup: 2개, Polish: 2개
- 순수 프론트엔드 변경으로 도메인/인프라 레이어 수정 없음
- SkillsCardGrid가 client component로 전환되므로 서버 컴포넌트에서 전달하는 props 호환성 확인 필요
