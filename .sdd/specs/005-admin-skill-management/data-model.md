# Data Model: 005-admin-skill-management

> 작성일: 2026-03-02

---

## 1. DB 스키마 변경 (마이그레이션)

### skills 테이블 — `category` → `category_id` FK 전환 + `status` 컬럼 추가

```sql
-- 기존 category text CHECK 컬럼을 categories.id FK로 교체
ALTER TABLE public.skills
  DROP COLUMN category;

ALTER TABLE public.skills
  ADD COLUMN category_id uuid NOT NULL REFERENCES public.categories(id),
  ADD COLUMN status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive'));
```

최종 `skills` 테이블:
```
skills:
  id                 uuid         PK, gen_random_uuid()
  title              text         NOT NULL
  category_id        uuid         NOT NULL, FK → categories.id  ← 변경 (기존 category text 제거)
  markdown_file_path text         NULL  ← Supabase Storage 경로
  author_id          uuid         FK → auth.users.id
  status             text         NOT NULL DEFAULT 'active' CHECK('active'|'inactive')  ← 신규
  created_at         timestamptz  DEFAULT now()
```

> **참고**: `categories` 테이블은 이미 존재하며 5개 카테고리 데이터가 있음
> (`id`, `name`, `slug`, `icon`, `sort_order`, `created_at`, `updated_at`)

### Supabase Storage 버킷 생성

```sql
-- Storage 버킷 (Supabase 대시보드 또는 MCP로 생성)
버킷명: skill-markdowns
public: false  (비공개)
파일 크기 제한: 1MB
허용 mime: text/markdown, text/plain
```

---

## 2. RLS 정책

```sql
-- skills 테이블 SELECT: admin만 전체 조회
CREATE POLICY "admin_read_skills"
  ON public.skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- skills 테이블 INSERT: admin만 삽입
CREATE POLICY "admin_insert_skills"
  ON public.skills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );
```

---

## 3. 도메인 모델 (DDD)

### 신규 Aggregate Root: `ManagedSkill`

`skill-marketplace` 바운디드 컨텍스트 내에 어드민 관리용 어그리게이트를 별도로 신설.
(기존 `Skill` 엔티티는 마켓플레이스 표시 전용으로 유지)

카테고리는 `categories` 테이블의 `id` (UUID)로만 참조한다. 카테고리명 표시는 리포지토리 레이어에서 JOIN하여 DTO로 반환한다.

```typescript
// src/skill-marketplace/domain/entities/ManagedSkill.ts

interface ManagedSkillProps {
  id: string;
  title: string;
  categoryId: string;           // categories.id (UUID)
  markdownFilePath: string | null;
  authorId: string;
  status: SkillStatus;          // 'active' | 'inactive'
  createdAt: Date;
}

class ManagedSkill extends Entity<string> {
  // 팩토리 메서드로 생성 (유효성 검증)
  static create(props: ManagedSkillProps): ManagedSkill

  // 게터
  get title(): string
  get categoryId(): string
  get markdownFilePath(): string | null
  get authorId(): string
  get status(): SkillStatus
  get createdAt(): Date
}
```

> **변경**: `category: SkillCategoryName` → `categoryId: string` (UUID)
> `SkillCategoryName` VO는 제거 — 카테고리 유효성은 DB FK 제약으로 보장

### 값 객체: `SkillStatus`

```typescript
// src/skill-marketplace/domain/value-objects/SkillStatus.ts

type SkillStatusValue = 'active' | 'inactive';

class SkillStatus extends ValueObject<{ value: SkillStatusValue }> {
  static active(): SkillStatus
  static inactive(): SkillStatus
  get value(): SkillStatusValue
  get isActive(): boolean
}
```

---

## 4. 리포지토리 인터페이스

```typescript
// src/skill-marketplace/domain/repositories/ManagedSkillRepository.ts

interface CreateManagedSkillInput {
  title: string;
  categoryId: string;       // categories.id (UUID)
  markdownContent: string;  // 파일 내용 (Storage 저장은 인프라 책임)
  authorId: string;
}

interface ManagedSkillRepository {
  findAll(): Promise<ManagedSkillWithCategory[]>;  // categories JOIN 포함
  save(input: CreateManagedSkillInput): Promise<ManagedSkill>;
}

// 리포지토리 조회 결과 타입 (JOIN된 카테고리명 포함)
interface ManagedSkillWithCategory {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;     // categories.name (JOIN)
  markdownFilePath: string | null;
  authorId: string;
  status: SkillStatus;
  createdAt: Date;
}
```

---

## 5. 유스케이스 DTO

### GetAllManagedSkillsUseCase

```typescript
// 입력: 없음
// 출력:
interface GetAllManagedSkillsResult {
  skills: Array<{
    id: string;
    title: string;
    categoryId: string;
    categoryName: string;   // categories JOIN으로 가져온 카테고리명
    status: SkillStatusValue;
    createdAt: Date;
  }>;
}
```

### CreateManagedSkillUseCase

```typescript
// 입력:
interface CreateManagedSkillCommand {
  title: string;
  categoryId: string;       // categories.id (UUID) — 드롭다운에서 선택한 값
  markdownContent: string;
  fileName: string;
  authorId: string;
}

// 출력:
interface CreateManagedSkillResult {
  skill: {
    id: string;
    title: string;
    categoryId: string;
    status: SkillStatusValue;
    createdAt: Date;
  };
}
```

---

## 6. Supabase Storage 파일 경로

```
버킷: skill-markdowns
경로: {authorId}/{skillId}.md

예시: "550e8400-e29b-41d4-a716-446655440000/f47ac10b-58cc-4372-a567-0e02b2c3d479.md"
```

`skills.markdown_file_path`에는 위 Storage 경로만 저장.
마크다운 내용을 읽을 때는 `supabase.storage.from('skill-markdowns').download(path)` 사용.
