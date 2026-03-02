# Implementation Plan: 003-sidebar-refactor

> **Feature ID**: 003
> **Created**: 2026-03-02
> **Depends on**: 001-root-page, 002-auth

---

## 1. 구현 개요

사이드바 메뉴 구조 변경, 카테고리 DB 테이블 관리, 카테고리 필터링, `/myagent` 페이지 생성을 4개 Phase로 구현한다.

---

## 2. 아키텍처 결정

### AD-01: Category 독립 바운디드 컨텍스트
- **결정**: `src/category/` 독립 디렉토리로 분리
- **근거**: Category는 독립적 생명주기(관리자 CRUD), 향후 다른 컨텍스트에서도 재사용 가능
- **Constitution**: §3 "바운디드 컨텍스트별 모듈 분리"

### AD-02: Server → Client Props 전달 패턴
- **결정**: page.tsx(Server)에서 카테고리 조회 → props로 Sidebar(Client)에 전달
- **근거**: 워터폴 방지, Client에서 DB 직접 호출 불필요
- **대안 기각**: Sidebar를 Server Component로 전환 → usePathname/useSearchParams 훅 사용 불가

### AD-03: URL 쿼리 파라미터 기반 카테고리 필터링
- **결정**: `/?category={slug}` 형태로 필터 상태 관리
- **근거**: 브라우저 히스토리/공유 가능, SEO 친화적, Server Component에서 직접 읽기 가능

### AD-04: skills.category 컬럼 유지
- **결정**: 기존 `skills.category` text 컬럼의 CHECK 제약 유지, FK 전환하지 않음
- **근거**: 이 피처 범위 최소화, 필터링은 name 매칭으로 충분
- **향후**: 별도 마이그레이션에서 `category_id` FK로 전환 검토

### AD-05: /myagent 페이지 독립 구성
- **결정**: `app/myagent/page.tsx`에서 DashboardLayout 직접 사용 (route group 없이)
- **근거**: 현재 루트 페이지의 조건부 렌더링(Landing/Dashboard) 패턴과 충돌 없이 구현 가능
- **대안 기각**: `(dashboard)` route group → 루트 페이지 대폭 리팩토링 필요

---

## 3. 디렉토리 구조 (신규/변경)

```
src/
├── category/                              # [NEW] Category 바운디드 컨텍스트
│   ├── domain/
│   │   ├── entities/Category.ts           # Category 엔티티
│   │   ├── repositories/CategoryRepository.ts  # Repository 포트
│   │   └── __tests__/Category.test.ts
│   ├── application/
│   │   ├── GetCategoriesUseCase.ts        # 카테고리 목록 조회
│   │   └── __tests__/GetCategoriesUseCase.test.ts
│   └── infrastructure/
│       └── SupabaseCategoryRepository.ts  # Supabase 구현체
│
├── shared/ui/
│   ├── Sidebar.tsx                        # [MODIFY] 메뉴 구조 변경 + categories prop
│   ├── DashboardLayout.tsx                # [MODIFY] categories prop 전달
│   ├── icons/index.ts                     # [MODIFY] 새 아이콘 추가
│   └── __tests__/Sidebar.test.tsx         # [MODIFY] 테스트 업데이트
│
├── skill-marketplace/
│   ├── domain/repositories/SkillRepository.ts  # [MODIFY] 필터 파라미터 추가
│   ├── application/GetRecommendedSkillsUseCase.ts  # [MODIFY] 카테고리 필터링
│   └── infrastructure/InMemorySkillRepository.ts   # [MODIFY] 목업 데이터 업데이트
│
├── features/root-page/
│   └── DashboardPage.tsx                  # [MODIFY] 카테고리 필터 전달
│
├── features/myagent/                      # [NEW] 내 에이전트 페이지
│   └── MyAgentPage.tsx
│
└── app/
    ├── page.tsx                           # [MODIFY] 카테고리 조회 + searchParams
    └── myagent/
        └── page.tsx                       # [NEW] /myagent 라우트
```

---

## 4. 구현 Phase

### Phase 1: DB 스키마 + Domain 계층 (기반)

#### 1-1. Supabase 마이그레이션
- `categories` 테이블 생성 (id, name, slug, icon, sort_order, created_at, updated_at)
- 인덱스 생성 (slug, sort_order)
- RLS 활성화 + 정책 (SELECT: authenticated, INSERT/UPDATE/DELETE: admin)
- 시드 데이터 5건 삽입

#### 1-2. Category 도메인 엔티티
- `src/category/domain/entities/Category.ts`
- Entity 클래스 상속, 불변 속성: id, name, slug, icon, sortOrder
- 단위 테스트: 생성, 속성 접근

#### 1-3. CategoryRepository 포트
- `src/category/domain/repositories/CategoryRepository.ts`
- `findAll(): Promise<Category[]>` — sort_order ASC
- `findBySlug(slug: string): Promise<Category | null>`

#### 1-4. 아이콘 추가
- `src/shared/ui/icons/index.ts`에 BrushIcon, CodeIcon, BugReportIcon 추가
- 카테고리 아이콘과 매핑할 수 있도록 아이콘 레지스트리 유틸 함수 생성

**Checkpoint 1**: Category 도메인 테스트 통과, DB 테이블 생성 확인

---

### Phase 2: Application + Infrastructure 계층

#### 2-1. GetCategoriesUseCase
- `src/category/application/GetCategoriesUseCase.ts`
- CategoryRepository.findAll() 호출, 정렬된 목록 반환
- 통합 테스트: mock repository로 검증

#### 2-2. SupabaseCategoryRepository
- `src/category/infrastructure/SupabaseCategoryRepository.ts`
- Supabase client로 categories 테이블 조회
- `findAll()`: `select('*').order('sort_order', { ascending: true })`
- `findBySlug()`: `select('*').eq('slug', slug).single()`

#### 2-3. SkillRepository 필터링 확장
- `SkillRepository.getRecommended(categoryName?: string)` 시그니처 변경
- `GetRecommendedSkillsUseCase.execute(categoryName?: string)`
- `InMemorySkillRepository` 목업 데이터를 새 카테고리명으로 업데이트 + 필터 구현
- 기존 테스트 업데이트

**Checkpoint 2**: UseCase 테스트 통과, 기존 스킬 테스트 통과

---

### Phase 3: UI 수정 (사이드바 + 대시보드)

#### 3-1. Sidebar 리팩토링
- MAIN_MENU에서 마켓플레이스 제거
- "내 에이전트" href를 `/myagent`으로 변경
- `categories` prop 추가 (서버에서 전달받은 카테고리 목록)
- 카테고리 항목을 `/?category={slug}` 링크로 렌더링
- `useSearchParams()`로 현재 활성 카테고리 판별
- 아이콘 레지스트리에서 동적으로 아이콘 매핑

#### 3-2. DashboardLayout 수정
- `categories` prop 추가 → Sidebar에 전달

#### 3-3. app/page.tsx 수정
- 카테고리 목록 조회 (GetCategoriesUseCase)
- `searchParams`에서 `category` 읽기
- DashboardLayout에 categories 전달
- DashboardPage에 activeCategory 전달

#### 3-4. DashboardPage 수정
- `categoryName` prop 수신
- GetRecommendedSkillsUseCase.execute(categoryName) 호출
- 필터 적용된 스킬 목록 렌더링

#### 3-5. Sidebar 테스트 업데이트
- 마켓플레이스 제거 확인
- 새 카테고리 5개 표시 확인
- 활성 카테고리 스타일 확인

**Checkpoint 3**: Sidebar 테스트 통과, 빌드 성공, 대시보드에서 카테고리 필터링 동작

---

### Phase 4: /myagent 페이지 + 통합

#### 4-1. MyAgentPage 컴포넌트
- `src/features/myagent/MyAgentPage.tsx`
- 빈 상태 메시지: "아직 북마크한 에이전트가 없습니다"
- 아이콘 + 설명 텍스트

#### 4-2. app/myagent/page.tsx
- Server Component
- 인증 확인 (미인증 시 middleware가 /login으로 리다이렉트)
- 카테고리 조회 → DashboardLayout + MyAgentPage 렌더링

#### 4-3. middleware 업데이트
- `/myagent`을 보호 경로로 확인 (이미 whitelist 기반이므로 자동 보호)

#### 4-4. 통합 테스트
- 전체 테스트 실행
- 빌드 성공 확인
- E2E 스캐폴딩 (선택)

**Checkpoint 4**: 전체 테스트 통과, 빌드 성공, /myagent 접근 가능

---

## 5. 데이터 흐름 다이어그램

### 대시보드 (카테고리 필터링)
```
Browser: /?category=design
  ↓
app/page.tsx (Server Component)
  ├── supabase.auth.getUser() → user
  ├── GetCategoriesUseCase.execute() → categories[]
  ├── searchParams.category → "design"
  ├── categories.find(c => c.slug === "design") → { name: "디자인" }
  └── Render:
      DashboardLayout(categories)
        ├── Sidebar(categories, useSearchParams → "design" 활성)
        └── DashboardPage(categoryName="디자인")
              └── GetRecommendedSkillsUseCase.execute("디자인")
                    → 디자인 카테고리 스킬만 반환
```

### /myagent 페이지
```
Browser: /myagent
  ↓
middleware → 인증 확인 (미인증 시 /login 리다이렉트)
  ↓
app/myagent/page.tsx (Server Component)
  ├── supabase.auth.getUser() → user
  ├── GetCategoriesUseCase.execute() → categories[]
  └── Render:
      DashboardLayout(categories)
        ├── Sidebar(categories, pathname="/myagent" 활성)
        └── MyAgentPage (빈 상태)
```

---

## 6. Constitution 준수 자체 평가

| 원칙 | 준수 | 설명 |
|------|------|------|
| §2 기술 스택 | ✅ | Next.js App Router, TypeScript strict, Supabase MCP, Jest+RTL |
| §3 DDD 계층 분리 | ✅ | domain → application → infrastructure 계층 구조 준수 |
| §3 바운디드 컨텍스트 | ✅ | category 독립 컨텍스트로 분리 |
| §3 Aggregate Root | ✅ | Category 엔티티가 Aggregate Root 역할 |
| §3 domain 외부 의존성 금지 | ✅ | Category 엔티티는 순수 비즈니스 로직만 |
| §4 네이밍 컨벤션 | ✅ | PascalCase 엔티티/VO/UseCase, kebab-case 디렉토리 |
| §5 any 타입 금지 | ✅ | 모든 타입 명시 |
| §6 TDD | ✅ | 각 Phase에서 테스트 선행 |
| §7 보안 | ✅ | RLS 정책, 인증 필수, admin 역할 기반 접근 제어 |
| §8 성능 | ✅ | 서버 사이드 조회 (FOUC 방지), 인덱스 생성 |

**위반 사항: 없음**
