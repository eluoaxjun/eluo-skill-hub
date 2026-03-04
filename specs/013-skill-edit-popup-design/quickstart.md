# Quickstart: 스킬 수정 팝업 디자인

**Feature**: 013-skill-edit-popup-design
**Date**: 2026-03-04

## Prerequisites

- Node.js 18+
- pnpm (패키지 매니저)
- Supabase 프로젝트 (MCP 연결)
- 환경변수: `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Setup

```bash
# 1. 브랜치 체크아웃
git checkout 013-skill-edit-popup-design

# 2. 의존성 설치
pnpm install

# 3. 개발 서버 실행
pnpm dev
```

## Implementation Order

### Step 1: Domain Types
`src/admin/domain/types.ts`에 `SkillDetail`, `UpdateSkillInput`, `UpdateSkillResult`, `GetSkillResult` 타입 추가

### Step 2: Repository Methods
`src/admin/infrastructure/supabase-admin-repository.ts`에 `getSkillById()`, `updateSkill()` 구현

### Step 3: Use Cases
`src/admin/application/update-skill-use-case.ts` 생성
`src/admin/application/get-skill-use-case.ts` 생성

### Step 4: Server Actions
`src/app/admin/skills/actions.ts`에 `getSkillById()`, `updateSkill()` 서버 액션 추가

### Step 5: SkillAddForm 확장
기존 `src/features/admin/SkillAddForm.tsx`에 `mode`, `skillId`, `initialData` props 추가. 기존 파일 표시/삭제 UI 추가.

### Step 6: SkillEditModal 생성
`src/features/admin/SkillEditModal.tsx` — SkillAddModal 패턴 복제 + edit 모드 적용

### Step 7: Routing
```
src/app/admin/skills/edit/[id]/page.tsx        # 전체 페이지
src/app/admin/skills/@modal/(.)edit/[id]/page.tsx  # 인터셉팅 모달
```

### Step 8: SkillCard 연결
`src/features/admin/SkillCard.tsx` 수정 버튼에 `Link` 연결 → `/admin/skills/edit/[id]`

## Verification

```bash
# 타입 체크
pnpm tsc --noEmit

# 개발 서버에서 수동 테스트
# 1. /admin/skills 접근
# 2. 스킬 카드 수정 버튼 클릭 → 모달 팝업 확인
# 3. 필드 편집 → 저장 → 목록 반영 확인
# 4. /admin/skills/edit/[id] 직접 접근 → 전체 페이지 확인
```
