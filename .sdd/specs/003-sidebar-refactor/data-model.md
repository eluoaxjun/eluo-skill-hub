# Data Model: 003-sidebar-refactor

---

## 1. 새 테이블: `categories`

### 스키마

| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|----------|------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | 고유 식별자 |
| `name` | `text` | NOT NULL, UNIQUE | 표시 이름 (예: 기획) |
| `slug` | `text` | NOT NULL, UNIQUE | URL 식별자 (예: planning) |
| `icon` | `text` | NOT NULL | 아이콘 식별자 (예: AccountTreeIcon) |
| `sort_order` | `integer` | NOT NULL, default 0 | 사이드바 표시 순서 |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | 생성 시각 |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | 수정 시각 |

### 시드 데이터

| name | slug | icon | sort_order |
|------|------|------|------------|
| 기획 | planning | EditNoteIcon | 1 |
| 디자인 | design | BrushIcon | 2 |
| 퍼블리싱 | publishing | CodeIcon | 3 |
| 개발 | development | TerminalIcon | 4 |
| QA | qa | BugReportIcon | 5 |

### 인덱스
- `categories_slug_idx` ON `slug` — URL 파라미터 기반 조회 최적화
- `categories_sort_order_idx` ON `sort_order` — 정렬 조회 최적화

### RLS 정책

| 정책명 | 작업 | 대상 역할 | 조건 |
|--------|------|----------|------|
| `categories_select_authenticated` | SELECT | authenticated | `true` (모든 인증 사용자 읽기 허용) |
| `categories_insert_admin` | INSERT | authenticated | `profiles.role_id`가 admin 역할인 경우 |
| `categories_update_admin` | UPDATE | authenticated | `profiles.role_id`가 admin 역할인 경우 |
| `categories_delete_admin` | DELETE | authenticated | `profiles.role_id`가 admin 역할인 경우 |

---

## 2. 도메인 모델: Category 엔티티

### Entity: `Category`

```
Category (Aggregate Root)
├── id: string (UUID)
├── name: string
├── slug: string
├── icon: string
├── sortOrder: number
├── createdAt: Date
└── updatedAt: Date
```

### Repository Port: `CategoryRepository`

```typescript
interface CategoryRepository {
  findAll(): Promise<Category[]>;           // sort_order ASC 정렬
  findBySlug(slug: string): Promise<Category | null>;
}
```

> 관리자 CRUD (create, update, delete)는 이 피처 범위 밖이므로 인터페이스에 포함하지 않음.
> 향후 관리자 기능 명세에서 확장.

---

## 3. 기존 테이블 변경 사항

### skills 테이블
- **변경 없음**: `skills.category` 컬럼은 기존 CHECK 제약 조건 유지
- 향후 `category_id` FK로 전환 가능하나, 이 피처 범위에서는 변경하지 않음
- 필터링 시 `skills.category`와 `categories.name`을 매칭하여 처리

### 연관 관계

```
categories (독립)
  │
  │ name ↔ skills.category (논리적 매칭)
  │
skills (기존 유지)
```

---

## 4. DDL 마이그레이션

```sql
-- 1. categories 테이블 생성
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. 인덱스
CREATE INDEX categories_slug_idx ON categories (slug);
CREATE INDEX categories_sort_order_idx ON categories (sort_order);

-- 3. RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책
CREATE POLICY "categories_select_authenticated"
ON categories FOR SELECT
TO authenticated
USING (true);

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

CREATE POLICY "categories_update_admin"
ON categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);

CREATE POLICY "categories_delete_admin"
ON categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);

-- 5. 시드 데이터
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('기획', 'planning', 'EditNoteIcon', 1),
  ('디자인', 'design', 'BrushIcon', 2),
  ('퍼블리싱', 'publishing', 'CodeIcon', 3),
  ('개발', 'development', 'TerminalIcon', 4),
  ('QA', 'qa', 'BugReportIcon', 5);
```
