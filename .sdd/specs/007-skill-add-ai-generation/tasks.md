# Tasks: 스킬 추가 - AI 제목/설명 자동 생성 (Claude Code CLI)

- **Feature ID**: 007
- **Version**: 2.0
- **Created**: 2026-03-02
- **표기**: [P] = 병렬 실행 가능, [TEST] = TDD 테스트 먼저, [DEL] = 삭제

---

## Phase 1. DB 마이그레이션 + 스킬 정의 (병렬 가능)

### TASK-001 [P] — DB 마이그레이션: `description`, `markdown_content` 컬럼 추가
- **대상**: Supabase `skills` 테이블
- **작업**: Supabase MCP `apply_migration` 사용
  ```sql
  ALTER TABLE skills
    ADD COLUMN description text,
    ADD COLUMN markdown_content text;
  ```
- **완료 조건**: `skills` 테이블에 두 컬럼 존재 확인

### TASK-002 [P] — Claude Code 스킬 정의 파일 생성
- **대상 파일**: `.claude/commands/add-skill.md` (신규)
- **작업**: 아래 내용으로 스킬 정의 파일 작성
  ```markdown
  ---
  description: 마크다운 파일을 분석해 스킬 메타데이터를 자동 생성하고 DB에 등록한다
  argument-hint: "<category_slug> <path/to/skill.md>"
  ---

  ## 스킬 등록 프로세스

  $ARGUMENTS에서 첫 번째 인수를 category_slug, 두 번째 인수를 file_path로 파싱한다.
  인수가 부족하면 다음 사용법을 안내하고 중단한다:
    사용법: /add-skill <category_slug> <path/to/skill.md>
    예시: /add-skill planning ./my-skill.md

  ### 1. 파일 검증
  - file_path의 파일을 읽는다.
  - 파일이 없으면 "파일을 찾을 수 없습니다: <path>" 안내 후 중단.
  - .md 확장자가 아니면 ".md 파일만 등록할 수 있습니다." 안내 후 중단.

  ### 2. 메타데이터 생성
  마크다운 내용을 분석하여 생성한다:
  - title: 스킬의 목적을 한눈에 알 수 있는 제목, 30자 이내, 한국어
  - description: 스킬의 기능과 용도를 설명하는 텍스트, 150자 이내, 한국어

  ### 3. 카테고리 조회
  Supabase MCP로 카테고리 ID를 조회한다:
  ```sql
  SELECT id, name FROM categories WHERE slug = '<category_slug>';
  ```
  결과가 없으면 사용 가능한 카테고리 목록을 출력하고 중단한다:
  ```sql
  SELECT slug, name FROM categories ORDER BY sort_order;
  ```

  ### 4. Admin 사용자 조회
  Supabase MCP로 admin 역할의 사용자 ID를 조회한다:
  ```sql
  SELECT p.id FROM profiles p
  JOIN roles r ON p.role_id = r.id
  WHERE r.name = 'admin'
  LIMIT 1;
  ```

  ### 5. 스킬 등록
  Supabase MCP로 skills 테이블에 삽입한다:
  ```sql
  INSERT INTO skills (id, title, description, markdown_content, category_id, author_id, status)
  VALUES (
    gen_random_uuid(),
    '<generated_title>',
    '<generated_description>',
    '<full_markdown_content>',
    '<category_uuid>',
    '<admin_user_uuid>',
    'active'
  )
  RETURNING id, title, description;
  ```

  ### 6. 결과 출력
  등록 완료 메시지를 출력한다:
  ```
  ✅ 스킬 등록 완료
  - ID: <uuid>
  - 제목: <title>
  - 설명: <description>
  - 카테고리: <category_name>
  ```
  ```
- **완료 조건**: 파일 생성, `/add-skill` 명령으로 실행 가능

---

> **CHECKPOINT A**: TASK-001, TASK-002 완료 확인 후 Phase 2 진행

---

## Phase 2. 도메인 계층 (TDD)

### TASK-003 [TEST] — `ManagedSkill` 엔티티 테스트 업데이트
- **대상 파일**: `src/skill-marketplace/domain/__tests__/ManagedSkill.test.ts`
- **작업**: 기존 `baseProps`에 `description` 필드 추가, 새 케이스 추가
  - `description` getter가 정상 동작한다 (`'AI가 생성한 설명'`)
  - `description`이 null일 수 있다
- **완료 조건**: 테스트 작성 완료 (실패 상태 OK)

### TASK-004 — `ManagedSkill` 엔티티에 `description` 추가
- **의존**: TASK-003
- **대상 파일**: `src/skill-marketplace/domain/entities/ManagedSkill.ts`
- **작업**:
  - `ManagedSkillProps`에 `description: string | null` 추가
  - private `_description` 필드 + getter 추가
- **완료 조건**: TASK-003 테스트 통과

### TASK-005 — `ManagedSkillWithCategory`에 `description` 추가
- **의존**: TASK-004
- **대상 파일**: `src/skill-marketplace/domain/repositories/ManagedSkillRepository.ts`
- **작업**: `ManagedSkillWithCategory` 인터페이스에 `description: string | null` 추가
- **완료 조건**: 타입 에러 없음

---

> **CHECKPOINT B**: TASK-003~005 완료, `npm test -- ManagedSkill` 통과 확인

---

## Phase 3. 인프라 계층

### TASK-006 — `SupabaseManagedSkillRepository.findAll()` 업데이트
- **의존**: TASK-001, TASK-005
- **대상 파일**: `src/skill-marketplace/infrastructure/SupabaseManagedSkillRepository.ts`
- **작업**:
  - `SkillRow` 인터페이스에 `description: string | null` 추가
  - `findAll()` SELECT 쿼리에 `description` 추가
  - 결과 매핑에 `description` 포함
- **완료 조건**: 타입 에러 없음

### TASK-007 — `getSkillMarkdown` Server Action을 DB 우선으로 변경
- **의존**: TASK-001
- **대상 파일**: `src/app/admin/skills/actions.ts`
- **작업**:
  - `getSkillMarkdown(markdownFilePath)` 내부 로직 변경:
    1. `skills` 테이블에서 `markdown_content` 컬럼 조회 (WHERE `markdown_file_path` = 인수)
    2. `markdown_content`가 있으면 바로 반환
    3. 없으면 기존 Supabase Storage 다운로드 로직 유지 (폴백)
  - `createSkill` Server Action 삭제
  - `getCategories` Server Action 삭제
- **완료 조건**: `createSkill`, `getCategories`가 파일에서 제거됨. `getSkillMarkdown`이 DB 우선으로 동작

---

> **CHECKPOINT C**: TASK-006~007 완료 확인

---

## Phase 4. UI 정리

### TASK-008 [DEL][P] — `AddSkillModal.tsx` 삭제
- **대상 파일**:
  - `src/features/admin/AddSkillModal.tsx` → 삭제
  - `src/features/admin/__tests__/AddSkillModal.test.tsx` → 삭제
- **완료 조건**: 두 파일이 존재하지 않음

### TASK-009 [TEST][P] — `AdminSkillsPage.test.tsx` 업데이트
- **의존**: TASK-008 (파일 삭제 후)
- **대상 파일**: `src/features/admin/__tests__/AdminSkillsPage.test.tsx`
- **작업**: 업로드 관련 테스트 케이스 제거
  - `'스킬 추가하기' 버튼이 테이블 상단에 표시된다` → 삭제
  - `'스킬 추가하기' 버튼 클릭 시 AddSkillModal이 열린다` → 삭제
  - `AddSkillModal에 CategoryOption[] 형태로 카테고리 목록이 전달된다` → 삭제
  - `스킬 등록 성공 시 성공 Toast가 표시된다` → 삭제
  - `스킬 등록 실패 시 실패 Toast와 오류 메시지가 표시된다` → 삭제
  - 유지: `SkillTable이 스킬 목록과 함께 렌더링된다`, `스킬 행 클릭 시 SkillPreviewModal이 열린다`
  - `mockCreateSkill`, `mockCategories` prop 관련 코드 제거
- **완료 조건**: 테스트 파일에 업로드 관련 케이스 없음

### TASK-010 — `AdminSkillsPage.tsx` 업로드 기능 제거
- **의존**: TASK-008, TASK-009
- **대상 파일**: `src/features/admin/AdminSkillsPage.tsx`
- **작업**:
  - `AddSkillModal` import 제거
  - `CategoryOption` import 제거
  - `CreateManagedSkillResult` import 제거
  - `AdminSkillsPageProps`에서 `categories`, `createSkill` 제거
  - `isAddModalOpen` state 제거
  - `handleSubmit` 함수 제거
  - '스킬 추가하기' 버튼 제거
  - `<AddSkillModal>` JSX 제거
- **완료 조건**: TASK-009 테스트 통과, 타입 에러 없음

### TASK-011 — `page.tsx` (admin/skills) 정리
- **의존**: TASK-010
- **대상 파일**: `src/app/admin/skills/page.tsx`
- **작업**:
  - `getCategories`, `createSkill` import 제거
  - `Promise.all`에서 `getCategories()` 제거
  - `AdminSkillsPage`에서 `categories`, `createSkill` prop 제거
- **완료 조건**: 타입 에러 없음, 페이지 정상 렌더링

---

> **CHECKPOINT D**: TASK-008~011 완료, `npm test -- AdminSkillsPage` 통과 확인

---

## Phase 5. 최종 검증

### TASK-012 — 전체 단위 테스트 통과 확인
- **작업**: `npm test` 전체 실행
- **완료 조건**: 모든 테스트 통과

### TASK-013 — 수용 기준 체크리스트 수동 검증
- **작업**: spec.md §7 수용 기준을 직접 확인
  - [ ] `/add-skill planning my-skill.md` 실행 시 DB에 저장된다
  - [ ] 잘못된 카테고리 슬러그 입력 시 목록이 출력된다
  - [ ] `.md` 이외 파일 지정 시 오류 안내 후 중단된다
  - [ ] `/admin/skills` 페이지에 '스킬 추가하기' 버튼이 없다
  - [ ] 스킬 행 클릭 시 마크다운 미리보기 모달이 정상 동작한다
  - [ ] `skills` 테이블에 `description`, `markdown_content` 컬럼이 존재한다

---

## 태스크 의존성 요약

```
TASK-001 ─┐
TASK-002 ─┘ (병렬)
              │
TASK-003 ─ TASK-004 ─ TASK-005 ─ TASK-006
                                       │
              TASK-007 ─────────────────┘ (독립)
              │
TASK-008 ─ TASK-009 ─ TASK-010 ─ TASK-011
                                       │
                              TASK-012 ─ TASK-013
```

**병렬 실행 가능 그룹:**
- `TASK-001` + `TASK-002`: DB 마이그레이션 + 스킬 정의 파일
- `TASK-008` + `TASK-009`: 파일 삭제 + 테스트 업데이트
