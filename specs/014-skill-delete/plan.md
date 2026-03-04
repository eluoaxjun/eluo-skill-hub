# Implementation Plan: 스킬 삭제 기능

**Branch**: `014-skill-delete` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-skill-delete/spec.md`

## Summary

관리자가 스킬 카드에서 삭제 버튼을 클릭하면 확인 다이얼로그가 표시되고, 통계 데이터 영향 경고를 포함하여 삭제를 확정하면 스킬 및 관련 데이터(템플릿 파일, 마크다운 파일, 피드백 로그)가 영구 삭제되는 기능을 구현한다. 기존 Clean Architecture 패턴(Domain → Application → Infrastructure)을 따르며, 기존 AlertDialog 컴포넌트와 Sonner 토스트를 활용한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, Shadcn UI (Radix AlertDialog), lucide-react, Sonner (toast)
**Storage**: Supabase (PostgreSQL) — `skills`, `skill_templates`, `skill_feedback_logs` 테이블 + Supabase Storage (`skill-descriptions`, `skill-templates` 버킷)
**Testing**: Playwright (E2E) + React Testing Library / Jest (Unit)
**Target Platform**: Web (Vercel 배포)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 삭제 작업 5초 이내 완료
**Constraints**: Hard delete (영구 삭제), 관리자 권한 필수
**Scale/Scope**: 단일 기능 추가 — 기존 스킬 관리 CRUD에 Delete 추가

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | `DeleteSkillResult` 타입 정의, `any` 사용 없음 |
| II. Clean Architecture | PASS | Domain(타입) → Application(UseCase) → Infrastructure(Repository) 패턴 준수 |
| III. Test Coverage | PASS | Unit 테스트(UseCase, Domain) + E2E 테스트(삭제 플로우) 계획 포함 |
| IV. Feature Module Isolation | PASS | `src/admin/` 모듈 내에서 구현, 크로스 도메인 임포트 없음 |
| V. Security-First | PASS | Server Action에서 admin 권한 검증, RLS 정책 활용 |

## Project Structure

### Documentation (this feature)

```text
specs/014-skill-delete/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── server-actions.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── admin/
│   ├── domain/
│   │   └── types.ts                          # + DeleteSkillResult 타입 추가
│   ├── application/
│   │   └── delete-skill-use-case.ts          # 신규: 삭제 유스케이스
│   └── infrastructure/
│       └── supabase-admin-repository.ts      # + deleteSkill() 메서드 추가
├── features/admin/
│   ├── SkillCard.tsx                          # 수정: 삭제 버튼 핸들러 연결
│   ├── SkillDeleteConfirmDialog.tsx           # 신규: 삭제 확인 다이얼로그
│   └── SkillsCardGrid.tsx                    # 수정: 삭제 후 목록 갱신
├── app/admin/skills/
│   └── actions.ts                            # + deleteSkill() 서버 액션 추가
└── shared/
    └── ui/
        └── alert-dialog.tsx                  # 기존 활용 (수정 없음)
```

**Structure Decision**: 기존 `src/admin/` 모듈 구조를 그대로 따름. 신규 파일 2개(UseCase, Dialog), 기존 파일 4개 수정(types, repository, actions, SkillCard/SkillsCardGrid).

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
