# Tasks: 데이터 캐싱 전략 수립 및 최적화

**Input**: Design documents from `/specs/019-data-caching-strategy/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: 테스트는 별도 요청 시 추가. 이 태스크 목록에는 구현 태스크만 포함.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: 이 피처는 기존 코드 최적화이므로 별도의 프로젝트 초기화가 필요 없음. 새 의존성 추가 없음, DB 스키마 변경 없음.

(설정 태스크 없음 — 즉시 Phase 3으로 진행)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 유저 스토리에 공통으로 필요한 기반 작업 없음. 각 스토리가 독립적인 파일/메서드를 수정하므로 바로 유저 스토리 구현 시작 가능.

(기반 태스크 없음 — 즉시 Phase 3으로 진행)

---

## Phase 3: User Story 1 - 대시보드 페이지 빠른 로딩 (Priority: P1) 🎯 MVP

**Goal**: 대시보드 페이지의 순차적 DB 쿼리(스킬 목록 → 북마크 → 사용자 역할)를 `Promise.all`로 병렬화하여 페이지 로딩 시간을 30% 이상 단축한다.

**Independent Test**: 대시보드 페이지 접속 시 스킬 목록, 북마크 표시, 역할 기반 UI가 모두 정상 표시되는지 확인. 로딩 시간이 이전 대비 단축되었는지 측정.

### Implementation for User Story 1

- [X] T001 [US1] `DashboardPage` 서버 컴포넌트에서 스킬 목록, 북마크 목록, 사용자 역할 3개 쿼리를 `Promise.all`로 병렬화 in `src/app/(portal)/dashboard/page.tsx`
  - 현재: `getSkillsUseCase.execute()` → `supabase.auth.getUser()` → `bookmarksUseCase.getBookmarkedSkillIds()` → `supabase.from('profiles').select()` (4단계 sequential)
  - 변경: `supabase.auth.getUser()` 선행 → `Promise.all([getSkills, getBookmarks, getRole])` (2단계로 축소)
  - `supabase.auth.getUser()`는 user.id가 필요하므로 선행 필수
  - 개별 쿼리 실패 시 기본값(빈 배열, false)으로 처리하여 나머지 데이터는 정상 표시

**Checkpoint**: 대시보드 페이지의 스킬 목록, 북마크, 역할 기반 UI가 이전과 동일하게 동작하며 로딩 시간이 단축됨.

---

## Phase 4: User Story 2 - 데이터 변경 후 화면 즉시 반영 (Priority: P2)

**Goal**: 피드백/답글 제출 서버 액션에 누락된 `revalidatePath` 호출을 추가하여, 데이터 변경 후 관련 페이지에서 항상 최신 데이터가 표시되도록 한다.

**Independent Test**: 피드백을 작성한 뒤 대시보드로 돌아가서 해당 스킬 팝업을 다시 열었을 때 새 피드백이 표시되는지 확인.

### Implementation for User Story 2

- [X] T002 [US2] `submitFeedbackAction` 서버 액션에 `revalidatePath('/dashboard')` 추가 in `src/app/(portal)/dashboard/actions.ts`
  - 현재: 피드백 저장 후 `revalidatePath` 미호출
  - 변경: 성공적 저장 후 `revalidatePath('/dashboard')` 호출
  - try/catch 내부 return 전에 추가

- [X] T003 [US2] `submitFeedbackReplyAction` 서버 액션에 `revalidatePath('/dashboard')` 추가 in `src/app/(portal)/dashboard/actions.ts`
  - 현재: 답글 저장 후 `revalidatePath` 미호출
  - 변경: 성공적 저장 후 `revalidatePath('/dashboard')` 호출
  - T002와 같은 파일의 다른 함수이므로 순차 실행

**Checkpoint**: 피드백/답글 작성 후 관련 페이지에서 최신 데이터가 즉시 반영됨.

---

## Phase 5: User Story 3 - 사용자 역할 정보 효율적 조회 (Priority: P3)

**Goal**: 사용자 역할 조회를 대시보드 페이지에서 포털 레이아웃으로 옮겨, 페이지 이동 시마다 중복 실행되는 역할 조회 쿼리를 제거한다.

**Independent Test**: 대시보드 → 내 에이전트 → 대시보드 페이지를 이동하며 역할 기반 UI(viewer 제한 등)가 일관되게 동작하는지 확인.

### Implementation for User Story 3

- [X] T004 [US3] `(portal)/layout.tsx`에서 사용자 역할(viewer 여부)을 조회하여 `DashboardLayoutClient`에 `isViewer` prop 전달 in `src/app/(portal)/layout.tsx`
  - 현재: 레이아웃에서 user 인증 + 카테고리만 조회
  - 변경: `supabase.from('profiles').select('roles(name)')` 쿼리 추가
  - `isViewer` boolean 값을 `DashboardLayoutClient`에 전달
  - 카테고리 조회와 역할 조회를 `Promise.all`로 병렬 실행

- [X] T005 [US3] `DashboardLayoutClient`에 `isViewer` prop 추가 및 하위 컴포넌트에 전달 in `src/features/dashboard/DashboardLayoutClient.tsx`
  - `DashboardLayoutClientProps` 인터페이스에 `isViewer?: boolean` 추가
  - `children`에 prop 전달하기 위해 React Context 또는 children cloning 대신 별도 전역 상태 패턴 사용
  - 의존: T004 완료 후

- [X] T006 [US3] `DashboardPage`에서 사용자 역할 조회 로직 제거 — 레이아웃에서 전달받도록 변경 in `src/app/(portal)/dashboard/page.tsx`
  - 현재: `supabase.from('profiles').select('roles(name)')` 직접 조회
  - 변경: 역할 조회 코드 제거, `isViewer`를 `DashboardSkillGrid`에서 제거하거나 레이아웃에서 받은 값 사용
  - 의존: T004, T005 완료 후

**Checkpoint**: 역할 기반 UI가 일관되게 동작하며, 페이지 이동 시 역할 조회 중복이 제거됨.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 전체 회귀 검증 및 최종 확인

- [X] T007 전체 기능 회귀 검증 — 스킬 검색, 카테고리 필터, 북마크 토글, 스킬 상세 팝업, 피드백 작성, 답글 작성, 템플릿 다운로드가 최적화 전과 동일하게 동작하는지 확인
- [X] T008 TypeScript 타입 체크 — `tsc --noEmit` 실행하여 타입 에러 없음 확인
- [X] T009 비로그인 상태 테스트 — 비로그인 사용자가 대시보드 접속 시 적절히 리다이렉트되는지 확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 해당 없음
- **Phase 2 (Foundational)**: 해당 없음
- **Phase 3 (US1)**: 즉시 시작 가능
- **Phase 4 (US2)**: 즉시 시작 가능 — US1과 독립적 (다른 함수)
- **Phase 5 (US3)**: US1 이후 추천 — T006이 `dashboard/page.tsx`에서 역할 조회 제거하므로 T001과 같은 파일
- **Phase 6 (Polish)**: US1 + US2 + US3 모두 완료 후

### User Story Dependencies

- **US1 (P1)**: 독립 — `dashboard/page.tsx` 내 쿼리 병렬화
- **US2 (P2)**: 독립 — `dashboard/actions.ts` 내 revalidation 추가
- **US3 (P3)**: 부분 의존 — `dashboard/page.tsx`(US1과 같은 파일) + `layout.tsx` + `DashboardLayoutClient.tsx` 수정

### Within Each User Story

- **US1**: T001 단일 태스크
- **US2**: T002 → T003 (같은 파일 순차 실행)
- **US3**: T004 (레이아웃) → T005 (클라이언트 레이아웃) → T006 (페이지에서 제거)

### Parallel Opportunities

- **US1의 T001과 US2의 T002**: 서로 다른 파일이므로 병렬 가능
- **US1과 US3**: T001과 T006이 같은 파일(`dashboard/page.tsx`)을 수정하므로 순차 추천

---

## Parallel Example: US1과 US2

```bash
# US1과 US2는 서로 다른 파일을 수정하므로 동시 진행 가능:
Task: T001 [US1] 대시보드 쿼리 병렬화 (dashboard/page.tsx)
Task: T002 [US2] submitFeedbackAction에 revalidatePath 추가 (dashboard/actions.ts)
Task: T003 [US2] submitFeedbackReplyAction에 revalidatePath 추가 (dashboard/actions.ts)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001: 대시보드 쿼리 병렬화
2. **검증**: 대시보드 페이지 로딩 시간 30% 이상 단축 확인
3. 이 시점에서 가장 큰 성능 개선이 이미 달성됨

### Incremental Delivery

1. US1 완료 → 쿼리 병렬화로 핵심 병목 해소 (MVP)
2. US2 완료 → 데이터 정합성 보장
3. US3 완료 → 역할 조회 중복 제거로 추가 최적화
4. Polish → 회귀 검증 + 타입 체크

---

## Notes

- 모든 변경은 기존 파일 내부 수정만 수행 (새 파일 생성 없음)
- `any` 타입 사용 금지 (헌법 원칙 I)
- Clean Architecture 레이어 경계 유지 (헌법 원칙 II)
- US3에서 `dashboard/page.tsx` 수정 시 US1의 변경과 파일이 겹치므로, US1 완료 후 US3 진행 추천
