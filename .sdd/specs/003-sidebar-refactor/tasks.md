# Tasks: 003-sidebar-refactor (사이드바 리팩토링 및 카테고리 DB 관리)

> **생성일**: 2026-03-02
> **Spec**: `.sdd/specs/003-sidebar-refactor/spec.md`
> **Plan**: `.sdd/specs/003-sidebar-refactor/plan.md`
> **Data Model**: `.sdd/specs/003-sidebar-refactor/data-model.md`
> **총 태스크**: 23개 (4 Phase)
> **TDD**: 테스트 태스크가 구현 태스크 앞에 배치됨

---

## 범례

- `[P]` : 같은 그룹 내 병렬 실행 가능
- `[TEST]` : 테스트 코드 작성 (TDD Red 단계)
- `[IMPL]` : 구현 코드 작성 (TDD Green 단계)
- `[CONFIG]` : 설정/인프라 작업
- `→` : 선행 의존성

---

## Phase 1: DB 스키마 + Domain 계층 (기반)

> **US 매핑**: US-002, US-004
> **의존성**: 001-root-page, 002-auth 완료 전제

### T-001 [CONFIG] Supabase 마이그레이션 — categories 테이블 생성
- **파일**: Supabase MCP (`apply_migration`)
- **FR**: FR-11, FR-12, FR-14, NFR-04
- **작업**:
  - `categories` 테이블 생성 (id, name, slug, icon, sort_order, created_at, updated_at)
  - 인덱스 생성 (`categories_slug_idx`, `categories_sort_order_idx`)
  - RLS 활성화 + 정책 4개 (SELECT: authenticated, INSERT/UPDATE/DELETE: admin)
  - 시드 데이터 5건 삽입 (기획, 디자인, 퍼블리싱, 개발, QA)
- **수용 기준**:
  - `categories` 테이블이 존재하고 5건의 데이터가 조회됨
  - RLS 정책이 활성화됨
- [ ] 완료

### T-002 [TEST] Category 엔티티 단위 테스트 작성 [P]
- **파일**: `src/category/domain/__tests__/Category.test.ts` (신규)
- **FR**: FR-06
- **작업**:
  - Category 엔티티 생성 테스트 (id, name, slug, icon, sortOrder)
  - 속성 접근자 테스트
  - 필수 속성 누락 시 에러 검증
- **수용 기준**: 테스트가 실패함 (Red)
- [ ] 완료

### T-003 [IMPL] Category 엔티티 구현 → T-002
- **파일**: `src/category/domain/entities/Category.ts` (신규)
- **FR**: FR-06
- **작업**:
  - Entity 클래스 상속, 불변 속성: id, name, slug, icon, sortOrder, createdAt, updatedAt
  - 팩토리 메서드 `static create(props)`
- **수용 기준**: T-002 테스트가 통과함 (Green)
- [ ] 완료

### T-004 [IMPL] CategoryRepository 포트 인터페이스 정의 [P] → T-003
- **파일**: `src/category/domain/repositories/CategoryRepository.ts` (신규)
- **FR**: FR-06
- **작업**:
  - `findAll(): Promise<Category[]>` — sort_order ASC 정렬
  - `findBySlug(slug: string): Promise<Category | null>`
- **수용 기준**: 인터페이스가 Category 엔티티 타입에 의존하며 컴파일됨
- [ ] 완료

### T-005 [IMPL] 아이콘 추가 + 아이콘 레지스트리 유틸 [P]
- **파일**: `src/shared/ui/icons/index.ts` (수정)
- **FR**: FR-05
- **작업**:
  - BrushIcon, CodeIcon, BugReportIcon SVG 컴포넌트 추가
  - 카테고리 아이콘명 → 컴포넌트 매핑 레지스트리 함수 `getCategoryIcon(iconName: string)` 생성
  - 기존 EditNoteIcon, TerminalIcon은 이미 존재하므로 확인만
- **수용 기준**: `getCategoryIcon('BrushIcon')`이 올바른 컴포넌트 반환
- [ ] 완료

---

### ✅ CHECKPOINT 1: DB + Domain 계층 완료
- [ ] `categories` 테이블이 생성되고 시드 데이터 5건 확인
- [ ] RLS 정책 4개 활성화 (SELECT/INSERT/UPDATE/DELETE)
- [ ] Category 엔티티 테스트 통과
- [ ] CategoryRepository 인터페이스 정의됨
- [ ] 새 아이콘 3개 + 레지스트리 함수 동작
- [ ] domain 계층에 외부 의존성 없음

---

## Phase 2: Application + Infrastructure 계층

> **US 매핑**: US-002, US-004
> **의존성**: Phase 1

### T-006 [TEST] GetCategoriesUseCase 단위 테스트 작성 → CHECKPOINT 1
- **파일**: `src/category/application/__tests__/GetCategoriesUseCase.test.ts` (신규)
- **FR**: FR-06
- **작업**:
  - mock CategoryRepository 주입
  - `execute()` 호출 시 정렬된 카테고리 목록 반환 검증
  - 빈 목록 반환 케이스 검증
- **수용 기준**: 테스트가 실패함 (Red)
- [ ] 완료

### T-007 [IMPL] GetCategoriesUseCase 구현 → T-006
- **파일**: `src/category/application/GetCategoriesUseCase.ts` (신규)
- **FR**: FR-06
- **작업**:
  - CategoryRepository를 생성자 주입
  - `execute()` 메서드에서 `findAll()` 호출, 정렬된 목록 반환
- **수용 기준**: T-006 테스트가 통과함 (Green)
- [ ] 완료

### T-008 [IMPL] SupabaseCategoryRepository 구현 [P] → T-004
- **파일**: `src/category/infrastructure/SupabaseCategoryRepository.ts` (신규)
- **FR**: FR-06, NFR-01
- **작업**:
  - CategoryRepository 인터페이스 구현
  - `findAll()`: `select('*').order('sort_order', { ascending: true })`
  - `findBySlug()`: `select('*').eq('slug', slug).single()`
  - DB 행 → Category 엔티티 매핑
- **수용 기준**: Supabase에서 카테고리 데이터를 조회하여 Category 엔티티 배열로 반환
- [ ] 완료

### T-009 [TEST] SkillRepository 필터링 확장 테스트 작성 [P] → CHECKPOINT 1
- **파일**: `src/skill-marketplace/application/__tests__/GetRecommendedSkillsUseCase.test.ts` (수정)
- **FR**: FR-07
- **작업**:
  - `execute(categoryName)` 호출 시 해당 카테고리 스킬만 반환 검증
  - `execute()` (카테고리 없음) 호출 시 전체 스킬 반환 검증 (기존 동작 유지)
- **수용 기준**: 필터 관련 테스트가 실패함 (Red), 기존 테스트는 통과
- [ ] 완료

### T-010 [IMPL] SkillRepository 필터링 구현 → T-009
- **파일**:
  - `src/skill-marketplace/domain/repositories/SkillRepository.ts` (수정)
  - `src/skill-marketplace/application/GetRecommendedSkillsUseCase.ts` (수정)
  - `src/skill-marketplace/infrastructure/InMemorySkillRepository.ts` (수정)
- **FR**: FR-07
- **작업**:
  - `SkillRepository.getRecommended(categoryName?: string)` 시그니처 변경
  - `GetRecommendedSkillsUseCase.execute(categoryName?: string)` 시그니처 변경
  - `InMemorySkillRepository` 목업 데이터를 새 카테고리명(기획/디자인/퍼블리싱/개발/QA)으로 업데이트
  - categoryName이 주어지면 해당 카테고리 스킬만 반환하는 필터 로직 추가
- **수용 기준**: T-009 테스트가 통과함 (Green), 기존 테스트도 통과
- [ ] 완료

---

### ✅ CHECKPOINT 2: Application + Infrastructure 완료
- [ ] GetCategoriesUseCase 테스트 통과
- [ ] SupabaseCategoryRepository가 DB에서 카테고리 조회 가능
- [ ] SkillRepository 필터링 테스트 통과
- [ ] 기존 스킬 관련 테스트 깨지지 않음
- [ ] application 계층이 domain 인터페이스에만 의존

---

## Phase 3: UI 수정 (사이드바 + 대시보드)

> **US 매핑**: US-001, US-002
> **의존성**: Phase 2

### T-011 [TEST] Sidebar 테스트 업데이트 → CHECKPOINT 2
- **파일**: `src/shared/ui/__tests__/Sidebar.test.tsx` (수정)
- **FR**: FR-01, FR-02, FR-04, FR-05, FR-08, FR-09
- **작업**:
  - "마켓플레이스" 메뉴가 제거되었는지 확인
  - "메인" 그룹에 "대시보드"와 "내 에이전트"만 표시 확인
  - "내 에이전트" 링크가 `/myagent`을 가리키는지 확인
  - categories prop으로 전달된 5개 카테고리가 "카테고리" 그룹에 표시 확인
  - 카테고리 항목이 `/?category={slug}` 링크인지 확인
  - 현재 활성 카테고리 스타일 확인 (useSearchParams mock)
  - 현재 경로 기반 메인 메뉴 활성 상태 확인
- **수용 기준**: 새 기준에 맞는 테스트가 실패함 (Red)
- [ ] 완료

### T-012 [IMPL] Sidebar 컴포넌트 리팩토링 → T-011, T-005
- **파일**: `src/shared/ui/Sidebar.tsx` (수정)
- **FR**: FR-01, FR-02, FR-04, FR-05, FR-08, FR-09, FR-10
- **작업**:
  - MAIN_MENU에서 "마켓플레이스" 항목 제거
  - "내 에이전트" href를 `/myagent`으로 변경
  - `categories` prop 추가 (타입: `Array<{ id: string; name: string; slug: string; icon: string; sortOrder: number }>`)
  - 카테고리 항목을 `/?category={slug}` 링크로 렌더링
  - `useSearchParams()`로 현재 활성 카테고리 판별 + 활성 스타일 적용
  - `getCategoryIcon()`으로 아이콘 동적 매핑
  - 카테고리 데이터 없을 때 스켈레톤/로딩 상태 표시 (FR-10)
- **수용 기준**: T-011 테스트가 통과함 (Green)
- [ ] 완료

### T-013 [IMPL] DashboardLayout 수정 → T-012
- **파일**: `src/shared/ui/DashboardLayout.tsx` (수정)
- **FR**: FR-03
- **작업**:
  - `categories` prop 추가
  - Sidebar에 categories 전달
- **수용 기준**: DashboardLayout이 categories를 Sidebar에 올바르게 전달
- [ ] 완료

### T-014 [IMPL] app/page.tsx 수정 → T-013, T-007, T-008
- **파일**: `src/app/page.tsx` (수정)
- **FR**: FR-06, FR-07, FR-08, NFR-02
- **작업**:
  - GetCategoriesUseCase + SupabaseCategoryRepository로 카테고리 목록 조회
  - `searchParams`에서 `category` 읽기 (Promise 패턴, Next.js 15+)
  - `categories.find(c => c.slug === category)` → categoryName 추출
  - DashboardLayout에 categories 전달
  - DashboardPage에 categoryName 전달
- **수용 기준**: 대시보드에서 카테고리 목록이 사이드바에 표시됨, URL 쿼리 파라미터로 필터 동작
- [ ] 완료

### T-015 [IMPL] DashboardPage 수정 → T-014, T-010
- **파일**: `src/features/root-page/DashboardPage.tsx` (수정)
- **FR**: FR-07
- **작업**:
  - `categoryName` prop 수신 (optional)
  - `GetRecommendedSkillsUseCase.execute(categoryName)` 호출
  - 필터 적용된 스킬 목록 렌더링
- **수용 기준**: 카테고리 선택 시 해당 카테고리 스킬만 표시, 미선택 시 전체 표시
- [ ] 완료

---

### ✅ CHECKPOINT 3: UI 수정 완료
- [ ] "마켓플레이스" 메뉴가 제거됨
- [ ] "메인" 그룹에 "대시보드"와 "내 에이전트"만 표시
- [ ] "카테고리" 그룹에 DB에서 조회한 5개 카테고리 표시
- [ ] 카테고리 클릭 시 `/?category={slug}`로 URL 변경 + 스킬 필터링
- [ ] 활성 카테고리가 사이드바에서 시각적으로 구분됨
- [ ] Sidebar 테스트 통과
- [ ] 기존 테스트 깨지지 않음
- [ ] `npm run build` 에러 없음

---

## Phase 4: /myagent 페이지 + 통합

> **US 매핑**: US-003
> **의존성**: Phase 3

### T-016 [TEST] MyAgentPage 컴포넌트 테스트 작성 → CHECKPOINT 3
- **파일**: `src/features/myagent/__tests__/MyAgentPage.test.tsx` (신규)
- **FR**: FR-15, FR-16, FR-17
- **작업**:
  - "아직 북마크한 에이전트가 없습니다" 빈 상태 메시지 표시 확인
  - 빈 상태 아이콘 존재 확인
- **수용 기준**: 테스트가 실패함 (Red)
- [ ] 완료

### T-017 [IMPL] MyAgentPage 컴포넌트 구현 → T-016
- **파일**: `src/features/myagent/MyAgentPage.tsx` (신규)
- **FR**: FR-15, FR-16, FR-17
- **작업**:
  - 빈 상태 메시지: "아직 북마크한 에이전트가 없습니다"
  - 빈 상태 아이콘 + 설명 텍스트
  - 다크 모드 지원
- **수용 기준**: T-016 테스트가 통과함 (Green)
- [ ] 완료

### T-018 [IMPL] app/myagent/page.tsx 라우트 생성 → T-017, T-013
- **파일**: `src/app/myagent/page.tsx` (신규)
- **FR**: FR-02, FR-03, FR-15
- **작업**:
  - Server Component
  - 인증 확인 (미인증 시 middleware가 /login으로 리다이렉트 — 이미 whitelist 기반이므로 자동 보호)
  - GetCategoriesUseCase로 카테고리 조회
  - DashboardLayout(categories) + MyAgentPage 렌더링
- **수용 기준**: `/myagent` 접근 시 사이드바+헤더+빈 상태 페이지가 표시됨
- [ ] 완료

### T-019 [TEST] Sidebar 활성 메뉴 통합 테스트 → T-018
- **파일**: `src/shared/ui/__tests__/Sidebar.test.tsx` (추가)
- **FR**: FR-04
- **작업**:
  - pathname이 `/myagent`일 때 "내 에이전트" 메뉴 활성 상태 확인
  - pathname이 `/`이고 searchParams에 category가 없을 때 "대시보드" 활성 확인
  - pathname이 `/`이고 `?category=design`일 때 "디자인" 카테고리 활성 확인
- **수용 기준**: 모든 활성 상태 케이스 테스트 통과
- [ ] 완료

### T-020 [TEST] 전체 단위/통합 테스트 실행 [P]
- **파일**: —
- **작업**:
  ```bash
  npx jest --passWithNoTests
  ```
  - 전체 테스트 스위트 실행
  - Category 도메인 테스트 통과
  - GetCategoriesUseCase 테스트 통과
  - 스킬 필터링 테스트 통과
  - Sidebar 테스트 통과
  - MyAgentPage 테스트 통과
  - 기존 테스트(001, 002) 깨지지 않음
- **수용 기준**: 전체 테스트 통과 (0 failures)
- [ ] 완료

### T-021 [CONFIG] 빌드 검증 [P] → T-018
- **파일**: —
- **작업**:
  ```bash
  npx next build
  ```
  - TypeScript 에러 없음
  - 빌드 성공
- **수용 기준**: 빌드 성공
- [ ] 완료

### T-022 [TEST] 다크 모드 검증
- **파일**: —
- **FR**: NFR-03
- **작업**:
  - 사이드바 카테고리 항목의 다크 모드 스타일 확인
  - MyAgentPage 빈 상태의 다크 모드 스타일 확인
  - 활성 카테고리 하이라이트가 다크 모드에서 정상 표시
- **수용 기준**: 다크 모드에서 모든 UI 요소 정상 동작
- [ ] 완료

### T-023 수용 기준 체크
- **파일**: `.sdd/specs/003-sidebar-refactor/tasks.md` (본 파일)
- **의존성**: T-020, T-021, T-022
- **작업**: spec.md 수용 기준 체크리스트 대비 최종 점검
  - 사이드바 메뉴 체크리스트 (4항목)
  - 카테고리 체크리스트 (5항목)
  - 카테고리 DB 체크리스트 (3항목)
  - 내 에이전트 페이지 체크리스트 (3항목)
  - 공통 체크리스트 (2항목)
- **수용 기준**: spec.md §7 전체 항목 ✅
- [ ] 완료

---

### ✅ CHECKPOINT 4 (Final): 전체 완료
- [ ] `/myagent` 경로에 페이지 존재
- [ ] `/myagent` 사이드바+헤더 레이아웃이 루트 페이지와 동일
- [ ] 빈 상태 메시지 표시
- [ ] 전체 단위/통합 테스트 통과
- [ ] `npm run build` 성공
- [ ] 다크 모드 정상 동작
- [ ] spec.md 수용 기준 100% 달성

---

## 의존성 그래프

```
T-001 (DB 마이그레이션) ─────────────────────────────────┐
T-002 (Category 테스트) → T-003 (Category 구현) → T-004 (Repository 포트) ──┤
T-005 (아이콘 추가) [P] ────────────────────────────────────────────────────┤
                                                                            │
                    ┌───────────────────────────────────────────────────────┘
                    │ CHECKPOINT 1
                    │
                    ├──→ T-006 (UseCase 테스트) → T-007 (UseCase 구현) ─────┐
                    ├──→ T-008 (SupabaseRepo 구현) [P] ────────────────────┤
                    ├──→ T-009 (스킬필터 테스트) → T-010 (스킬필터 구현) ──┤
                    │                                                       │
                    │ CHECKPOINT 2 ←────────────────────────────────────────┘
                    │
                    ├──→ T-011 (Sidebar 테스트) → T-012 (Sidebar 리팩토링) ──→ T-013 (Layout 수정)
                    │                                                              │
                    │                    T-007 + T-008 ──→ T-014 (page.tsx 수정) ←─┘
                    │                                        │
                    │                    T-010 ──→ T-015 (DashboardPage 수정) ←── T-014
                    │
                    │ CHECKPOINT 3
                    │
                    ├──→ T-016 (MyAgent 테스트) → T-017 (MyAgent 구현) ──→ T-018 (myagent 라우트)
                    │                                                        │
                    │                                           T-019 (Sidebar 통합 테스트) ←─┘
                    │
                    ├──→ T-020 (전체 테스트) [P]
                    ├──→ T-021 (빌드 검증) [P]
                    ├──→ T-022 (다크 모드 검증)
                    │
                    └──→ T-023 (수용 기준 체크) ←── T-020, T-021, T-022
```

---

## 병렬 실행 가능 태스크 [P]

| 그룹 | 태스크 | 조건 |
|------|--------|------|
| Phase 1 | T-001, T-002→T-003, T-005 | DB와 도메인/아이콘 독립 |
| Phase 2 | T-006→T-007, T-008, T-009→T-010 | UseCase/Repo/스킬필터 독립 (Phase 1 이후) |
| Phase 4 | T-020, T-021 | 테스트와 빌드 독립 |

---

## 태스크 요약

| Phase | 태스크 수 | TEST | IMPL | CONFIG |
|-------|----------|------|------|--------|
| 1. DB + Domain | 5 | 1 | 3 | 1 |
| 2. Application + Infra | 5 | 2 | 3 | 0 |
| 3. UI 수정 | 5 | 1 | 4 | 0 |
| 4. /myagent + 통합 | 8 | 4 | 2 | 1+1 |
| **합계** | **23** | **8** | **12** | **3** |

---

## US ↔ 태스크 매핑

| 유저 스토리 | 관련 태스크 |
|------------|-----------|
| US-001 (사이드바 메뉴 탐색) | T-005, T-011, T-012, T-013, T-019 |
| US-002 (카테고리별 스킬 필터링) | T-001~T-010, T-011, T-012, T-014, T-015 |
| US-003 (내 에이전트 페이지 접근) | T-012, T-016, T-017, T-018, T-019 |
| US-004 (카테고리 관리 — 관리자) | T-001 (DB + RLS만, UI는 범위 밖) |
