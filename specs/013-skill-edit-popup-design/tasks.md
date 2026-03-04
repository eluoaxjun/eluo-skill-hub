# Tasks: 스킬 수정 팝업 디자인

**Input**: Design documents from `/specs/013-skill-edit-popup-design/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new dependencies or project initialization needed — existing project with all required packages.

(No tasks — skip to Phase 2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain types, repository methods, use cases, and server actions that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Add `SkillDetail`, `UpdateSkillInput`, `UpdateSkillResult`, `GetSkillResult` types and extend `AdminRepository` interface in `src/admin/domain/types.ts`
- [x] T002 Implement `getSkillById()` method in `src/admin/infrastructure/supabase-admin-repository.ts` — query `skills` table with category join + `skill_templates` query, return `SkillDetail`
- [x] T003 Implement `updateSkill()` method in `src/admin/infrastructure/supabase-admin-repository.ts` — update skill fields, handle markdown file delete/upload, handle template files delete/add via Supabase Storage
- [x] T004 [P] Create `GetSkillByIdUseCase` class in `src/admin/application/get-skill-by-id-use-case.ts` — delegates to `repository.getSkillById()`
- [x] T005 [P] Create `UpdateSkillUseCase` class in `src/admin/application/update-skill-use-case.ts` — delegates to `repository.updateSkill()`
- [x] T006 Add `getSkillById()` server action in `src/app/admin/skills/actions.ts` — verifyAdmin, call GetSkillByIdUseCase, return `GetSkillResult`
- [x] T007 Add `updateSkill(formData: FormData)` server action in `src/app/admin/skills/actions.ts` — verifyAdmin, parse FormData (including `skillId`, `removeMarkdown`, `removedTemplateIds` JSON), validate fields (same rules as createSkill), call UpdateSkillUseCase, return `UpdateSkillResult`

**Checkpoint**: All backend infrastructure ready — getSkillById and updateSkill are callable from UI components.

---

## Phase 3: User Story 1 — 스킬 카드에서 수정 팝업 열기 (Priority: P1) 🎯 MVP

**Goal**: 관리자가 스킬 카드의 수정 버튼을 클릭하면 기존 데이터가 채워진 수정 팝업이 모달로 나타난다.

**Independent Test**: 스킬 카드의 수정 버튼 클릭 → 모달 팝업 열림 → 아이콘, 제목, 설명, 카테고리, 공개 상태, 파일 정보가 기존 데이터와 일치하는지 확인.

### Implementation for User Story 1

- [x] T008 [US1] Extend `SkillAddForm` props in `src/features/admin/SkillAddForm.tsx` — add `mode?: 'add' | 'edit'`, `skillId?: string`, `initialData?: SkillDetail` props. When `mode='edit'`, initialize form state from `initialData` instead of `INITIAL_STATE`. Update `isDirtyState()` to compare against initialData in edit mode. Change submit button text to "수정 저장하기" when mode is edit.
- [x] T009 [US1] Create `SkillEditModal` component in `src/features/admin/SkillEditModal.tsx` — clone SkillAddModal structure (glass overlay, close/escape handling, dirty state tracking, DraftSaveDialog, CloseConfirmDialog). Accept `skillId`, `initialData: SkillDetail`, `categories: CategoryOption[]` props. Render `SkillAddForm` with `mode='edit'`.
- [x] T010 [US1] Create intercepting modal route at `src/app/admin/skills/@modal/(.)edit/[id]/page.tsx` — server component that calls `getSkillById(params.id)` and `getCategories()`, handles error (redirect or error message), renders `SkillEditModal` with fetched data.
- [x] T011 [US1] Update `SkillCard` edit button in `src/features/admin/SkillCard.tsx` — replace the static `<button>` with a Next.js `<Link href={/admin/skills/edit/${skill.id}}>` wrapping the existing button styling, enabling client-side navigation to trigger the intercepting modal route.

**Checkpoint**: 스킬 카드 수정 버튼 클릭 → 기존 데이터가 채워진 모달 팝업이 열린다. 닫기(Escape/X) 동작은 추가 팝업과 동일.

---

## Phase 4: User Story 2 — URL 직접 접근으로 수정 팝업 열기 (Priority: P1)

**Goal**: `/admin/skills/edit/[id]`를 브라우저에 직접 입력하면 전체 페이지 형태로 수정 화면이 표시된다.

**Independent Test**: 브라우저 주소창에 `/admin/skills/edit/[유효한ID]` 직접 입력 → 전체 페이지로 수정 화면 표시. `/admin/skills/edit/[잘못된ID]` → 오류 메시지 + 목록 링크.

### Implementation for User Story 2

- [x] T012 [US2] Create full-page edit route at `src/app/admin/skills/edit/[id]/page.tsx` — server component that calls `getSkillById(params.id)` and `getCategories()`. Success: render sidebar layout with back button (ChevronLeft) + `SkillAddForm` with `mode='edit'` (same pattern as `new/page.tsx`). Error: display error message with link to `/admin/skills`.
- [x] T013 [US2] Handle invalid skill ID in both modal and full-page routes — if `getSkillById` returns `{ success: false }`, show error UI with "스킬을 찾을 수 없습니다." message and "목록으로 돌아가기" link to `/admin/skills`.

**Checkpoint**: URL 직접 접근 시 전체 페이지 수정 화면. 잘못된 ID 접근 시 오류 메시지. 모달과 전체 페이지 모두 정상 동작.

---

## Phase 5: User Story 3 — 기존 파일 삭제 및 새 파일 업로드 (Priority: P2)

**Goal**: 수정 팝업에서 이미 업로드된 마크다운/템플릿 파일을 삭제하고 새 파일을 업로드할 수 있다.

**Independent Test**: 수정 팝업에서 기존 마크다운 파일 삭제 → 미리보기 초기화. 새 파일 업로드 → 미리보기 표시. 기존 템플릿 파일 삭제 + 새 파일 추가 → 목록 반영.

### Implementation for User Story 3

- [x] T014 [P] [US3] Extend `MarkdownFileUpload` in `src/features/admin/MarkdownFileUpload.tsx` — add optional `existingFileName?: string` and `existingContent?: string` props. When in edit mode with existing file: display file name and preview from `existingContent` initially. Show delete button to clear existing file. After deletion, allow new file upload. Track `removedExisting: boolean` state internally and expose via `onExistingRemoved?: () => void` callback.
- [x] T015 [P] [US3] Extend `TemplateFileUpload` in `src/features/admin/TemplateFileUpload.tsx` — add optional `existingFiles?: SkillTemplateRow[]` props. Display existing files as chips with file name, size, and delete button (same styling as new file chips). Track `removedExistingIds: string[]` internally. Enforce max 10 total (existing minus removed plus new). Expose via `onExistingRemoved?: (ids: string[]) => void` callback.
- [x] T016 [US3] Integrate file state management in `SkillAddForm.tsx` edit mode — when `mode='edit'`, pass `initialData.markdownContent` and markdown file name to MarkdownFileUpload. Pass `initialData.templates` to TemplateFileUpload. Track `removeMarkdown` and `removedTemplateIds` state. Include these in the `UpdateSkillInput` when building form data for submission.

**Checkpoint**: 수정 팝업에서 기존 파일이 표시되고, 삭제/추가가 정상 동작한다. (아직 저장 미구현 — 다음 Phase에서)

---

## Phase 6: User Story 4 — 수정 내용 저장 (Priority: P2)

**Goal**: 수정 팝업에서 변경한 내용을 저장하면 데이터베이스에 반영되고 스킬 목록이 갱신된다.

**Independent Test**: 수정 팝업에서 제목/설명/카테고리/공개상태 변경 후 저장 → 스킬 목록에 변경사항 반영. 파일 교체 후 저장 → 스토리지 반영.

### Implementation for User Story 4

- [x] T017 [US4] Implement edit mode form submission in `SkillAddForm.tsx` — when `mode='edit'`, `handleSubmit` builds FormData with `skillId`, `removeMarkdown`, `removedTemplateIds` (JSON string), then calls `updateSkill(formData)` server action instead of `createSkill`. Handle success: toast "스킬이 수정되었습니다." + `router.back()`. Handle error: display error message, keep form data.
- [x] T018 [US4] Extend `DraftSaveDialog` in `src/features/admin/DraftSaveDialog.tsx` — add `mode?: 'add' | 'edit'` and `skillId?: string` props. When `mode='edit'`, call `updateSkill` with `isPublished: false` instead of `createSkill`. Update dialog text to reflect edit context.
- [x] T019 [US4] Wire DraftSaveDialog edit mode in `SkillEditModal.tsx` — pass `mode='edit'` and `skillId` to DraftSaveDialog. Ensure `onRequestDraftSave` from SkillAddForm passes the correct `UpdateSkillInput` to the dialog.

**Checkpoint**: 모든 수정 기능이 완전히 동작. 필드 변경 저장, 파일 교체 저장, 임시저장 모두 정상.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling and validation

- [x] T020 Run `pnpm tsc --noEmit` to verify zero type errors across all modified and new files
- [x] T021 Verify edge cases: saving with all templates removed, saving with markdown removed, saving with no changes, accessing deleted skill URL

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Skipped — no new dependencies
- **Phase 2 (Foundational)**: No dependencies — start immediately. BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 (reuses SkillAddForm edit mode from US1)
- **Phase 5 (US3)**: Depends on Phase 3 (needs SkillAddForm edit mode infrastructure)
- **Phase 6 (US4)**: Depends on Phase 5 (needs file state management for complete save)
- **Phase 7 (Polish)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — MVP entry point
- **US2 (P1)**: Depends on US1 (shares SkillAddForm edit mode, SkillEditModal patterns)
- **US3 (P2)**: Depends on US1 (extends SkillAddForm edit mode with file management)
- **US4 (P2)**: Depends on US3 (needs file state for complete updateSkill submission)

### Within Each User Story

- Repository/types before use cases before server actions
- Server-side before client-side components
- Modal components before routing pages
- Core implementation before integration

### Parallel Opportunities

- **Phase 2**: T004 and T005 (use cases) can run in parallel after T001-T003
- **Phase 3**: T010 and T011 can start after T008-T009
- **Phase 5**: T014 and T015 (file upload components) can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Sequential: Types → Repository
T001: Add domain types to src/admin/domain/types.ts
T002: Implement getSkillById in repository (depends on T001)
T003: Implement updateSkill in repository (depends on T001)

# Parallel: Use cases (after T001)
T004: Create GetSkillByIdUseCase  ← can run in parallel
T005: Create UpdateSkillUseCase   ← can run in parallel

# Sequential: Server actions (after T002-T005)
T006: Add getSkillById server action (depends on T004)
T007: Add updateSkill server action (depends on T005)
```

## Parallel Example: Phase 5 (US3 — File Management)

```bash
# Parallel: File upload components (independent files)
T014: Extend MarkdownFileUpload  ← can run in parallel
T015: Extend TemplateFileUpload  ← can run in parallel

# Sequential: Integration (depends on T014, T015)
T016: Integrate file state in SkillAddForm
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (domain types + repository + use cases + server actions)
2. Complete Phase 3: US1 (SkillAddForm edit mode + SkillEditModal + modal route + SkillCard link)
3. **STOP and VALIDATE**: 스킬 카드 수정 버튼 → 모달 열림 → 기존 데이터 표시 확인
4. Deploy/demo if ready (read-only edit popup)

### Incremental Delivery

1. Phase 2 (Foundational) → Backend ready
2. Phase 3 (US1) → MVP: 모달에서 수정 팝업 열기 ✅
3. Phase 4 (US2) → 추가: URL 직접 접근 + 전체 페이지 ✅
4. Phase 5 (US3) → 추가: 파일 삭제/업로드 UI ✅
5. Phase 6 (US4) → 완성: 저장 기능 ✅
6. Phase 7 (Polish) → 마무리: 타입 검증 + 엣지 케이스 ✅

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1+US2는 모두 P1이지만, US2가 US1의 컴포넌트를 재사용하므로 순차 구현
- US3+US4는 모두 P2이며, US4가 US3의 파일 상태 관리에 의존하므로 순차 구현
- 기존 SkillAddForm을 직접 확장하므로, 추가 팝업 기능이 깨지지 않도록 mode 분기에 주의
- Commit after each task or logical group
