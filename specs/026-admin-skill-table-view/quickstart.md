# Quickstart: 스킬 관리 페이지 테이블뷰 추가

## 개요

관리자 스킬 관리 페이지(`/admin/skills`)에 그리드/테이블 뷰 토글을 추가한다. 데이터 레이어 변경 없이 순수 UI 컴포넌트 추가/수정만 수행한다.

## 구현 순서

### 1. ViewModeToggle 컴포넌트 생성

`src/features/admin/ViewModeToggle.tsx`

- Props: `viewMode: 'grid' | 'table'`, `onViewModeChange: (mode) => void`
- lucide-react의 `LayoutGrid`, `List` 아이콘 사용
- 활성 뷰는 `bg-[#000080] text-white`, 비활성은 `bg-white text-slate-400` 스타일

### 2. SkillTableView 컴포넌트 생성

`src/features/admin/SkillTableView.tsx`

- Props: `skills: SkillRow[]`
- 컬럼: 제목 | 카테고리 | 버전 | 상태 | 태그 | 생성일 | 수정일 | 액션
- 상태 뱃지: Published(초록), Draft(회색) — 기존 SkillCard와 동일 스타일
- 태그: 최대 3개 + 초과 시 `+N`
- 액션: 수정(Link → `/admin/skills/edit/[id]`), 삭제(SkillDeleteConfirmDialog 재사용)
- 날짜 형식: `YYYY.MM.DD`

### 3. SkillsCardGrid 수정

`src/features/admin/SkillsCardGrid.tsx`

- `'use client'` 지시어 추가 (useState 사용을 위해)
- `useState<'grid' | 'table'>('grid')` 추가
- 검색창 왼쪽에 `ViewModeToggle` 배치
- `viewMode === 'grid'`일 때 기존 카드 그리드, `'table'`일 때 `SkillTableView` 렌더링
- 빈 상태/페이지네이션은 뷰 모드와 무관하게 공통 사용

### 4. E2E 테스트 작성

`src/__tests__/e2e/admin-skill-table-view.auth.spec.ts`

- 기본 뷰가 그리드인지 확인
- 토글 클릭 후 테이블뷰 전환 확인
- 테이블 행에 올바른 데이터 표시 확인
- 수정/삭제 버튼 동작 확인
- 필터 적용 후 뷰 전환 시 상태 유지 확인

## 핵심 파일

| 파일 | 변경 유형 |
|------|----------|
| `src/features/admin/ViewModeToggle.tsx` | 신규 |
| `src/features/admin/SkillTableView.tsx` | 신규 |
| `src/features/admin/SkillsCardGrid.tsx` | 수정 |
| `src/__tests__/e2e/admin-skill-table-view.auth.spec.ts` | 신규 |
