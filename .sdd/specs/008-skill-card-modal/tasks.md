# Tasks: 스킬 카드 팝업 (모달, 북마크, 피드백)

- **Feature ID**: 008
- **Created**: 2026-03-02
- **표기**: [P] = 병렬 실행 가능, [TEST] = TDD 테스트 먼저, [MOD] = 기존 파일 수정

---

## Phase 0. DB 마이그레이션

### TASK-001 — DB 마이그레이션: `bookmarks`, `skill_feedback_logs` 테이블 생성

- **대상**: Supabase (MCP `apply_migration` 사용)
- **작업**:
  ```sql
  -- bookmarks 테이블
  CREATE TABLE bookmarks (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id   uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, skill_id)
  );
  ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

  -- skill_feedback_logs 테이블
  CREATE TABLE skill_feedback_logs (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id   uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    rating     integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    text,
    created_at timestamptz DEFAULT now()
  );
  ALTER TABLE skill_feedback_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "feedback_select_own" ON skill_feedback_logs FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "feedback_insert_own" ON skill_feedback_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```
- **완료 조건**: 두 테이블이 Supabase에 생성되고 RLS 정책이 적용됨

---

> **CHECKPOINT 0**: TASK-001 완료 확인 후 Phase 1 진행

---

## Phase 1. skill-marketplace 도메인 확장 (TDD)

### TASK-002 [TEST][MOD] — `Skill` 엔티티 테스트 업데이트

- **대상 파일**: `src/skill-marketplace/domain/__tests__/Skill.test.ts`
- **작업**: 기존 테스트에 신규 필드 케이스 추가
  - `markdownContent` getter가 문자열을 반환한다
  - `markdownContent` getter가 null을 반환할 수 있다
  - `createdAt` getter가 Date 인스턴스를 반환한다
- **완료 조건**: 테스트 작성 완료 (실패 상태 OK — Red 단계)

### TASK-003 [MOD] — `Skill` 엔티티 확장

- **의존**: TASK-002
- **대상 파일**: `src/skill-marketplace/domain/entities/Skill.ts`
- **작업**:
  - 생성자 파라미터에 `markdownContent: string | null`, `createdAt: Date` 추가
  - private 필드 `_markdownContent`, `_createdAt` 추가
  - getter `markdownContent`, `createdAt` 추가
- **완료 조건**: TASK-002 테스트 통과 (Green 단계)

### TASK-004 [MOD] — `InMemorySkillRepository` 업데이트

- **의존**: TASK-003
- **대상 파일**: `src/skill-marketplace/infrastructure/InMemorySkillRepository.ts`
- **작업**: 기존 6개 `Skill` 생성자 호출에 `null`, `new Date()` 인수 추가
- **완료 조건**: 기존 단위 테스트 모두 통과, 타입 에러 없음

---

> **CHECKPOINT 1**: TASK-002~004 완료, `npm test -- Skill` 통과 확인

---

## Phase 2. bookmark 바운디드 컨텍스트 (TDD)

### TASK-005 [P][TEST] — `Bookmark` 엔티티 단위 테스트 작성

- **대상 파일**: `src/bookmark/domain/__tests__/Bookmark.test.ts` (신규)
- **작업**: 테스트 케이스 작성
  - `Bookmark.create()` 호출 시 id, userId, skillId, createdAt을 갖는 엔티티 생성
  - getter들이 props 값을 올바르게 반환한다
- **완료 조건**: 테스트 파일 생성 완료 (Red 단계)

### TASK-006 [P] — `Bookmark` 엔티티 + `BookmarkRepository` 인터페이스 구현

- **의존**: TASK-005
- **대상 파일**:
  - `src/bookmark/domain/entities/Bookmark.ts` (신규)
  - `src/bookmark/domain/repositories/BookmarkRepository.ts` (신규)
- **작업**:
  - `Bookmark` 엔티티: `BookmarkProps { id, userId, skillId, createdAt }`, `static create()`, getters
  - `BookmarkRepository` 인터페이스:
    ```typescript
    export interface BookmarkRepository {
      findSkillIdsByUserId(userId: string): Promise<string[]>;
      toggle(userId: string, skillId: string): Promise<{ isBookmarked: boolean }>;
    }
    ```
- **완료 조건**: TASK-005 테스트 통과

---

## Phase 3. skill-feedback 바운디드 컨텍스트 (TDD, Phase 2와 병렬)

### TASK-007 [P][TEST] — `FeedbackLog` 엔티티 단위 테스트 작성

- **대상 파일**: `src/skill-feedback/domain/__tests__/FeedbackLog.test.ts` (신규)
- **작업**: 테스트 케이스 작성
  - `FeedbackLog.create()` 호출 시 엔티티 생성
  - rating이 1~5 범위 밖이면 `RangeError` 발생 (`rating = 0`, `rating = 6`)
  - comment가 null일 수 있다
- **완료 조건**: 테스트 파일 생성 완료 (Red 단계)

### TASK-008 [P] — `FeedbackLog` 엔티티 + `FeedbackLogRepository` 인터페이스 구현

- **의존**: TASK-007
- **대상 파일**:
  - `src/skill-feedback/domain/entities/FeedbackLog.ts` (신규)
  - `src/skill-feedback/domain/repositories/FeedbackLogRepository.ts` (신규)
- **작업**:
  - `FeedbackLog` 엔티티: `FeedbackLogProps { id, userId, skillId, rating, comment, createdAt }`, `static create()`에서 rating 유효성 검사, getters
  - `FeedbackLogRepository` 인터페이스:
    ```typescript
    export interface FeedbackLogRepository {
      save(log: FeedbackLog): Promise<void>;
    }
    ```
- **완료 조건**: TASK-007 테스트 통과

---

> **CHECKPOINT 2**: TASK-005~008 완료, `npm test -- Bookmark FeedbackLog` 통과 확인

---

## Phase 4. Application Layer (TDD, 병렬 가능)

### TASK-009 [P][TEST] — `ToggleBookmarkUseCase` 테스트 작성

- **대상 파일**: `src/bookmark/application/__tests__/ToggleBookmarkUseCase.test.ts` (신규)
- **작업**: mock `BookmarkRepository` 사용, 테스트 케이스 작성
  - `execute()` 호출 시 `repository.toggle(userId, skillId)`를 실행한다
  - 반환값 `{ isBookmarked: boolean }`을 그대로 반환한다
- **완료 조건**: 테스트 파일 생성 완료 (Red 단계)

### TASK-010 [P][TEST] — `GetBookmarkedSkillsUseCase` 테스트 작성

- **대상 파일**: `src/bookmark/application/__tests__/GetBookmarkedSkillsUseCase.test.ts` (신규)
- **작업**: mock `BookmarkRepository` 사용, 테스트 케이스 작성
  - `execute(userId)` 호출 시 `repository.findSkillIdsByUserId(userId)`를 실행한다
  - 반환된 skill ID 배열을 그대로 반환한다
- **완료 조건**: 테스트 파일 생성 완료 (Red 단계)

### TASK-011 [P][TEST] — `SubmitFeedbackUseCase` 테스트 작성

- **대상 파일**: `src/skill-feedback/application/__tests__/SubmitFeedbackUseCase.test.ts` (신규)
- **작업**: mock `FeedbackLogRepository` 사용, 테스트 케이스 작성
  - 유효한 rating(3)과 comment로 `execute()` 호출 시 `repository.save()`가 실행된다
  - `repository.save()` 인수로 전달된 `FeedbackLog`의 rating, comment가 올바르다
  - rating이 0이면 에러가 발생한다 (FeedbackLog.create()에서 처리)
- **완료 조건**: 테스트 파일 생성 완료 (Red 단계)

### TASK-012 [P] — `ToggleBookmarkUseCase` 구현

- **의존**: TASK-009, TASK-006
- **대상 파일**: `src/bookmark/application/ToggleBookmarkUseCase.ts` (신규)
- **작업**:
  ```typescript
  export class ToggleBookmarkUseCase {
    constructor(private readonly repository: BookmarkRepository) {}
    async execute(userId: string, skillId: string): Promise<{ isBookmarked: boolean }> {
      return this.repository.toggle(userId, skillId);
    }
  }
  ```
- **완료 조건**: TASK-009 테스트 통과

### TASK-013 [P] — `GetBookmarkedSkillsUseCase` 구현

- **의존**: TASK-010, TASK-006
- **대상 파일**: `src/bookmark/application/GetBookmarkedSkillsUseCase.ts` (신규)
- **작업**:
  ```typescript
  export class GetBookmarkedSkillsUseCase {
    constructor(private readonly repository: BookmarkRepository) {}
    async execute(userId: string): Promise<string[]> {
      return this.repository.findSkillIdsByUserId(userId);
    }
  }
  ```
- **완료 조건**: TASK-010 테스트 통과

### TASK-014 [P] — `SubmitFeedbackUseCase` 구현

- **의존**: TASK-011, TASK-008
- **대상 파일**: `src/skill-feedback/application/SubmitFeedbackUseCase.ts` (신규)
- **작업**:
  ```typescript
  export class SubmitFeedbackUseCase {
    constructor(private readonly repository: FeedbackLogRepository) {}
    async execute(userId: string, skillId: string, rating: number, comment: string | null): Promise<void> {
      const log = FeedbackLog.create({ id: crypto.randomUUID(), userId, skillId, rating, comment, createdAt: new Date() });
      await this.repository.save(log);
    }
  }
  ```
- **완료 조건**: TASK-011 테스트 통과

---

> **CHECKPOINT 3**: TASK-009~014 완료, `npm test -- UseCase` 전체 통과 확인

---

## Phase 5. Infrastructure Layer (병렬 가능)

### TASK-015 [P] — `computeSkillIcon` 유틸 구현

- **대상 파일**: `src/skill-marketplace/infrastructure/utils/computeSkillIcon.ts` (신규)
- **작업**:
  ```typescript
  const SKILL_ICONS = ['🤖', '✍️', '📊', '🔍', '📧', '🎨', '⚡', '📝', '🔧', '🧪', '💡', '🚀'];
  export function computeSkillIcon(id: string): string {
    const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return SKILL_ICONS[sum % SKILL_ICONS.length];
  }
  ```
- **완료 조건**: 동일 id 입력 시 항상 동일 이모지 반환 (결정적)

### TASK-016 [P] — `SupabaseSkillRepository` 구현

- **의존**: TASK-001, TASK-003, TASK-015
- **대상 파일**: `src/skill-marketplace/infrastructure/SupabaseSkillRepository.ts` (신규)
- **작업**:
  - `SkillRow` 인터페이스 정의 (id, title, description, markdown_content, status, created_at, categories)
  - `getRecommended(categoryName?: string)` 구현:
    ```typescript
    // SELECT skills.*, categories(name)
    // WHERE skills.status = 'active'
    // AND (categoryName이 있으면) categories.name = categoryName
    ```
  - row → `Skill` 도메인 엔티티 변환 (`computeSkillIcon(id)`으로 icon 생성)
  - `SkillCategory.create(categoryName, 'primary')`으로 카테고리 변환
- **완료 조건**: 타입 에러 없음, `getRecommended()` 호출 시 `Skill[]` 반환

### TASK-017 [P] — `SupabaseBookmarkRepository` 구현

- **의존**: TASK-001, TASK-006
- **대상 파일**: `src/bookmark/infrastructure/SupabaseBookmarkRepository.ts` (신규)
- **작업**:
  - `findSkillIdsByUserId(userId)`: `SELECT skill_id FROM bookmarks WHERE user_id = $1`
  - `toggle(userId, skillId)`:
    1. `SELECT id FROM bookmarks WHERE user_id = $1 AND skill_id = $2`
    2. 존재하면 `DELETE` → `{ isBookmarked: false }`
    3. 없으면 `INSERT` → `{ isBookmarked: true }`
- **완료 조건**: 타입 에러 없음

### TASK-018 [P] — `SupabaseFeedbackLogRepository` 구현

- **의존**: TASK-001, TASK-008
- **대상 파일**: `src/skill-feedback/infrastructure/SupabaseFeedbackLogRepository.ts` (신규)
- **작업**:
  - `save(log)`: `INSERT INTO skill_feedback_logs (user_id, skill_id, rating, comment)`
- **완료 조건**: 타입 에러 없음

---

## Phase 6. Server Actions

### TASK-019 [P] — `toggleBookmarkAction` 구현

- **의존**: TASK-012, TASK-017
- **대상 파일**: `src/app/actions/bookmarkActions.ts` (신규)
- **작업**:
  ```typescript
  'use server';
  export async function toggleBookmarkAction(skillId: string): Promise<{ isBookmarked: boolean }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('인증 필요');
    const repository = new SupabaseBookmarkRepository(supabase);
    const useCase = new ToggleBookmarkUseCase(repository);
    const result = await useCase.execute(user.id, skillId);
    revalidatePath('/');
    revalidatePath('/myagent');
    return result;
  }
  ```
- **완료 조건**: 타입 에러 없음, Server Action으로 동작

### TASK-020 [P] — `submitFeedbackAction` 구현

- **의존**: TASK-014, TASK-018
- **대상 파일**: `src/app/actions/feedbackActions.ts` (신규)
- **작업**:
  ```typescript
  'use server';
  export async function submitFeedbackAction(
    skillId: string, rating: number, comment: string | null
  ): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('인증 필요');
    const repository = new SupabaseFeedbackLogRepository(supabase);
    const useCase = new SubmitFeedbackUseCase(repository);
    await useCase.execute(user.id, skillId, rating, comment);
  }
  ```
- **완료 조건**: 타입 에러 없음, Server Action으로 동작

---

> **CHECKPOINT 4**: TASK-015~020 완료, 타입 에러 없음 확인

---

## Phase 7. UI — ViewModel + 컴포넌트 (TDD)

### TASK-021 — `SkillViewModel` 타입 정의

- **의존**: TASK-003
- **대상 파일**: `src/features/root-page/types.ts` (신규)
- **작업**:
  ```typescript
  export interface SkillViewModel {
    id: string;
    name: string;
    description: string;
    icon: string;
    categoryName: string;
    markdownContent: string | null;
    createdAt: string; // ISO string
  }
  ```
- **완료 조건**: 타입 파일 생성 완료

### TASK-022 [P][TEST][MOD] — `SkillCard` 컴포넌트 테스트 업데이트

- **의존**: TASK-021
- **대상 파일**: `src/features/root-page/__tests__/SkillCard.test.tsx`
- **작업**: 기존 테스트를 새 props에 맞게 업데이트
  - `<Link>` 대신 `<button>` 렌더링 확인
  - `onClick` prop 전달 및 클릭 시 호출 확인
  - `isBookmarked={true}` 시 북마크 아이콘 표시 확인
  - `isBookmarked={false}` 시 북마크 아이콘 미표시(또는 다른 스타일) 확인
  - 기존 아이콘, 이름, 설명, 카테고리 태그 표시 테스트 유지
- **완료 조건**: 업데이트된 테스트 파일 작성 완료 (Red 단계)

### TASK-023 [P][TEST] — `SkillCardGrid` 컴포넌트 테스트 작성

- **의존**: TASK-021
- **대상 파일**: `src/features/root-page/__tests__/SkillCardGrid.test.tsx` (신규)
- **작업**: 테스트 케이스 작성
  - skills 배열이 전달되면 각 SkillCard가 렌더링된다
  - 스킬 카드 클릭 시 모달이 열린다 (SkillModal이 렌더링된다)
  - 모달 닫기 호출 시 모달이 닫힌다 (SkillModal이 사라진다)
  - `initialBookmarkedIds`에 포함된 스킬은 북마크 상태로 렌더링된다
- **완료 조건**: 테스트 파일 생성 완료 (Red 단계)

### TASK-024 [P][TEST] — `SkillModal` 컴포넌트 테스트 작성

- **의존**: TASK-021
- **대상 파일**: `src/features/root-page/__tests__/SkillModal.test.tsx` (신규)
- **작업**: 테스트 케이스 작성
  - 스킬 제목, 카테고리, 설명이 모달에 렌더링된다
  - X 버튼 클릭 시 `onClose` 콜백이 호출된다
  - 배경(overlay) 클릭 시 `onClose` 콜백이 호출된다
  - `isBookmarked={true}` 시 북마크 버튼이 활성 상태로 표시된다
  - 별점 버튼 클릭 시 해당 점수가 선택된다
  - 피드백 제출 버튼 클릭 시 `submitFeedbackAction`이 호출된다
- **완료 조건**: 테스트 파일 생성 완료 (Red 단계)

### TASK-025 [MOD] — `SkillCard` 컴포넌트 수정

- **의존**: TASK-022
- **대상 파일**: `src/features/root-page/SkillCard.tsx`
- **작업**:
  - Props 타입 변경: `skill: SkillViewModel`, `isBookmarked: boolean`, `onClick: (skill: SkillViewModel) => void`
  - `<Link>` 제거, `<button>` 래퍼로 교체
  - 카드 우측 상단에 북마크 아이콘 뱃지 추가 (`isBookmarked` 기반 스타일)
  - `index` prop은 아이콘 배경색 결정에만 사용 (유지)
- **완료 조건**: TASK-022 테스트 통과

### TASK-026 — `SkillCardGrid` 클라이언트 컴포넌트 구현

- **의존**: TASK-023, TASK-025, TASK-019
- **대상 파일**: `src/features/root-page/SkillCardGrid.tsx` (신규)
- **작업**: `'use client'` 선언
  ```typescript
  interface SkillCardGridProps {
    skills: SkillViewModel[];
    initialBookmarkedIds: string[];
    title?: string; // "추천 에이전트" 등 섹션 제목
  }
  // 상태: selectedSkill (null | SkillViewModel), bookmarkedIds (string[])
  // handleCardClick: setSelectedSkill(skill)
  // handleCloseModal: setSelectedSkill(null)
  // handleToggleBookmark(skillId): 낙관적 업데이트 + toggleBookmarkAction 호출
  ```
- **완료 조건**: TASK-023 테스트 통과

### TASK-027 — `SkillModal` 클라이언트 컴포넌트 구현

- **의존**: TASK-024, TASK-019, TASK-020
- **대상 파일**: `src/features/root-page/SkillModal.tsx` (신규)
- **작업**: `'use client'` 선언, `reference/skill-modal.html` 레이아웃 참조
  - 배경 overlay (클릭 시 onClose, `pointer-events-none` 내부)
  - 모달 컨테이너: 최대 너비 `max-w-5xl`, 최대 높이 `max-h-[92vh]`, rounded-2xl
  - 좌: 스크롤 가능 영역
    - 아이콘, 제목, 카테고리 배지, 제작자
    - `markdownContent`: `react-markdown` 또는 `<pre className="whitespace-pre-wrap text-sm">` 렌더링
    - 피드백 섹션: 별점 버튼(1~5), textarea, 제출 버튼 (`submitFeedbackAction` 호출)
    - 제출 상태: `idle | submitting | success | error`
  - 우: 사이드 패널 (w-80)
    - 북마크 버튼 (`onToggleBookmark` prop 호출)
    - 클립보드 복사 버튼 (`navigator.clipboard.writeText`)
    - 스킬 메타데이터 (카테고리명, 최근 업데이트)
  - ESC 키 처리: `useEffect` + `document.addEventListener('keydown', ...)`
  - X 닫기 버튼
- **완료 조건**: TASK-024 테스트 통과

---

> **CHECKPOINT 5**: TASK-021~027 완료, `npm test -- SkillCard SkillCardGrid SkillModal` 통과 확인

---

## Phase 8. 페이지 통합

### TASK-028 [MOD] — `DashboardPage` 수정

- **의존**: TASK-016, TASK-013, TASK-026, TASK-027
- **대상 파일**: `src/features/root-page/DashboardPage.tsx`
- **작업**:
  - `InMemorySkillRepository` → `SupabaseSkillRepository` 교체
  - `GetBookmarkedSkillsUseCase` 실행하여 `bookmarkedSkillIds` 조회
  - `skills` → `SkillViewModel[]` 변환 (Date → ISO string 포함)
  - `<SkillGrid>` → `<SkillCardGrid skills={viewModels} initialBookmarkedIds={bookmarkedSkillIds} title="추천 에이전트" />` 교체
  - `DashboardPageProps`에 `userId: string` 추가 (북마크 조회용)
- **완료 조건**: 실제 DB 스킬이 대시보드에 표시됨

### TASK-029 [MOD] — `page.tsx` (홈): `DashboardPage`에 `userId` 전달

- **의존**: TASK-028
- **대상 파일**: `src/app/page.tsx`
- **작업**:
  - `<DashboardPage categoryName={categoryName} userId={user.id} />` 로 수정
- **완료 조건**: 타입 에러 없음

### TASK-030 [MOD] — `SkillGrid.tsx` "전체 보기" 링크 제거

- **의존**: TASK-026 (SkillCardGrid가 SkillGrid의 역할을 대체)
- **대상 파일**: `src/features/root-page/SkillGrid.tsx`
- **작업**: `<Link href="/marketplace">전체 보기</Link>` 제거
  - SkillGrid는 이후 미사용이 되지만 이번 단계에서는 파일 유지 (삭제 예정 표시만)
- **완료 조건**: "전체 보기" 링크 코드 없음

### TASK-031 [MOD] — `myagent/page.tsx` 수정

- **의존**: TASK-013, TASK-016
- **대상 파일**: `src/app/myagent/page.tsx`
- **작업**:
  - `GetBookmarkedSkillsUseCase` 실행 → `bookmarkedSkillIds: string[]` 조회
  - `SupabaseSkillRepository.getRecommended()` 전체 조회 후 `bookmarkedSkillIds`로 필터링
  - `SkillViewModel[]` 변환
  - `MyAgentPage`에 `skills`, `bookmarkedIds` props 전달
- **완료 조건**: 타입 에러 없음

### TASK-032 [MOD] — `MyAgentPage` 수정

- **의존**: TASK-026, TASK-031
- **대상 파일**: `src/features/myagent/MyAgentPage.tsx`
- **작업**:
  - Props: `skills: SkillViewModel[]`, `bookmarkedIds: string[]`
  - `skills.length === 0`이면 기존 빈 상태 UI 유지
  - `skills.length > 0`이면 `<SkillCardGrid skills={skills} initialBookmarkedIds={bookmarkedIds} title="내 에이전트" />` 렌더링
- **완료 조건**: TASK-031 데이터가 그리드로 표시됨

---

> **CHECKPOINT 6**: TASK-028~032 완료, 브라우저에서 전체 플로우 동작 확인

---

## Phase 9. 최종 검증

### TASK-033 — 전체 단위 테스트 통과 확인

- **작업**: `npm test` 전체 실행
- **완료 조건**: 모든 테스트 통과, 신규 BC 커버리지 80% 이상

### TASK-034 — 수용 기준 체크리스트 수동 검증

- **작업**: spec.md §7 수용 기준 항목 직접 확인
  - [ ] 대시보드에 DB `skills` 테이블의 `status='active'` 스킬이 표시된다
  - [ ] 각 스킬 카드에 이모지 아이콘, 제목, 설명, 카테고리 태그가 표시된다
  - [ ] 아이콘은 페이지 새로고침 후에도 동일하다 (결정적)
  - [ ] 카테고리 필터 적용 시 해당 카테고리 스킬만 표시된다
  - [ ] "전체 보기" 링크가 없다
  - [ ] 카드 클릭 시 모달이 열린다 (페이지 이동 없음)
  - [ ] 모달에 스킬 제목, 카테고리, 설명(마크다운)이 표시된다
  - [ ] X 버튼, 배경 클릭, ESC 키로 모달이 닫힌다
  - [ ] 모달 북마크 버튼 클릭 시 즉시 UI가 반응한다 (낙관적 업데이트)
  - [ ] 북마크 상태가 페이지 새로고침 후에도 유지된다
  - [ ] `/myagent` 에서 북마크한 스킬이 카드 그리드로 표시된다
  - [ ] 북마크가 없으면 빈 상태 메시지가 표시된다
  - [ ] 별점 + 코멘트 피드백 제출 후 성공 메시지가 표시된다
  - [ ] `skill_feedback_logs` 테이블에 피드백이 저장된다

---

## 태스크 의존성 요약

```
TASK-001 (DB Migration)
    │
    ├─── TASK-002 ─ TASK-003 ─ TASK-004    ← Skill 엔티티 확장
    │              └─ TASK-021             ← SkillViewModel 타입
    │
    ├─── TASK-005 ─ TASK-006 ─ TASK-009 ─ TASK-012 ─ TASK-019  ← Bookmark
    │              └─────────  TASK-010 ─ TASK-013              ← GetBookmarked
    │              └─────────────────────  TASK-017             ← SupabaseBookmarkRepo
    │
    └─── TASK-007 ─ TASK-008 ─ TASK-011 ─ TASK-014 ─ TASK-020  ← FeedbackLog
                   └─────────────────────  TASK-018             ← SupabaseFeedbackRepo

TASK-015 (computeSkillIcon) ─ TASK-016 (SupabaseSkillRepo)

TASK-021 ─ TASK-022 ─ TASK-025 ─ TASK-026 ─ TASK-028 ─ TASK-029
         └─ TASK-023 ────────┘              └─ TASK-031 ─ TASK-032
         └─ TASK-024 ─ TASK-027

TASK-028 + TASK-032 → TASK-033 → TASK-034
```

**병렬 실행 가능 그룹 (최대 활용):**
- `TASK-005` + `TASK-007`: Bookmark/FeedbackLog 엔티티 테스트 동시 작성
- `TASK-009` + `TASK-010` + `TASK-011`: 유스케이스 테스트 동시 작성
- `TASK-012` + `TASK-013` + `TASK-014`: 유스케이스 구현 동시 진행
- `TASK-015` + `TASK-016` + `TASK-017` + `TASK-018`: 인프라 구현 동시 진행
- `TASK-019` + `TASK-020`: Server Actions 동시 작성
- `TASK-022` + `TASK-023` + `TASK-024`: 컴포넌트 테스트 동시 작성
