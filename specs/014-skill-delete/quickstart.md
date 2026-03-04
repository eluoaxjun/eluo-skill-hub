# Quickstart: 스킬 삭제 기능

**Feature Branch**: `014-skill-delete`
**Date**: 2026-03-04

## 구현 개요

기존 스킬 관리 CRUD에 Delete 기능을 추가한다. Clean Architecture 패턴을 따라 Domain → Application → Infrastructure → Presentation 순서로 구현한다.

## 핵심 변경 사항

### 1. Domain Layer

**파일**: `src/admin/domain/types.ts`

- `DeleteSkillResult` 타입 추가

### 2. Application Layer

**파일**: `src/admin/application/delete-skill-use-case.ts` (신규)

- `DeleteSkillUseCase` 클래스 생성
- `AdminRepository.deleteSkill()` 호출

### 3. Infrastructure Layer

**파일**: `src/admin/infrastructure/supabase-admin-repository.ts`

- `deleteSkill(skillId: string)` 메서드 추가
- 삭제 순서: feedback_logs → templates(Storage+DB) → skill(Storage+DB)

### 4. Server Action

**파일**: `src/app/admin/skills/actions.ts`

- `deleteSkill(skillId: string)` 서버 액션 추가
- Admin 권한 검증 포함
- `revalidatePath` 호출

### 5. UI Components

**파일**: `src/features/admin/SkillDeleteConfirmDialog.tsx` (신규)

- AlertDialog 기반 삭제 확인 다이얼로그
- 스킬 이름 표시 + 통계 영향 경고 메시지
- 삭제/취소 버튼 + 로딩 상태

**파일**: `src/features/admin/SkillCard.tsx` (수정)

- 삭제 버튼에 `SkillDeleteConfirmDialog` 연결

**파일**: `src/features/admin/SkillsCardGrid.tsx` (수정)

- 삭제 후 목록 갱신 처리

## 의존성

- 신규 패키지 추가 없음
- 기존 Shadcn AlertDialog, Sonner, lucide-react 활용

## 테스트 범위

- **Unit**: `DeleteSkillUseCase` 테스트
- **E2E**: 삭제 버튼 → 확인 다이얼로그 → 삭제 완료 플로우
