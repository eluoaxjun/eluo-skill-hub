# Tasks: 어드민 회원관리 — 검색 & 페이지네이션

**Input**: Design documents from `/specs/009-admin-member-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md
**Scope**: User Story 4 (검색) + User Story 5 (페이지네이션 검색 연동). US1~US3은 구현 완료.

**Tests**: 테스트 태스크는 스펙에서 별도 요청하지 않아 포함하지 않음.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (도메인 타입 & Repository 수정)

**Purpose**: 검색 기능을 위한 백엔드 인프라 변경. 이 Phase가 완료되어야 US4/US5 구현 가능.

- [x] T001 `src/admin/domain/types.ts`의 `AdminRepository.getMembers` 시그니처에 `search?: string` 파라미터를 추가한다
- [x] T002 `src/admin/infrastructure/supabase-admin-repository.ts`의 `getMembers` 메서드를 수정하여, `search` 파라미터가 전달된 경우 `.or('name.ilike.%검색어%,email.ilike.%검색어%')` 필터를 추가한다
- [x] T003 `src/admin/application/get-members-use-case.ts`의 `execute` 메서드에 `search?: string` 파라미터를 추가하고 repository에 전달한다

**Checkpoint**: 검색 파라미터가 도메인→애플리케이션→인프라 계층을 통해 전달되는 구조 완료

---

## Phase 2: User Story 4 — 관리자가 회원을 검색한다 (Priority: P1)

**Goal**: 관리자가 `/admin/members` 페이지 상단의 검색 입력 필드에 이름 또는 이메일을 입력하여 회원을 검색할 수 있다. 검색은 debounce(300ms) 후 서버에서 수행되며, URL 파라미터(`?q=검색어`)로 관리된다.

**Independent Test**: 관리자 로그인 → `/admin/members` 접속 → 검색 필드에 이름/이메일 일부 입력 → 300ms 후 필터링된 결과 표시 확인. 검색어 삭제 시 전체 목록 복원 확인.

### Implementation for User Story 4

- [x] T004 [US4] `src/features/admin/MemberSearch.tsx` Client Component를 생성한다. Shadcn Input을 사용하여 검색 입력 필드를 표시하고, `useSearchParams`와 `useRouter`를 사용하여 debounce(300ms) 후 URL 파라미터(`?q=검색어&page=1`)를 업데이트한다. 검색어 변경 시 page=1로 리셋한다
- [x] T005 [US4] `src/app/admin/members/page.tsx`를 수정하여 `searchParams`에서 `q` 파라미터를 읽고 `GetMembersUseCase.execute`에 전달한다. 페이지 상단에 `MemberSearch` 컴포넌트를 렌더링하고 현재 검색어를 `defaultValue`로 전달한다
- [x] T006 [US4] `src/features/admin/MembersTable.tsx`를 수정하여 `searchQuery` prop을 추가하고, 검색어가 있는데 결과가 0건일 때 "검색 결과가 없습니다" 메시지를 표시한다 (기존 "데이터가 없습니다"와 구분)

**Checkpoint**: 관리자가 이름/이메일로 회원을 검색할 수 있고, URL에 검색어가 반영된다

---

## Phase 3: User Story 5 — 회원 목록이 페이지네이션으로 표시된다 (Priority: P1)

**Goal**: 페이지네이션이 검색과 연동되어 동작한다. 검색 시에도 페이지네이션이 적용되며, 새 검색어 입력 시 1페이지로 리셋된다. URL에 `?q=검색어&page=번호`가 반영된다.

**Independent Test**: 10명 이상의 회원 존재 시 페이지네이션 UI 표시 확인. 검색 후 2페이지 이동 시 URL 반영 확인. 새 검색어 입력 시 1페이지 리셋 확인.

**Note**: 페이지네이션 기본 기능은 이미 구현되어 있음. US5 태스크는 검색과의 연동 및 URL 상태 관리에 집중한다.

### Implementation for User Story 5

- [x] T007 [US5] `src/features/admin/MembersTable.tsx`의 페이지네이션 링크를 수정하여, 현재 검색어(`searchQuery`)를 유지하면서 페이지를 이동하도록 한다 (예: `?q=검색어&page=2`)

**Checkpoint**: 검색 결과 내 페이지 이동 시 검색어가 유지되고, 검색어 변경 시 1페이지로 리셋된다

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: 전체 기능 검증 및 정리

- [ ] T008 quickstart.md의 검색 관련 확인 사항 4개를 순서대로 수동 검증한다 (검색 필터링, URL 반영, 페이지 리셋, 빈 결과 메시지)
- [x] T009 TypeScript 타입 체크(`tsc --noEmit`)를 실행하여 타입 오류가 없는지 확인한다

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: 즉시 시작 가능. US4/US5를 차단함
- **User Story 4 (Phase 2)**: Phase 1 완료 후 시작
- **User Story 5 (Phase 3)**: Phase 2(US4) 완료 후 시작 (MembersTable.tsx를 공유하므로 순차 실행)
- **Polish (Phase 4)**: US4 + US5 완료 후 시작

### Execution Flow

```
Phase 1 (Foundational: Types + Repository + UseCase)
    │
    ▼
Phase 2 (US4: 검색 UI + 서버 연동)
    │
    ▼
Phase 3 (US5: 페이지네이션 + 검색 연동)
    │
    ▼
Phase 4 (Polish)
```

### Within Each Phase

- T001 → T002 → T003 (순차: 인터페이스 → 구현 → use case)
- T004 ∥ T006 (병렬 가능: 다른 파일)
- T005 (T004, T006 완료 후: 페이지에서 둘 다 사용)

---

## Implementation Strategy

### MVP First (US4 Only)

1. Phase 1: 도메인 타입 + Repository 수정
2. Phase 2: 검색 UI 구현
3. **STOP and VALIDATE**: 검색 동작, debounce, URL 반영 확인
4. Deploy/demo if ready

### Full Delivery

1. Foundational → 백엔드 검색 인프라 준비
2. US4 (검색) → 핵심 검색 기능 동작 → **MVP!**
3. US5 (페이지네이션 연동) → 검색+페이지 URL 유지
4. Polish → 전체 검증

---

## Notes

- US1~US3은 이미 구현 완료 (역할 변경, 이름 표시, 권한 테이블)
- 검색은 DB 스키마 변경 없이 ILIKE 쿼리로 구현
- 검색어는 Supabase SDK가 parameterized query로 처리하여 SQL Injection 안전
- MemberSearch.tsx가 유일한 신규 파일, 나머지는 기존 파일 수정
- 총 태스크 수: 9개 (Foundational 3 + US4 3 + US5 1 + Polish 2)
