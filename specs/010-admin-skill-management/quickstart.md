# Quickstart: 어드민 스킬관리 페이지 디자인

**Feature Branch**: `010-admin-skill-management`
**Date**: 2026-03-04

## 변경 파일 목록

### 도메인 레이어
- `src/admin/domain/types.ts` — `SkillRow`에 `categoryIcon` 필드 추가, `AdminRepository.getSkills()` 시그니처에 `search`, `status` 파라미터 추가, `SkillStatusFilter` 타입 추가

### 애플리케이션 레이어
- `src/admin/application/get-skills-use-case.ts` — `search`, `status` 파라미터 전달 지원

### 인프라 레이어
- `src/admin/infrastructure/supabase-admin-repository.ts` — `getSkills()` 메서드에 검색(`ilike`), 상태 필터(`eq`), 카테고리 아이콘(`categories(name, icon)`) 쿼리 확장

### 페이지 (Server Component)
- `src/app/admin/skills/page.tsx` — `searchParams`에서 `q`, `status` 읽기, use case에 전달

### UI 컴포넌트 (신규/변경)
- `src/features/admin/SkillsCardGrid.tsx` — **신규** 카드 그리드 레이아웃 컴포넌트 (기존 `SkillsTable.tsx` 대체)
- `src/features/admin/SkillCard.tsx` — **신규** 개별 스킬 카드 컴포넌트
- `src/features/admin/SkillSearch.tsx` — **신규** 검색 입력 컴포넌트 (MemberSearch 패턴)
- `src/features/admin/SkillStatusFilter.tsx` — **신규** 상태 필터 탭 컴포넌트

### 삭제 대상
- `src/features/admin/SkillsTable.tsx` — 카드 그리드로 대체 후 삭제

## 의존성

신규 의존성 추가 없음. 기존 스택(lucide-react, Shadcn UI, Tailwind CSS)만 사용.

## 검증 방법

1. `http://localhost:3000/admin/skills` 접속
2. 스킬 카드 그리드가 표시되는지 확인
3. 검색란에 키워드 입력 후 필터링 확인
4. 필터 탭(전체/배포됨/초안) 전환 확인
5. 반응형 레이아웃 확인 (브라우저 크기 조절)
