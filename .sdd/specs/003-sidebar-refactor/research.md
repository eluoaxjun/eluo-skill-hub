# Research: 003-sidebar-refactor

> 기술 스택 리서치 결과

---

## 1. 기존 DB 상태 분석

### 현재 테이블 구조
```
public.roles       (id, name, description) — RLS 활성
public.profiles    (id, email, created_at, role_id → roles.id) — RLS 활성
public.skills      (id, title, category, markdown_file_path, author_id, created_at) — RLS 활성
```

### skills.category 컬럼
- 타입: `text`
- CHECK 제약: `category = ANY (ARRAY['기획', '디자인', '퍼블리싱', '개발', 'QA'])`
- **이미 5개 카테고리가 정의되어 있음** → categories 테이블과 일관성 유지 필요

### roles 테이블
- 2개 행 존재 (일반 사용자, 관리자로 추정)
- `profiles.role_id`가 기본값으로 특정 UUID를 가짐
- **관리자 판별에 활용 가능** → RLS 정책에서 role 기반 접근 제어

---

## 2. Next.js App Router — searchParams 처리

### Server Component에서 searchParams 읽기
```tsx
// app/page.tsx (Next.js 16)
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  // category로 필터링
}
```

- Next.js 15+에서 `searchParams`는 **Promise** (비동기)
- Server Component에서 직접 접근 가능
- 페이지 리렌더 없이 URL 쿼리만 변경 → Soft Navigation

### Client Component에서 searchParams 읽기
```tsx
"use client";
import { useSearchParams } from "next/navigation";

function Sidebar() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
}
```

- `useSearchParams()` 훅으로 현재 쿼리 파라미터 접근
- **Suspense boundary 필요** (Next.js 공식 권장)

---

## 3. Server/Client 컴포넌트 경계 설계

### 현재 구조
```
page.tsx (Server) → DashboardLayout → Sidebar (Client, usePathname)
```

### 변경 방안: Props 전달 패턴
```
page.tsx (Server, categories 조회 + searchParams 읽기)
  → DashboardLayout (categories prop 전달)
    → Sidebar (Client, categories prop + usePathname + useSearchParams)
```

**이유:**
- Sidebar는 이미 Client Component (usePathname 사용)
- 카테고리 데이터를 서버에서 조회하여 props로 전달하면 워터폴 방지
- Client에서 DB 직접 호출 불필요

### /myagent 페이지
- `app/myagent/page.tsx`에서 동일한 DashboardLayout 사용
- 카테고리 조회 로직 재사용 (GetCategoriesUseCase)

---

## 4. Supabase RLS 정책 설계

### categories 테이블 RLS
```sql
-- 인증 사용자 읽기 허용
CREATE POLICY "categories_select_authenticated"
ON categories FOR SELECT
TO authenticated
USING (true);

-- 관리자만 쓰기 허용 (roles 테이블 참조)
CREATE POLICY "categories_insert_admin"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);
```

### 성능 최적화
- `(select auth.uid())` 래핑으로 캐싱 활용 (Supabase 권장)
- `TO authenticated` 명시로 anon 역할 불필요한 정책 실행 방지

---

## 5. DDD 바운디드 컨텍스트 결정

### 선택: `category` 독립 컨텍스트
- Category는 독립적 생명주기 (관리자 CRUD)
- Skills가 category를 참조하지만, category가 skill에 종속되지 않음
- 향후 다른 컨텍스트(예: 에이전트, 템플릿)에서도 category 재사용 가능

### 디렉토리 구조
```
src/category/
  domain/
    entities/Category.ts
    repositories/CategoryRepository.ts
    __tests__/Category.test.ts
  application/
    GetCategoriesUseCase.ts
    __tests__/GetCategoriesUseCase.test.ts
  infrastructure/
    SupabaseCategoryRepository.ts
```

---

## 6. 기존 SkillCategory VO와의 관계

### 현재
- `SkillCategory` VO: `{ name, variant }` — 스킬 카드 태그 표시용
- `InMemorySkillRepository`: 하드코딩된 카테고리명 (업무 자동화, 문서 작성 등)

### 변경 계획
- `InMemorySkillRepository` 목업 데이터를 새 카테고리명으로 업데이트
- `SkillRepository.getRecommended()` → `getRecommended(categorySlug?: string)` 시그니처 변경
- 카테고리 slug로 필터링 지원
- `SkillCategory` VO는 그대로 유지 (UI 표시용 variant 정보 포함)
