# Tasks: 스킬 삭제 기능

**Input**: Design documents from `/specs/014-skill-delete/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included (Constitution Principle III requires test coverage for all use cases and user-facing flows).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US1(다이얼로그)과 US2(경고 메시지)는 동일 컴포넌트에서 구현되므로 하나의 Phase로 통합.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Backend - Clean Architecture Layers)

**Purpose**: Domain 타입 정의, UseCase, Repository, Server Action 등 삭제 기능의 백엔드 인프라 구축

**⚠️ CRITICAL**: 모든 UI 작업(Phase 2, 3)은 이 Phase 완료 후 시작 가능

- [x] T001 [P] Add `DeleteSkillResult` type to `src/admin/domain/types.ts` — `{ success: true } | { success: false; error: string }` 패턴으로 정의, `AdminRepository` 인터페이스에 `deleteSkill(skillId: string): Promise<DeleteSkillResult>` 메서드 추가
- [x] T002 [P] Create `DeleteSkillUseCase` class in `src/admin/application/delete-skill-use-case.ts` — `AdminRepository` 의존성 주입, `execute(skillId: string): Promise<DeleteSkillResult>` 메서드 구현 (기존 `CreateSkillUseCase` 패턴 참조)
- [x] T003 Implement `deleteSkill` method in `src/admin/infrastructure/supabase-admin-repository.ts` — 삭제 순서: ① `skill_feedback_logs` 삭제(skill_id 기준) → ② `skill_templates` 조회 후 Storage 파일 삭제(`skill-templates` 버킷) + DB 레코드 삭제 → ③ `skills.markdown_file_path` 존재 시 Storage 파일 삭제(`skill-descriptions` 버킷) → ④ `skills` 레코드 삭제. 존재하지 않는 스킬 시 에러 반환. (depends on T001)
- [x] T004 Add `deleteSkill` server action in `src/app/admin/skills/actions.ts` — `'use server'` 함수로 `verifyAdmin()` 권한 검증, `skillId` 빈 문자열 검증, `DeleteSkillUseCase` 인스턴스화 및 실행, `revalidatePath('/admin/skills')` 호출. 에러 시 `{ success: false; error: string }` 반환. (depends on T002, T003)

**Checkpoint**: Backend 삭제 파이프라인 완성 — Server Action 호출로 스킬 삭제 가능

---

## Phase 2: User Story 1+2 - 삭제 확인 다이얼로그 + 통계 영향 경고 (Priority: P1) 🎯 MVP

**Goal**: 삭제 버튼 클릭 시 확인 다이얼로그가 나타나고, 통계 데이터 영향 경고 메시지가 시각적으로 강조되어 표시된다.

**Independent Test**: 삭제 버튼 클릭 → 다이얼로그 표시 → 스킬 이름 + 경고 메시지 확인 → 취소 시 닫힘 → 오버레이 클릭 시 닫힘

### Implementation for User Story 1+2

- [x] T005 [P] [US1] [US2] Create `SkillDeleteConfirmDialog` component in `src/features/admin/SkillDeleteConfirmDialog.tsx` — 기존 `AlertDialog` (Shadcn/Radix) 기반. Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `skillTitle: string`, `onConfirm: () => void`, `isDeleting: boolean`. 다이얼로그 내용: 제목 "스킬 삭제", 스킬 이름 표시(FR-002), 통계 영향 경고 메시지(FR-003) — `AlertTriangle` 아이콘(lucide-react) + amber 계열 배경으로 시각적 강조(FR-004). 취소/삭제 버튼 포함(삭제 버튼은 destructive 스타일). 기존 `CloseConfirmDialog.tsx` 패턴 참조.
- [x] T006 [US1] Integrate `SkillDeleteConfirmDialog` into `src/features/admin/SkillCard.tsx` — 삭제 버튼(`Trash2` 아이콘)에 onClick 핸들러 추가. `useState`로 `isDeleteDialogOpen` 상태 관리. `SkillDeleteConfirmDialog`를 SkillCard 내부에 렌더링. Props로 `skill.title`과 상태 전달. (depends on T005)

**Checkpoint**: 삭제 버튼 클릭 → 다이얼로그 표시(스킬 이름 + 경고) → 취소/오버레이로 닫기 동작 확인 가능

---

## Phase 3: User Story 3 - 스킬 삭제 실행 (Priority: P1)

**Goal**: 다이얼로그에서 "삭제" 확인 시 실제 삭제가 실행되고, 로딩 상태·성공/실패 토스트·목록 갱신이 처리된다.

**Independent Test**: 삭제 확인 → 로딩 상태 → 성공 토스트 + 목록 갱신 (또는 실패 토스트 + 데이터 유지)

### Implementation for User Story 3

- [x] T007 [US3] Wire `onConfirm` handler in `src/features/admin/SkillCard.tsx` — `deleteSkill` 서버 액션 import, `onConfirm` 콜백에서 서버 액션 호출. `useState`로 `isDeleting` 상태 관리하여 삭제 중 버튼 비활성화(FR-007) 및 중복 클릭 방지. `isDeleting` 상태를 `SkillDeleteConfirmDialog`의 `isDeleting` prop으로 전달. (depends on T004, T006)
- [x] T008 [US3] Add toast notifications in `src/features/admin/SkillCard.tsx` — `sonner`의 `toast` import. 삭제 성공 시 `toast.success('스킬이 삭제되었습니다')`, 실패 시 `toast.error(result.error)` 호출(FR-009). 다이얼로그 닫기 처리. (depends on T007)
- [x] T009 [US3] Handle loading state in `SkillDeleteConfirmDialog` component in `src/features/admin/SkillDeleteConfirmDialog.tsx` — `isDeleting` prop이 true일 때: 삭제 버튼 `disabled` + 로딩 스피너 표시, 취소 버튼 `disabled`, 오버레이 클릭으로 닫기 방지(`onOpenChange`에서 `isDeleting` 체크). (depends on T007)

**Checkpoint**: 전체 삭제 플로우 동작 — 삭제 버튼 → 다이얼로그(경고) → 삭제 확인 → 로딩 → 성공 토스트 + 목록 갱신

---

## Phase 4: Tests

**Purpose**: Constitution Principle III 준수 — Unit 테스트 + E2E 테스트

- [ ] T010 [P] Unit test for `DeleteSkillUseCase` in `src/admin/application/__tests__/delete-skill-use-case.test.ts` — Mock `AdminRepository`, 성공/실패 케이스 테스트: 정상 삭제 시 `{ success: true }` 반환, repository 에러 시 `{ success: false, error }` 반환
- [ ] T011 [P] E2E test for skill delete flow in `src/__tests__/e2e/skill-delete.spec.ts` — Playwright로 관리자 로그인 → 스킬 목록 → 삭제 버튼 클릭 → 다이얼로그 표시 확인(스킬 이름, 경고 메시지) → 취소 동작 확인 → 삭제 확인 → 성공 토스트 → 목록에서 제거 확인

**Checkpoint**: 모든 테스트 통과 — Unit + E2E

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 코드 품질 확인 및 마무리

- [x] T012 Run TypeScript type check (`tsc --noEmit`) to verify no `any` types or type errors
- [ ] T013 Verify `revalidatePath` correctly refreshes skill list after deletion (manual QA)
- [ ] T014 Run quickstart.md validation — 전체 플로우 수동 검증

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately
- **US1+US2 (Phase 2)**: T005 can start in parallel with Phase 1 (UI 독립). T006 depends on T005.
- **US3 (Phase 3)**: Depends on Phase 1 (T004) + Phase 2 (T006) completion
- **Tests (Phase 4)**: T010 depends on T002. T011 depends on Phase 3 completion.
- **Polish (Phase 5)**: Depends on Phase 3+4 completion

### User Story Dependencies

- **US1+US2 (다이얼로그+경고)**: T005 can start after Phase 1 begins (no backend dependency for UI shell). T006 depends on T005.
- **US3 (삭제 실행)**: Depends on T004 (server action) + T006 (dialog integration). This is the integration point.

### Within Each Phase

```
Phase 1: T001 ──┬──→ T003 ──→ T004
                │
          T002 ─┘

Phase 2: T005 ──→ T006

Phase 3: T007 ──→ T008
                   T009 (parallel with T008, same depends)

Phase 4: T010 (parallel, independent)
         T011 (parallel, independent)
```

### Parallel Opportunities

```
# Phase 1 — T001과 T002는 서로 다른 파일, 병렬 가능:
T001: Add DeleteSkillResult type in src/admin/domain/types.ts
T002: Create DeleteSkillUseCase in src/admin/application/delete-skill-use-case.ts

# Phase 1 + Phase 2 — T005는 Phase 1과 병렬 가능 (UI 셸 먼저 구축):
T001+T002 (backend)  ║  T005 (dialog UI)

# Phase 4 — 두 테스트 병렬 가능:
T010: Unit test for DeleteSkillUseCase
T011: E2E test for skill delete flow
```

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2)

1. Complete Phase 1: Foundational (backend 삭제 파이프라인)
2. Complete Phase 2: US1+US2 (다이얼로그 + 경고 메시지)
3. **STOP and VALIDATE**: 다이얼로그 표시, 경고 메시지, 취소 동작 독립 검증
4. Deploy/demo if ready (삭제 실행 없이 다이얼로그만 동작)

### Full Delivery

1. Complete Phase 1 + Phase 2 → MVP ready
2. Complete Phase 3: US3 → Full delete flow operational
3. Complete Phase 4: Tests → Quality validated
4. Complete Phase 5: Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- US1(다이얼로그)과 US2(경고 메시지)는 동일 `SkillDeleteConfirmDialog` 컴포넌트에서 구현되므로 하나의 Phase로 통합
- 신규 패키지 추가 없음 — 기존 Shadcn AlertDialog, Sonner, lucide-react 활용
- 삭제 순서(feedback_logs → templates+storage → skill+storage)는 T003에서 구현
- Commit after each task or logical group
