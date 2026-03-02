# Tasks: 005-admin-skill-management (어드민 스킬관리 페이지)

> **생성일**: 2026-03-02
> **총 태스크**: 26개 (5 Phase)
> **TDD**: 테스트 태스크가 구현 태스크 앞에 배치됨
> **Dependencies**: 004-admin-page (완료)

---

## Phase 0: 사전 준비 (DB 마이그레이션 + 의존성)
> **의존성**: 없음 — 모두 병렬 실행 가능

### T-001: 신규 의존성 설치 [P]
- **파일**: `package.json`
- **설명**: 마크다운 렌더러 및 Toast 라이브러리를 설치한다.
  ```bash
  npm install react-markdown remark-gfm rehype-highlight highlight.js sonner
  npm install -D @types/highlight.js
  ```

### T-002: skills 테이블 category → category_id FK 전환 + status 컬럼 추가 [P]
- **파일**: Supabase MCP (`apply_migration`)
- **설명**: `skills.category` (text CHECK)를 `categories.id` FK로 교체하고 `status` 컬럼을 추가한다.
  ```sql
  ALTER TABLE public.skills
    DROP COLUMN category;

  ALTER TABLE public.skills
    ADD COLUMN category_id uuid NOT NULL REFERENCES public.categories(id),
    ADD COLUMN status text NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'inactive'));
  ```
  > skills 테이블에 데이터가 없으므로 DROP COLUMN 안전

### T-003: skills 테이블 RLS 정책 추가 [P]
- **파일**: Supabase MCP (`apply_migration`)
- **의존성**: T-002
- **설명**: admin 역할만 skills 테이블을 조회·삽입할 수 있는 RLS 정책을 추가한다.
  ```sql
  CREATE POLICY "admin_read_skills" ON public.skills FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name = 'admin'
      )
    );

  CREATE POLICY "admin_insert_skills" ON public.skills FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name = 'admin'
      )
    );
  ```

### T-004: Supabase Storage 버킷 생성 [P]
- **파일**: Supabase MCP (Storage 설정)
- **설명**: 마크다운 파일 저장을 위한 Storage 버킷을 생성한다.
  - 버킷명: `skill-markdowns`
  - public: `false` (비공개)
  - 파일 크기 제한: 1MB
  - 허용 MIME: `text/markdown`, `text/plain`

### 🔖 Checkpoint 0: 사전 준비 완료
```bash
# DB 마이그레이션 확인
# npm install 완료 확인
```

---

## Phase 1: 도메인 계층 (TDD)
> **의존성**: Phase 0 완료

### T-005: SkillStatus 값 객체 테스트 작성
- **파일**: `src/skill-marketplace/domain/__tests__/SkillStatus.test.ts`
- **설명**: `SkillStatus` 값 객체를 TDD로 검증한다.
  - `SkillStatus.active()` 생성 시 `value === 'active'`, `isActive === true`
  - `SkillStatus.inactive()` 생성 시 `value === 'inactive'`, `isActive === false`
  - 동등 비교: active와 inactive는 서로 다름

### T-006: SkillStatus 값 객체 구현
- **파일**: `src/skill-marketplace/domain/value-objects/SkillStatus.ts`
- **의존성**: T-005
- **설명**: `SkillStatus` 값 객체를 구현한다.
  ```typescript
  type SkillStatusValue = 'active' | 'inactive';
  class SkillStatus extends ValueObject<{ value: SkillStatusValue }> {
    static active(): SkillStatus
    static inactive(): SkillStatus
    get value(): SkillStatusValue
    get isActive(): boolean
  }
  ```

### T-009: ManagedSkill 엔티티 테스트 작성
- **파일**: `src/skill-marketplace/domain/__tests__/ManagedSkill.test.ts`
- **의존성**: T-006
- **설명**: `ManagedSkill` Aggregate Root를 TDD로 검증한다.
  - `ManagedSkill.create(props)` 팩토리 메서드로 생성 성공
  - `title`, `categoryId`, `status`, `authorId`, `createdAt`, `markdownFilePath` 게터 정상 동작
  - 기본 status는 `active`

### T-010: ManagedSkill 엔티티 구현
- **파일**: `src/skill-marketplace/domain/entities/ManagedSkill.ts`
- **의존성**: T-009
- **설명**: `ManagedSkill` Aggregate Root를 구현한다. 카테고리는 `categoryId: string` (UUID)로만 참조한다.
  ```typescript
  interface ManagedSkillProps {
    id: string;
    title: string;
    categoryId: string;         // categories.id (UUID)
    markdownFilePath: string | null;
    authorId: string;
    status: SkillStatus;
    createdAt: Date;
  }
  class ManagedSkill extends Entity<string> {
    static create(props: ManagedSkillProps): ManagedSkill
    get title(): string
    get categoryId(): string
    get markdownFilePath(): string | null
    get authorId(): string
    get status(): SkillStatus
    get createdAt(): Date
  }
  ```

### T-011: ManagedSkillRepository 인터페이스 정의
- **파일**: `src/skill-marketplace/domain/repositories/ManagedSkillRepository.ts`
- **의존성**: T-010
- **설명**: `ManagedSkillRepository` 포트 인터페이스를 정의한다.
  ```typescript
  interface CreateManagedSkillInput {
    title: string;
    categoryId: string;         // categories.id (UUID)
    markdownContent: string;
    authorId: string;
  }

  // 리포지토리 조회 시 categories JOIN 결과 포함
  interface ManagedSkillWithCategory {
    id: string;
    title: string;
    categoryId: string;
    categoryName: string;       // categories.name (JOIN)
    markdownFilePath: string | null;
    authorId: string;
    status: SkillStatus;
    createdAt: Date;
  }

  interface ManagedSkillRepository {
    findAll(): Promise<ManagedSkillWithCategory[]>;
    save(input: CreateManagedSkillInput): Promise<ManagedSkill>;
  }
  ```

> **참고**: `SkillCategoryName` VO는 제거됨 — 카테고리 유효성은 DB FK(`category_id → categories.id`)로 보장

### 🔖 Checkpoint 1: 도메인 테스트 통과
```bash
npx jest src/skill-marketplace/domain --passWithNoTests
```

---

## Phase 2: 애플리케이션 계층 (TDD)
> **의존성**: Phase 1 완료 (T-011)

### T-012: GetAllManagedSkillsUseCase 테스트 작성
- **파일**: `src/skill-marketplace/application/__tests__/GetAllManagedSkillsUseCase.test.ts`
- **설명**: `GetAllManagedSkillsUseCase`를 mock repository로 테스트한다.
  - `repository.findAll()` 호출 확인
  - 반환된 목록에 `categoryId`, `categoryName` 포함
  - 빈 목록 반환 시 `{ skills: [] }` 반환

### T-013: GetAllManagedSkillsUseCase 구현
- **파일**: `src/skill-marketplace/application/GetAllManagedSkillsUseCase.ts`
- **의존성**: T-012
- **설명**: 스킬 전체 목록을 조회하는 유스케이스를 구현한다.
  ```typescript
  interface GetAllManagedSkillsResult {
    skills: Array<{
      id: string;
      title: string;
      categoryId: string;
      categoryName: string;   // categories JOIN
      status: SkillStatusValue;
      createdAt: Date;
    }>;
  }
  class GetAllManagedSkillsUseCase {
    constructor(private readonly repository: ManagedSkillRepository) {}
    async execute(): Promise<GetAllManagedSkillsResult>
  }
  ```

### T-014: CreateManagedSkillUseCase 테스트 작성 [P]
- **파일**: `src/skill-marketplace/application/__tests__/CreateManagedSkillUseCase.test.ts`
- **의존성**: T-012 병렬 가능
- **설명**: `CreateManagedSkillUseCase`를 mock repository로 테스트한다.
  - 유효한 `categoryId`(UUID)와 마크다운 내용으로 스킬 생성 성공
  - `repository.save()`가 `categoryId`를 올바르게 전달받아 호출됨을 확인
  - 생성된 스킬 DTO 반환 확인

### T-015: CreateManagedSkillUseCase 구현
- **파일**: `src/skill-marketplace/application/CreateManagedSkillUseCase.ts`
- **의존성**: T-014
- **설명**: 새 스킬을 생성하는 유스케이스를 구현한다.
  ```typescript
  interface CreateManagedSkillCommand {
    title: string;
    categoryId: string;       // categories.id (UUID) — 카테고리 유효성은 DB FK로 보장
    markdownContent: string;
    fileName: string;
    authorId: string;
  }
  interface CreateManagedSkillResult {
    skill: {
      id: string;
      title: string;
      categoryId: string;
      status: SkillStatusValue;
      createdAt: Date;
    };
  }
  class CreateManagedSkillUseCase {
    constructor(private readonly repository: ManagedSkillRepository) {}
    async execute(command: CreateManagedSkillCommand): Promise<CreateManagedSkillResult>
  }
  ```

### 🔖 Checkpoint 2: 애플리케이션 테스트 통과
```bash
npx jest src/skill-marketplace/application --passWithNoTests
```

---

## Phase 3: 인프라스트럭처 계층
> **의존성**: Phase 1 (T-011), Phase 0 (T-004) 완료

### T-016: SupabaseManagedSkillRepository 구현
- **파일**: `src/skill-marketplace/infrastructure/SupabaseManagedSkillRepository.ts`
- **설명**: `ManagedSkillRepository`를 Supabase로 구현한다.
  - 생성자: Supabase Client 주입
  - `findAll()`: `skills` 테이블을 `categories` 테이블과 JOIN하여 조회 (created_at DESC 정렬)
    ```sql
    SELECT
      s.id, s.title, s.category_id, c.name AS category_name,
      s.markdown_file_path, s.author_id, s.status, s.created_at
    FROM skills s
    JOIN categories c ON s.category_id = c.id
    ORDER BY s.created_at DESC
    ```
    → `ManagedSkillWithCategory[]` 반환
  - `save(input)`:
    1. Storage `skill-markdowns` 버킷에 마크다운 파일 업로드
       경로: `{authorId}/{skillId}.md`
    2. `skills` 테이블에 INSERT (title, **category_id**, markdown_file_path, author_id, status='active')
    3. INSERT 성공 후 `ManagedSkill` 반환
    4. Storage 업로드 실패 시 DB INSERT 중단
  - 에러 발생 시 도메인 예외로 변환하여 throw

---

## Phase 4: UI 컴포넌트 (TDD)
> **의존성**: Phase 1, Phase 2 완료 (UI는 도메인 타입 사용)
> Phase 4 내 컴포넌트들은 서로 독립적이므로 병렬 작성 가능 [P]

### T-017: MarkdownRenderer 컴포넌트 테스트 작성 [P]
- **파일**: `src/features/admin/__tests__/MarkdownRenderer.test.tsx`
- **설명**: `MarkdownRenderer` 컴포넌트를 TDD로 검증한다.
  - h1~h3 제목이 렌더링된다
  - 코드 블록이 `<pre>/<code>` 태그로 렌더링된다
  - 순서 없는 목록(`ul/li`)이 렌더링된다
  - 순서 있는 목록(`ol/li`)이 렌더링된다
  - 표(`table/th/td`)가 렌더링된다
  - 인라인 코드가 `<code>` 태그로 렌더링된다
  - **bold**, *italic* 텍스트가 렌더링된다
  - 구분선(`<hr>`)이 렌더링된다

### T-018: MarkdownRenderer 컴포넌트 구현
- **파일**: `src/features/admin/MarkdownRenderer.tsx`
- **의존성**: T-017
- **설명**: `react-markdown` + `remark-gfm` + `rehype-highlight`를 사용한 마크다운 렌더러를 구현한다.
  ```typescript
  interface MarkdownRendererProps {
    content: string;
    className?: string;
  }
  ```
  - Tailwind 스타일 적용:
    - `h1`: `text-3xl font-bold border-b pb-2 mb-4`
    - `h2`: `text-2xl font-semibold mt-6 mb-3`
    - `code block`: `bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto`
    - `table`: `w-full border-collapse`, `th`: `bg-slate-100 font-semibold`, `td`: `border px-4 py-2`
    - `ul`: `list-disc pl-6 space-y-1`, `ol`: `list-decimal pl-6 space-y-1`
    - `hr`: `border-slate-200 my-6`
    - `strong`: `font-semibold`, `em`: `italic`
    - `inline code`: `bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sm`

### T-019: SkillTable 컴포넌트 테스트 작성 [P]
- **파일**: `src/features/admin/__tests__/SkillTable.test.tsx`
- **설명**: `SkillTable` 컴포넌트를 TDD로 검증한다.
  - 스킬 목록이 테이블 행으로 렌더링된다
  - 컬럼 헤더(스킬명, 카테고리, 등록일, 상태)가 표시된다
  - 카테고리명(`categoryName`)이 테이블 셀에 표시된다
  - `active` 상태 스킬에 초록색 배지가 표시된다
  - `inactive` 상태 스킬에 회색 배지가 표시된다
  - 행 클릭 시 `onRowClick`이 해당 스킬 데이터와 함께 호출된다
  - 빈 목록일 때 "등록된 스킬이 없습니다" 메시지가 표시된다

### T-020: SkillTable 컴포넌트 구현
- **파일**: `src/features/admin/SkillTable.tsx`
- **의존성**: T-019
- **설명**: 스킬 목록을 테이블 형태로 표시하는 Client Component를 구현한다.
  ```typescript
  interface ManagedSkillRow {
    id: string;
    title: string;
    categoryId: string;
    categoryName: string;       // JOIN된 카테고리명 표시용
    status: SkillStatusValue;
    createdAt: Date;
  }
  interface SkillTableProps {
    skills: ManagedSkillRow[];
    onRowClick: (skill: ManagedSkillRow) => void;
  }
  ```
  - 컬럼: 스킬명 | 카테고리(`categoryName`) | 등록일 | 상태
  - 상태 badge: active → 초록, inactive → 회색
  - 빈 목록: "등록된 스킬이 없습니다" 안내 문구
  - 행 클릭 시 `onRowClick(skill)` 호출

### T-021: AddSkillModal 컴포넌트 테스트 작성 [P]
- **파일**: `src/features/admin/__tests__/AddSkillModal.test.tsx`
- **설명**: `AddSkillModal` 컴포넌트를 TDD로 검증한다.
  - 모달이 열렸을 때 카테고리 선택 드롭다운이 표시된다
  - 드롭다운에 `categories` prop의 항목이 `category.name`으로 표시된다
  - 파일 업로드 영역이 표시된다
  - 카테고리 미선택 시 등록 버튼이 비활성화된다
  - 파일 미선택 시 등록 버튼이 비활성화된다
  - `.md` 이외 파일 선택 시 오류 메시지가 표시된다
  - 1MB 초과 파일 선택 시 오류 메시지가 표시된다
  - 카테고리 선택 + 파일 선택 후 등록 버튼이 활성화된다
  - 등록 버튼 클릭 시 `onSubmit`이 `category.id`(UUID)를 포함한 FormData와 함께 호출된다
  - ESC 키 누를 시 `onClose`가 호출된다
  - 닫기 버튼 클릭 시 `onClose`가 호출된다

### T-022: AddSkillModal 컴포넌트 구현
- **파일**: `src/features/admin/AddSkillModal.tsx`
- **의존성**: T-021
- **설명**: 스킬 추가 모달을 구현한다 (`'use client'`).
  ```typescript
  interface CategoryOption {
    id: string;     // categories.id (UUID) — FormData에 전송되는 값
    name: string;   // categories.name — 드롭다운에 표시되는 레이블
  }
  interface AddSkillModalProps {
    isOpen: boolean;
    categories: CategoryOption[];   // categories 테이블에서 로드
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
  }
  interface AddSkillFormState {
    categoryId: string;   // 선택된 category.id (UUID)
    file: File | null;
    isDragging: boolean;
    isSubmitting: boolean;
    fileError: string | null;
  }
  ```
  - 카테고리 Select/Dropdown: `option.value = category.id`, `option.label = category.name`
  - 드래그 앤 드롭 + 파일 선택 버튼 파일 업로드 영역
  - `.md` 파일만 허용, 1MB 이하 검증 (클라이언트)
  - 카테고리 미선택 또는 파일 미업로드 시 등록 버튼 비활성화
  - FormData에 `categoryId` (UUID), `file` 포함하여 `onSubmit` 호출
  - ESC 키로 닫기 (포커스 트랩 적용)

### T-023: SkillPreviewModal 컴포넌트 테스트 작성 [P]
- **파일**: `src/features/admin/__tests__/SkillPreviewModal.test.tsx`
- **설명**: `SkillPreviewModal` 컴포넌트를 TDD로 검증한다.
  - 모달이 열렸을 때 스킬명, 카테고리, 등록일이 표시된다
  - 마크다운 미리보기 섹션이 표시된다
  - `MarkdownRenderer`가 마크다운 내용을 렌더링한다
  - ESC 키 누를 시 `onClose`가 호출된다
  - 닫기 버튼 클릭 시 `onClose`가 호출된다
  - 마크다운 로딩 중 스피너 또는 로딩 상태가 표시된다

### T-024: SkillPreviewModal 컴포넌트 구현
- **파일**: `src/features/admin/SkillPreviewModal.tsx`
- **의존성**: T-023, T-018
- **설명**: 스킬 상세 미리보기 모달을 구현한다 (`'use client'`).
  ```typescript
  interface SkillPreviewModalProps {
    isOpen: boolean;
    skill: ManagedSkillRow | null;
    onClose: () => void;
  }
  ```
  - 상단: 스킬명(h2), 카테고리 배지, 등록일
  - 구분선 이후: `MarkdownRenderer`로 마크다운 내용 렌더링
  - 마크다운 내용은 Server Action(`getSkillMarkdown`)으로 비동기 로드
  - ESC 키로 닫기 (포커스 트랩 적용)

### T-025: AdminSkillsPage (feature) 테스트 작성 [P]
- **파일**: `src/features/admin/__tests__/AdminSkillsPage.test.tsx`
- **설명**: `AdminSkillsPage` feature 컴포넌트를 TDD로 검증한다.
  - '스킬 추가하기' 버튼이 테이블 상단에 표시된다
  - `SkillTable`이 스킬 목록과 함께 렌더링된다
  - '스킬 추가하기' 버튼 클릭 시 `AddSkillModal`이 열린다
  - `AddSkillModal`에 `CategoryOption[]` 형태로 카테고리 목록이 전달된다
  - 스킬 행 클릭 시 `SkillPreviewModal`이 열린다
  - 스킬 등록 성공 시 성공 Toast가 표시된다
  - 스킬 등록 실패 시 실패 Toast와 오류 메시지가 표시된다

### T-026: AdminSkillsPage (feature) 구현
- **파일**: `src/features/admin/AdminSkillsPage.tsx`
- **의존성**: T-025, T-020, T-022, T-024
- **설명**: 스킬 관리 페이지 feature 컴포넌트를 구현한다 (`'use client'`).
  ```typescript
  interface AdminSkillsPageProps {
    initialSkills: ManagedSkillRow[];
    categories: CategoryOption[];   // { id: string; name: string }[]
  }
  ```
  - 레이아웃: [스킬 추가하기 버튼(우측)] + [SkillTable]
  - 버튼 클릭 → `AddSkillModal` 열기 (`categories` prop 전달)
  - 행 클릭 → `SkillPreviewModal` 열기
  - 스킬 등록 → `createSkill` Server Action 호출 → `sonner` Toast 표시
  - 등록 성공 후 목록 갱신 (`router.refresh()` 또는 낙관적 업데이트)

### 🔖 Checkpoint 3: UI 컴포넌트 테스트 통과
```bash
npx jest src/features/admin --passWithNoTests
```

---

## Phase 5: Server Action + 페이지 연결
> **의존성**: Phase 2, Phase 3, Phase 4 완료

### T-027: Server Action 구현 (actions.ts)
- **파일**: `src/app/admin/skills/actions.ts`
- **설명**: 스킬 관리 관련 Server Action을 구현한다 (`'use server'`).
  ```typescript
  // 스킬 목록 조회
  export async function getAdminSkills(): Promise<GetAllManagedSkillsResult>

  // 카테고리 목록 조회 (드롭다운용)
  export async function getCategories(): Promise<{ categories: CategoryOption[] }>

  // 스킬 생성
  export async function createSkill(formData: FormData): Promise<CreateManagedSkillResult>
  // formData: { categoryId: string (UUID), file: File (markdown) }
  ```
  - `getAdminSkills`: Supabase 서버 클라이언트 → `SupabaseManagedSkillRepository` → `GetAllManagedSkillsUseCase`
  - `getCategories`: `categories` 테이블 전체 조회 → `{ id, name }[]` 반환 (sort_order ASC)
  - `createSkill`:
    1. Supabase `auth.getUser()`로 현재 사용자 확인
    2. `profiles + roles` 조인으로 admin 역할 재검증 (서버 사이드 인가)
    3. admin이 아닌 경우 `{ error: '권한이 없습니다.' }` 반환
    4. FormData에서 `categoryId` (UUID), `file` 추출
    5. `SupabaseManagedSkillRepository` → `CreateManagedSkillUseCase` 실행
    6. 성공 → `{ skill: ... }` 반환, 실패 → `{ error: '...' }` 반환

### T-028: getSkillMarkdown Server Action 추가
- **파일**: `src/app/admin/skills/actions.ts`
- **의존성**: T-027
- **설명**: 스킬 마크다운 내용을 Supabase Storage에서 다운로드하는 Server Action을 추가한다.
  ```typescript
  export async function getSkillMarkdown(markdownFilePath: string): Promise<{ content: string } | { error: string }>
  ```
  - `supabase.storage.from('skill-markdowns').download(markdownFilePath)`
  - 성공 → Blob을 text로 변환하여 `{ content }` 반환
  - 실패 → `{ error: '...' }` 반환

### T-029: Sonner Toaster를 admin layout에 추가
- **파일**: `src/app/admin/layout.tsx`
- **설명**: `sonner`의 `Toaster` 컴포넌트를 어드민 레이아웃 최상위에 추가한다.
  - `<Toaster position="top-right" richColors />` 추가

### T-030: AdminSkillsPage를 page.tsx에 연결
- **파일**: `src/app/admin/skills/page.tsx`
- **의존성**: T-027, T-029, T-026
- **설명**: stub 페이지를 `AdminSkillsPage`와 연결하는 Server Component로 교체한다.
  - `getAdminSkills()` Server Action으로 초기 스킬 목록 로드
  - `getCategories()` Server Action으로 카테고리 목록(`CategoryOption[]`) 로드
  - `AdminSkillsPage`에 `initialSkills`, `categories` props 전달

### 🔖 Checkpoint 4 (Final): 빌드 + 전체 테스트
```bash
npx jest src/skill-marketplace src/features/admin --passWithNoTests && npx next build
```

---

## 수용 기준 체크리스트 (spec.md 대비)

- [ ] `/admin/skills` 진입 시 등록된 스킬 목록이 테이블 형태로 표시된다
- [ ] 테이블은 스킬명, 카테고리, 등록일, 상태 컬럼을 포함한다
- [ ] 테이블 상단에 '스킬 추가하기' 버튼이 존재한다
- [ ] 버튼 클릭 시 스킬 추가 모달이 열린다
- [ ] 모달 내에 카테고리 선택 UI가 존재하고, 카테고리 목록이 정상 로드된다
- [ ] 모달 내에 마크다운 파일 업로드 UI가 존재한다
- [ ] `.md` 이외 파일 업로드 시 오류 메시지가 표시된다
- [ ] 1MB 초과 파일 업로드 시 오류 메시지가 표시된다
- [ ] 카테고리 미선택 또는 파일 미업로드 상태에서 등록 시 유효성 검증이 동작한다
- [ ] 스킬 등록 성공 시 성공 Toast 알림이 표시된다
- [ ] 스킬 등록 실패 시 실패 Toast 알림과 오류 원인이 표시된다
- [ ] 알림은 3초 후 자동으로 사라지거나 사용자가 닫을 수 있다
- [ ] 테이블의 스킬 행 클릭 시 상세 미리보기 모달이 열린다
- [ ] 미리보기 모달에 스킬명, 카테고리, 등록일이 표시된다
- [ ] 미리보기 모달에 마크다운이 스타일이 적용된 도식화 형태로 렌더링된다
- [ ] 코드 블록, 제목, 목록, 표 등 주요 마크다운 요소가 시각적으로 구분된다
- [ ] 모달은 ESC 키 또는 닫기 버튼으로 닫힌다
- [ ] 스킬 추가 API 호출 시 서버 사이드에서 admin 역할 검증이 수행된다
