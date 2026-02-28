# Research & Design Decisions

## Summary
- **Feature**: `plugin-catalog-db`
- **Discovery Scope**: Extension (기존 7-테이블 복합 스키마를 단순화된 마크다운 기반 시스템으로 대체)
- **Key Findings**:
  - Supabase Storage는 `storage.objects` 테이블에 RLS 정책을 설정하여 버킷별 접근 제어를 구현한다. 인증된 사용자에게 읽기, 관리자에게 업로드/삭제를 허용하는 정책이 필요하다.
  - `react-markdown` v10.1.0은 React 19 및 Next.js 16과 호환되며, `remark-gfm` + `rehype-highlight` 플러그인 조합으로 GFM 문법과 코드 블록 구문 강조를 지원한다.
  - 기존 프로젝트의 관리자 역할 확인은 `profiles` 테이블의 `role` 컬럼과 `is_admin()` SECURITY DEFINER 함수를 사용하며, 이 패턴을 skills 테이블 RLS에도 일관되게 적용한다.

## Research Log

### Supabase Storage 버킷 및 RLS 정책
- **Context**: 요구사항 3에서 마크다운 파일을 Supabase Storage에 안전하게 저장하고 역할 기반 접근 제어를 요구
- **Sources Consulted**: [Storage Access Control - Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control), [Storage Buckets - Supabase Docs](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Storage Upload API](https://supabase.com/docs/reference/javascript/storage-from-upload)
- **Findings**:
  - Supabase Storage는 기본적으로 RLS 정책 없이는 어떤 업로드도 허용하지 않는다
  - `storage.objects` 테이블에 INSERT(업로드), SELECT(다운로드), DELETE(삭제) 정책을 각각 생성해야 한다
  - 업로드 시 `upsert` 기능을 사용하려면 INSERT + SELECT + UPDATE 권한이 필요하다
  - `storage.foldername(name)` 헬퍼 함수로 경로 기반 접근 제한이 가능하다
  - 프라이빗 버킷은 다운로드 시 JWT 인증 헤더 또는 서명된 URL이 필요하다
  - 업로드 API: `supabase.storage.from('bucket').upload(path, fileBody, { contentType, upsert })`
  - 다운로드 API: `supabase.storage.from('bucket').download(path)` (Blob 반환)
- **Implications**:
  - `skill-markdowns` 버킷을 프라이빗으로 생성하여 RLS 기반 접근 제어 적용
  - 인증된 사용자에게 SELECT(읽기), 관리자에게 INSERT/DELETE(업로드/삭제) 정책 생성
  - 다운로드된 Blob을 텍스트로 변환하여 `react-markdown`에 전달

### react-markdown 라이브러리 호환성 및 사용 패턴
- **Context**: 요구사항 4.3에서 마크다운 콘텐츠를 HTML로 변환하여 서식이 올바르게 표시되도록 요구
- **Sources Consulted**: [react-markdown GitHub](https://github.com/remarkjs/react-markdown), [react-markdown npm](https://www.npmjs.com/package/react-markdown), [React-Markdown Guide 2025](https://generalistprogrammer.com/tutorials/react-markdown-npm-package-guide)
- **Findings**:
  - 최신 버전: `react-markdown` v10.1.0, React 19 호환
  - ESM-only 패키지로 Next.js App Router에서 문제 없이 사용 가능
  - `remarkPlugins`와 `rehypePlugins` prop으로 플러그인 확장 가능
  - `remark-gfm`: GitHub Flavored Markdown(테이블, 체크리스트, 취소선 등) 지원
  - `rehype-highlight` 또는 `react-syntax-highlighter`: 코드 블록 구문 강조 지원
  - `@tailwindcss/typography`의 `prose` 클래스와 조합하면 마크다운 렌더링 스타일 자동 적용
  - TypeScript 타입 정의 내장
- **Implications**:
  - `react-markdown`, `remark-gfm` 패키지를 신규 의존성으로 추가
  - `@tailwindcss/typography` 플러그인 추가하여 `prose` 클래스 기반 마크다운 스타일링
  - 코드 블록 구문 강조는 `rehype-highlight` + `highlight.js` CSS로 경량 구현

### 기존 관리자 역할 확인 패턴 분석
- **Context**: 요구사항 5에서 RLS 기반 접근 제어 시 관리자 역할 확인 방법 결정 필요
- **Sources Consulted**: 기존 코드베이스 분석 (`supabase/migrations/20260228000000_add_role_to_profiles.sql`, `src/user-account/`)
- **Findings**:
  - 프로젝트에서 관리자 역할은 `profiles.role = 'admin'`으로 저장
  - `public.is_admin(check_user_id UUID)` SECURITY DEFINER 함수가 이미 존재
  - 이 함수는 RLS 정책에서 `public.is_admin(auth.uid())` 형태로 사용됨
  - `app_metadata` 방식이 아닌 `profiles` 테이블 기반 역할 관리 채택 중
- **Implications**:
  - skills 테이블 RLS 정책에서도 기존 `public.is_admin(auth.uid())` 패턴을 일관되게 사용
  - Storage 정책에서도 동일한 함수를 활용하여 관리자 확인

### 기존 대시보드 UI 구조 분석
- **Context**: 요구사항 4.5에서 기존 목업(mockSkills) 데이터를 실제 데이터베이스 조회로 대체 요구
- **Sources Consulted**: 기존 코드베이스 분석
- **Findings**:
  - 메인 대시보드는 `src/shared/ui/components/dashboard-shell.tsx` 기반의 클라이언트 컴포넌트
  - `useDashboardState` 훅에서 `mockSkills` 정적 데이터를 사용하여 필터링/검색 수행
  - `SkillSummary` 타입: `{ id, name, description, category, tags, icon }`
  - `SkillCard` 컴포넌트가 개별 스킬 카드를 렌더링
  - 카테고리 필터링과 검색 기능이 클라이언트 측에서 동작 중
  - 관리자 페이지는 `src/app/(admin)/admin/` 경로에 이미 존재하며 사이드바 네비게이션 구성
- **Implications**:
  - `SkillSummary` 타입을 마크다운 기반 스킬 모델에 맞게 확장 필요 (icon/tags 제거, markdownFilePath 추가 등)
  - `useDashboardState` 훅을 DB 조회 기반으로 교체하거나, 서버 컴포넌트에서 데이터를 가져와 전달
  - 관리자 페이지 레이아웃에 "스킬 관리" 네비게이션 항목 추가
  - 스킬 카드 클릭 시 마크다운 콘텐츠를 표시하는 상세 뷰 필요

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 기존 7-테이블 복합 스키마 유지 | categories, tags, skill_versions 등 7개 테이블 유지 | 확장성, 다대다 관계 지원 | 현재 요구사항 대비 과도한 복잡성 | 폐기 대상 |
| 단일 skills 테이블 + Storage | 스킬 메타데이터 테이블 1개 + Storage 마크다운 파일 | 최소한의 복잡성, 빠른 구현 | 카테고리가 텍스트 컬럼이므로 정규화 미흡 | 채택 |
| skills + categories 2개 테이블 | 카테고리를 별도 테이블로 분리 | 카테고리 정규화, FK 활용 | 5개 고정 카테고리에 대해 불필요한 조인 | 오버엔지니어링 |

## Design Decisions

### Decision: 단일 skills 테이블 + Supabase Storage 구조
- **Context**: 기존 7개 테이블 스키마가 현재 요구사항(마크다운 파일 업로드 기반 스킬 등록) 대비 과도하게 복잡함
- **Alternatives Considered**:
  1. 기존 7-테이블 스키마 유지 -- 불필요한 복잡성, 현재 요구사항과 불일치
  2. 단일 skills 테이블 + Storage -- 최소한의 테이블로 핵심 기능 구현
  3. skills + categories 2개 테이블 -- 5개 고정 카테고리에 FK는 과도함
- **Selected Approach**: 단일 skills 테이블 + Supabase Storage 버킷. skills 테이블에 제목, 카테고리(CHECK 제약), 마크다운 파일 경로, 작성자 ID를 저장하고, 마크다운 파일은 Storage에 업로드
- **Rationale**: 요구사항에서 카테고리는 5개 고정 값이며, 태그/버전/통계 기능은 불필요. 마크다운 파일이 스킬 콘텐츠의 핵심이므로 Storage 활용이 적합
- **Trade-offs**: 향후 카테고리 동적 추가 시 테이블 구조 변경 필요. 검색은 제목 기반 클라이언트 필터링으로 제한
- **Follow-up**: 카테고리 확장 필요 시 별도 마이그레이션으로 정규화 진행

### Decision: profiles 테이블 기반 관리자 확인 (is_admin 함수)
- **Context**: skills 테이블과 Storage 버킷의 RLS 정책에서 관리자 역할 확인 방법 결정 필요
- **Alternatives Considered**:
  1. `app_metadata.user_role` 기반 확인 -- Supabase 권장이나 기존 프로젝트와 불일치
  2. `profiles.role` + `is_admin()` 함수 -- 기존 프로젝트 패턴과 일관
  3. 별도 roles 테이블 조인 -- 이미 profiles에 role 컬럼 존재
- **Selected Approach**: 기존 `public.is_admin(auth.uid())` SECURITY DEFINER 함수 재사용
- **Rationale**: 프로젝트 전체에서 일관된 관리자 확인 패턴 유지. 함수가 이미 구현되어 있어 추가 작업 불필요
- **Trade-offs**: JWT 기반 확인보다 DB 조회가 추가되나, SECURITY DEFINER로 RLS 우회하여 성능 영향 최소화

### Decision: react-markdown + remark-gfm 마크다운 렌더링
- **Context**: 요구사항 4.3에서 마크다운을 HTML로 변환하여 올바르게 표시하도록 요구
- **Alternatives Considered**:
  1. `react-markdown` + `remark-gfm` -- 경량, React 네이티브, 플러그인 확장 가능
  2. `next-mdx-remote` -- MDX 지원이 필요하지 않은 상황에서 과도
  3. `marked` + `DOMPurify` -- React 컴포넌트 미제공, dangerouslySetInnerHTML 필요
- **Selected Approach**: `react-markdown` v10 + `remark-gfm` + `@tailwindcss/typography`
- **Rationale**: React 19/Next.js 16 호환, ESM 네이티브, TypeScript 타입 내장, 코드 블록 및 GFM 지원
- **Trade-offs**: ESM-only이므로 CommonJS 환경에서는 사용 불가하나, Next.js App Router에서 문제 없음

## Risks & Mitigations
- 기존 skill-catalog 도메인 코드 대체 시 하위 호환성 파괴 -- 기존 코드가 아직 프로덕션에서 사용되지 않으므로 위험 낮음. 기존 엔티티/값 객체/리포지토리를 단순화된 버전으로 교체
- Supabase Storage 파일 크기 제한 -- 마크다운 파일은 일반적으로 수 KB~수십 KB로 기본 제한(50MB)에 충분히 여유
- 마크다운 렌더링 XSS 위험 -- `react-markdown`은 기본적으로 HTML을 삽입하지 않으며(rehype-raw 미사용 시 안전), `rehype-sanitize` 추가로 보완 가능
- 카테고리 CHECK 제약 변경 어려움 -- ALTER TABLE로 CHECK 제약을 수정해야 하나, 현재 5개 고정 카테고리 변경 가능성 낮음

## References
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) -- Storage RLS 정책 패턴
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) -- 버킷 생성 및 관리
- [Supabase Storage Upload API](https://supabase.com/docs/reference/javascript/storage-from-upload) -- JavaScript 업로드 API
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) -- react-markdown 공식 저장소
- [react-markdown npm](https://www.npmjs.com/package/react-markdown) -- v10.1.0 패키지 정보
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) -- RLS 정책 공식 문서
