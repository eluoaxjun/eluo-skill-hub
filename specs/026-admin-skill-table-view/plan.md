# Implementation Plan: 스킬 관리 페이지 테이블뷰 추가

**Branch**: `026-admin-skill-table-view` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/026-admin-skill-table-view/spec.md`

## Summary

관리자 스킬 관리 페이지에 그리드/테이블 뷰 토글 기능을 추가한다. 검색창 왼쪽에 토글 버튼(LayoutGrid, List 아이콘)을 배치하고, 테이블뷰 선택 시 기존 카드 그리드 대신 행 기반 테이블로 동일한 스킬 데이터를 표시한다. 기존 수정/삭제 동작, 필터/검색/페이지네이션 상태는 뷰 전환과 무관하게 유지된다.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, Tailwind CSS v4, Shadcn UI, Radix UI, lucide-react
**Storage**: N/A (기존 데이터 모델 변경 없음, 순수 프론트엔드 변경)
**Testing**: Playwright (E2E), React Testing Library (Unit)
**Target Platform**: 웹 브라우저 (데스크탑 우선)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 뷰 전환 시 페이지 새로고침 없이 즉시 렌더링
**Constraints**: 기존 SkillsCardGrid 컴포넌트의 props 인터페이스 유지
**Scale/Scope**: 관리자 페이지 내 단일 컴포넌트 수준 변경

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | 새 컴포넌트/props 모두 명시적 타입 정의, `any` 사용 없음 |
| II. Clean Architecture | PASS | 순수 UI 변경, 도메인/인프라 레이어 수정 없음. `src/features/admin/` 내 UI 컴포넌트만 추가/수정 |
| III. Test Coverage | PASS | 테이블뷰 렌더링 + 뷰 토글 E2E 테스트 작성 예정 |
| IV. Feature Module Isolation | PASS | `admin` 모듈 내 `features/admin/` 범위 내 변경 |
| V. Security-First | PASS | 클라이언트 UI 상태만 관련, 데이터 접근/권한 변경 없음 |

## Project Structure

### Documentation (this feature)

```text
specs/026-admin-skill-table-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/features/admin/
├── SkillsCardGrid.tsx        # 기존 파일 수정: 뷰 토글 + 조건부 렌더링 추가
├── SkillCard.tsx              # 기존 그리드뷰 카드 (변경 없음)
├── SkillTableView.tsx         # 신규: 테이블뷰 컴포넌트
├── ViewModeToggle.tsx         # 신규: 그리드/테이블 토글 버튼 컴포넌트
├── SkillSearch.tsx            # 기존 (변경 없음)
├── SkillStatusFilter.tsx      # 기존 (변경 없음)
├── SkillCategoryFilter.tsx    # 기존 (변경 없음)
└── SkillDeleteConfirmDialog.tsx  # 기존 (변경 없음, 테이블뷰에서도 재사용)

src/__tests__/e2e/
└── admin-skill-table-view.auth.spec.ts  # 신규: E2E 테스트
```

**Structure Decision**: 기존 `SkillsCardGrid` 컴포넌트 내에 뷰 모드 상태를 추가하고, `ViewModeToggle`로 전환 UI를, `SkillTableView`로 테이블 렌더링을 담당한다. 기존 그리드 렌더링 로직은 그대로 유지하되 뷰 모드에 따라 조건부 렌더링한다.

## Complexity Tracking

> 해당 사항 없음. Constitution 위반 없음.
