# Research: 005-admin-skill-management

> 작성일: 2026-03-02

---

## 1. 현재 코드베이스 분석

### 기존 `skills` DB 테이블 (Supabase)
```
skills:
  id             uuid        PK, gen_random_uuid()
  title          text        NOT NULL
  category       text        CHECK('기획'|'디자인'|'퍼블리싱'|'개발'|'QA')
  markdown_file_path  text   NULL (Supabase Storage 경로)
  author_id      uuid        FK → auth.users.id
  created_at     timestamptz DEFAULT now()
```

**발견된 문제**: `status` 컬럼 없음 → spec 요구사항(활성/비활성)을 위해 마이그레이션 필요

### 기존 `categories` DB 테이블
```
categories: id, name, slug, icon, sort_order, created_at, updated_at
현재 데이터: 5건 (기획, 디자인, 퍼블리싱, 개발, QA)
```
→ `skills.category` CHECK 제약과 동일한 값이므로 categories 테이블에서 드롭다운 목록 조회 후 name을 직접 저장

### 기존 도메인 모델 불일치
현재 `src/skill-marketplace/domain/entities/Skill.ts`의 필드:
- `name, description, icon, categories[]` (마켓플레이스 표시용 목업 모델)

DB의 실제 필드:
- `title, category(string), markdown_file_path, author_id`

→ **결정**: 기존 `Skill` 엔티티는 마켓플레이스 표시용으로 유지하고, 어드민 관리용 별도 어그리게이트 `ManagedSkill`을 `skill-marketplace` 바운디드 컨텍스트 내에 신설

### 기존 인프라
- `InMemorySkillRepository` — 마켓플레이스 추천 스킬용 (mock data), 건드리지 않음
- `SupabaseCategoryRepository` — `findAll()`, `findBySlug()` 이미 구현됨 → 재사용
- `SupabaseAdminRepository` — admin 역할 확인 이미 구현됨 → 재사용
- Admin Layout (역할 확인) — 이미 구현됨 → 신규 page만 구현

---

## 2. 기술 선택

### 마크다운 렌더링

| 라이브러리 | 장점 | 단점 |
|-----------|------|------|
| `react-markdown` + `remark-gfm` + `rehype-highlight` | 경량, 트리쉐이킹, 커스텀 컴포넌트, MIT | 별도 스타일 설정 필요 |
| `@uiw/react-md-editor` | 에디터+뷰어 통합 | 무거움, 에디터 불필요 |
| 자체 구현 | 의존성 없음 | 공수 과다 |

**선택: `react-markdown` + `remark-gfm` + `rehype-highlight`**
- spec 요구(제목/코드블록/표/목록/강조/구분선) 모두 커버
- rehype-highlight로 코드 블록 문법 하이라이팅
- 커스텀 Tailwind 스타일 컴포넌트 매핑으로 도식화

### 토스트 알림

| 옵션 | 장점 | 단점 |
|------|------|------|
| `sonner` | 경량 (~3KB), React 19 지원, 접근성 | 새 의존성 |
| 자체 구현 | 의존성 없음 | 공수, 접근성 직접 처리 |

**선택: `sonner`** — shadcn/ui 에코시스템에서 권장, 가볍고 설정 간단

### 파일 업로드 (드래그 앤 드롭)

**선택: 네이티브 HTML `ondrop` API** — 별도 라이브러리 불필요, `.md` 파일만 허용이라 기능 단순

### 스토리지
**Supabase Storage**: `skill-markdowns` 버킷에 저장
- 경로: `{userId}/{skillId}.md`
- DB의 `markdown_file_path`에 버킷 내 경로 저장

---

## 3. 신규 의존성 목록

```
react-markdown        ^9.x  (마크다운 → React)
remark-gfm            ^4.x  (GitHub Flavored Markdown 지원)
rehype-highlight      ^7.x  (코드 블록 하이라이팅)
highlight.js          ^11.x (rehype-highlight peer dep)
sonner                ^2.x  (Toast 알림)

@types/react-markdown  (TS 타입)
```

> **constitution §2 준수**: 신규 라이브러리는 기존 스택(Next.js/React/Tailwind)과 충돌 없음. 모두 MIT 라이선스.

---

## 4. Supabase Storage 설계

```
버킷 이름: skill-markdowns
접근 정책:
  - 읽기: admin 역할 (authenticated + role check)
  - 쓰기: admin 역할만 허용

파일 경로: {authorId}/{skillId}.md
```

---

## 5. RLS 정책 고려사항

현재 `skills` 테이블은 `rls_enabled: true`이나 정책 내용 미확인.
- Admin 전용 INSERT/SELECT 정책 필요
- Storage 버킷도 admin 전용 write 정책 설정 필요
