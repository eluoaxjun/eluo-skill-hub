# 구현 계획: 005-admin-skill-management (어드민 스킬관리 페이지)

> **작성일**: 2026-03-02
> **Status**: Draft
> **Dependencies**: 004-admin-page (완료)

---

## 1. 구현 개요

`/admin/skills` 페이지에 스킬 관리 인터페이스를 구현한다.
현재 stub 페이지(`src/app/admin/skills/page.tsx`)를 완성하며, DDD 3계층 아키텍처를 준수한다.

### 핵심 결정 사항

| 항목 | 결정 | 근거 |
|------|------|------|
| 도메인 모델 | `ManagedSkill` 신설 (기존 `Skill` 유지) | 기존 마켓플레이스 Skill과 DB 스키마 불일치, 책임 분리 |
| 마크다운 렌더러 | `react-markdown` + `remark-gfm` + `rehype-highlight` | 경량, 요구사항 커버, MIT |
| Toast 알림 | `sonner` | 경량(~3KB), React 19 지원, shadcn 권장 |
| 파일 업로드 | 네이티브 HTML drag-and-drop | .md 파일만 허용, 추가 라이브러리 불필요 |
| 마크다운 저장 | Supabase Storage (`skill-markdowns` 버킷) | spec 가정 사항 준수 |
| 카테고리 소스 | `categories` DB 테이블 (`SupabaseCategoryRepository` 재사용) | 이미 구현됨 |
| DB 변경 | `skills` 테이블에 `status` 컬럼 추가 | spec 요구사항(활성/비활성 표시) |

---

## 2. 신규 의존성 설치

```bash
npm install react-markdown remark-gfm rehype-highlight highlight.js sonner
npm install -D @types/highlight.js
```

---

## 3. DB 마이그레이션

```sql
-- Phase 0: skills 테이블 status 컬럼 추가
ALTER TABLE public.skills
  ADD COLUMN status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive'));

-- RLS 정책 추가
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

---

## 4. 구현 단계

### Phase 1: 도메인 계층 (TDD)

| # | 작업 | 대상 파일 |
|---|------|----------|
| 1-1 | SkillStatus 값 객체 테스트 | `src/skill-marketplace/domain/__tests__/SkillStatus.test.ts` |
| 1-2 | SkillStatus 값 객체 구현 | `src/skill-marketplace/domain/value-objects/SkillStatus.ts` |
| 1-3 | SkillCategoryName 값 객체 테스트 | `src/skill-marketplace/domain/__tests__/SkillCategoryName.test.ts` |
| 1-4 | SkillCategoryName 값 객체 구현 | `src/skill-marketplace/domain/value-objects/SkillCategoryName.ts` |
| 1-5 | ManagedSkill 엔티티 테스트 | `src/skill-marketplace/domain/__tests__/ManagedSkill.test.ts` |
| 1-6 | ManagedSkill 엔티티 구현 | `src/skill-marketplace/domain/entities/ManagedSkill.ts` |
| 1-7 | ManagedSkillRepository 인터페이스 | `src/skill-marketplace/domain/repositories/ManagedSkillRepository.ts` |

### Phase 2: 애플리케이션 계층 (TDD)

| # | 작업 | 대상 파일 |
|---|------|----------|
| 2-1 | GetAllManagedSkillsUseCase 테스트 | `src/skill-marketplace/application/__tests__/GetAllManagedSkillsUseCase.test.ts` |
| 2-2 | GetAllManagedSkillsUseCase 구현 | `src/skill-marketplace/application/GetAllManagedSkillsUseCase.ts` |
| 2-3 | CreateManagedSkillUseCase 테스트 | `src/skill-marketplace/application/__tests__/CreateManagedSkillUseCase.test.ts` |
| 2-4 | CreateManagedSkillUseCase 구현 | `src/skill-marketplace/application/CreateManagedSkillUseCase.ts` |

### Phase 3: 인프라스트럭처 계층

| # | 작업 | 대상 파일 |
|---|------|----------|
| 3-1 | Supabase Storage 버킷 생성 (`skill-markdowns`) | Supabase MCP |
| 3-2 | SupabaseManagedSkillRepository 구현 | `src/skill-marketplace/infrastructure/SupabaseManagedSkillRepository.ts` |

### Phase 4: UI 컴포넌트 (TDD)

| # | 작업 | 대상 파일 |
|---|------|----------|
| 4-1 | MarkdownRenderer 컴포넌트 테스트 | `src/features/admin/__tests__/MarkdownRenderer.test.tsx` |
| 4-2 | MarkdownRenderer 컴포넌트 구현 | `src/features/admin/MarkdownRenderer.tsx` |
| 4-3 | SkillTable 컴포넌트 테스트 | `src/features/admin/__tests__/SkillTable.test.tsx` |
| 4-4 | SkillTable 컴포넌트 구현 | `src/features/admin/SkillTable.tsx` |
| 4-5 | AddSkillModal 컴포넌트 테스트 | `src/features/admin/__tests__/AddSkillModal.test.tsx` |
| 4-6 | AddSkillModal 컴포넌트 구현 | `src/features/admin/AddSkillModal.tsx` |
| 4-7 | SkillPreviewModal 컴포넌트 테스트 | `src/features/admin/__tests__/SkillPreviewModal.test.tsx` |
| 4-8 | SkillPreviewModal 컴포넌트 구현 | `src/features/admin/SkillPreviewModal.tsx` |
| 4-9 | AdminSkillsPage (feature) 테스트 | `src/features/admin/__tests__/AdminSkillsPage.test.tsx` |
| 4-10 | AdminSkillsPage (feature) 구현 | `src/features/admin/AdminSkillsPage.tsx` |

### Phase 5: 페이지 연결

| # | 작업 | 대상 파일 |
|---|------|----------|
| 5-1 | Sonner Toaster를 admin layout에 추가 | `src/app/admin/layout.tsx` |
| 5-2 | AdminSkillsPage를 page.tsx에 연결 | `src/app/admin/skills/page.tsx` |

---

## 5. 파일 구조 (최종)

```
src/
├── skill-marketplace/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Skill.ts                              (기존 유지)
│   │   │   └── ManagedSkill.ts                       ← 신규
│   │   ├── value-objects/
│   │   │   ├── SkillCategory.ts                      (기존 유지)
│   │   │   ├── SkillCategoryName.ts                  ← 신규
│   │   │   └── SkillStatus.ts                        ← 신규
│   │   ├── repositories/
│   │   │   ├── SkillRepository.ts                    (기존 유지)
│   │   │   └── ManagedSkillRepository.ts             ← 신규
│   │   └── __tests__/
│   │       ├── Skill.test.ts                         (기존 유지)
│   │       ├── ManagedSkill.test.ts                  ← 신규
│   │       ├── SkillStatus.test.ts                   ← 신규
│   │       └── SkillCategoryName.test.ts             ← 신규
│   ├── application/
│   │   ├── GetRecommendedSkillsUseCase.ts            (기존 유지)
│   │   ├── GetAllManagedSkillsUseCase.ts             ← 신규
│   │   ├── CreateManagedSkillUseCase.ts              ← 신규
│   │   └── __tests__/
│   │       ├── GetRecommendedSkillsUseCase.test.ts   (기존 유지)
│   │       ├── GetAllManagedSkillsUseCase.test.ts    ← 신규
│   │       └── CreateManagedSkillUseCase.test.ts     ← 신규
│   └── infrastructure/
│       ├── InMemorySkillRepository.ts                (기존 유지)
│       └── SupabaseManagedSkillRepository.ts         ← 신규
│
├── features/
│   └── admin/
│       ├── AdminSidebar.tsx                          (기존 유지)
│       ├── UnauthorizedPage.tsx                      (기존 유지)
│       ├── MarkdownRenderer.tsx                      ← 신규
│       ├── SkillTable.tsx                            ← 신규
│       ├── AddSkillModal.tsx                         ← 신규
│       ├── SkillPreviewModal.tsx                     ← 신규
│       ├── AdminSkillsPage.tsx                       ← 신규
│       └── __tests__/
│           ├── MarkdownRenderer.test.tsx             ← 신규
│           ├── SkillTable.test.tsx                   ← 신규
│           ├── AddSkillModal.test.tsx                ← 신규
│           ├── SkillPreviewModal.test.tsx            ← 신규
│           └── AdminSkillsPage.test.tsx              ← 신규
│
└── app/
    └── admin/
        ├── layout.tsx                                (Toaster 추가)
        └── skills/
            └── page.tsx                              (stub → AdminSkillsPage 연결)
```

---

## 6. 핵심 컴포넌트 설계

### MarkdownRenderer

```tsx
// props
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 렌더링 요소별 스타일 (Tailwind)
// h1: text-3xl font-bold border-b pb-2 mb-4
// h2: text-2xl font-semibold mt-6 mb-3
// code block: bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto
// table: w-full border-collapse, th: bg-slate-100 font-semibold, td: border px-4 py-2
// ul/ol: list-disc/decimal pl-6 space-y-1
// hr: border-slate-200 my-6
// strong: font-semibold, em: italic
// inline code: bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sm
```

### AddSkillModal

```tsx
// 상태 관리
interface AddSkillFormState {
  categoryId: string;       // 선택된 category.id
  file: File | null;        // 업로드된 .md 파일
  isDragging: boolean;      // 드래그 중 상태
  isSubmitting: boolean;    // 제출 중
}

// 유효성 검증
// - categoryId가 비어있으면 등록 버튼 비활성화
// - file이 null이면 등록 버튼 비활성화
// - file.name이 .md로 끝나지 않으면 오류 메시지

// 서버 액션 호출
// - Server Action (app/admin/skills/actions.ts) 으로 FormData 전송
```

### AdminSkillsPage (feature)

```tsx
// 데이터 페칭: Server Component (RSC)에서 데이터 로드 후 props로 전달
// 또는 Client Component에서 Server Action으로 로드

// 레이아웃:
// [스킬 추가하기 버튼]    ← 오른쪽 정렬
// [SkillTable]
// [AddSkillModal] (조건부)
// [SkillPreviewModal] (조건부)
```

### SkillTable

```tsx
interface SkillTableProps {
  skills: ManagedSkillRow[];  // 서버에서 받은 데이터
  onRowClick: (skill: ManagedSkillRow) => void;
}

// 컬럼: 스킬명 | 카테고리 | 등록일 | 상태
// 상태: badge UI (active: green, inactive: gray)
// 빈 목록: "등록된 스킬이 없습니다" 안내
```

---

## 7. Server Action 설계

```typescript
// src/app/admin/skills/actions.ts

'use server'

// 스킬 목록 조회
export async function getAdminSkills(): Promise<GetAllManagedSkillsResult>

// 스킬 생성
export async function createSkill(formData: FormData): Promise<CreateManagedSkillResult>
// formData: { category: string, file: File (markdown) }
// 내부: 1) admin 역할 재검증, 2) 파일 Storage 업로드, 3) skills 테이블 INSERT
```

---

## 8. Constitution 준수 검증

| 원칙 | 준수 여부 | 설명 |
|------|-----------|------|
| §2 기술 스택 (Next.js/TS/Supabase/Jest) | ✅ | 신규 의존성은 보완적 |
| §3 DDD 3계층 아키텍처 | ✅ | domain→application→infrastructure 준수 |
| §3 domain 외부 의존성 금지 | ✅ | `ManagedSkill` 엔티티는 순수 TS, 외부 import 없음 |
| §3 Aggregate Root를 통한 데이터 변경 | ✅ | `CreateManagedSkillUseCase`가 `ManagedSkill` AR 통해 저장 |
| §3 바운디드 컨텍스트 분리 | ✅ | `skill-marketplace` 컨텍스트 내에서 신규 어그리게이트 추가 |
| §4 네이밍 컨벤션 | ✅ | PascalCase 엔티티/VO/UseCase, kebab-case 디렉토리 |
| §5 any 타입 금지 | ✅ | 모든 타입 명시 |
| §6 TDD | ✅ | 각 Phase에서 테스트 먼저 작성 |
| §7 보안 (인증/인가) | ✅ | Server Action에서 admin 역할 재검증 + RLS 이중 보호 |
| §8 성능 (3초 이내) | ✅ | RSC에서 데이터 로드, Next.js 최적화 활용 |

---

## 9. 주의사항 및 제약

1. **기존 `Skill` 엔티티 변경 금지** — 마켓플레이스 표시 로직에 영향
2. **마크다운 Storage 업로드 순서** — Storage 업로드 성공 후 DB INSERT (트랜잭션 보장 불가 → Storage 업로드 실패 시 DB 저장 중단)
3. **`skills.category` CHECK 제약** — 카테고리 드롭다운은 `categories.name` 기준이며, CHECK 제약값과 일치해야 함
4. **Sonner `Toaster` 위치** — `app/admin/layout.tsx`에 최상위 추가
5. **마크다운 파일 크기** — 클라이언트에서 1MB 이하 검증 필수 (spec 비기능 요구사항)
