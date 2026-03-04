# Implementation Plan: 스킬 수정 팝업 디자인

**Branch**: `013-skill-edit-popup-design` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-skill-edit-popup-design/spec.md`

## Summary

관리자가 스킬 카드의 수정 버튼을 클릭하여 기존 데이터가 미리 채워진 수정 팝업을 열고, 필드 편집 및 파일 삭제·교체를 수행한 후 저장할 수 있는 기능을 구현한다. 기존 스킬 추가 팝업(SkillAddForm)을 모드 기반으로 확장하고, Next.js 인터셉팅 라우트 패턴(`edit/[id]`)으로 모달 및 전체 페이지 접근을 모두 지원한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, @supabase/ssr ^0.8.0, @supabase/supabase-js ^2.98.0, Shadcn UI, Tailwind CSS v4, lucide-react, react-markdown, sonner
**Storage**: Supabase (PostgreSQL) — `skills`, `skill_templates` 테이블 + Supabase Storage (`skill-descriptions`, `skill-templates` 버킷)
**Testing**: Jest + React Testing Library (Unit), Playwright (E2E)
**Target Platform**: Web (Vercel 배포)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 수정 팝업 로딩 2초 이내 (SC-001)
**Constraints**: 기존 추가 팝업 구조와 동일한 UX 유지, `any` 금지
**Scale/Scope**: 관리자 전용 기능, 단일 사용자 동시 수정

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type Safety | PASS | 모든 신규 타입(SkillDetail, UpdateSkillInput, UpdateSkillResult, GetSkillResult) readonly 필드, `any` 미사용 |
| II. Clean Architecture | PASS | domain(types) → application(use-case) → infrastructure(repository) 레이어 준수. 기존 CreateSkill 패턴과 동일 구조 |
| III. Test Coverage | PASS | Unit: UpdateSkillUseCase, 유효성 검사. E2E: 수정 팝업 열기, 저장, 파일 관리 |
| IV. Feature Module Isolation | PASS | `src/admin/` 모듈 내 확장, `src/features/admin/` UI 컴포넌트 추가. 타 모듈 의존 없음 |
| V. Security-First | PASS | verifyAdmin() 서버 사이드 권한 검증 유지, RLS 기존 정책 활용 |

## Project Structure

### Documentation (this feature)

```text
specs/013-skill-edit-popup-design/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Data model & types
├── quickstart.md        # Phase 1: Quick start guide
├── contracts/
│   └── server-actions.md # Phase 1: Server action contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Tasks (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── admin/
│   ├── domain/
│   │   └── types.ts                    # +SkillDetail, +UpdateSkillInput, +UpdateSkillResult, +GetSkillResult
│   ├── application/
│   │   ├── create-skill-use-case.ts    # (기존)
│   │   ├── get-skill-use-case.ts       # (신규) getSkillById 유스케이스
│   │   └── update-skill-use-case.ts    # (신규) updateSkill 유스케이스
│   └── infrastructure/
│       └── supabase-admin-repository.ts # +getSkillById(), +updateSkill()
├── app/admin/skills/
│   ├── actions.ts                       # +getSkillById(), +updateSkill() 서버 액션
│   ├── edit/
│   │   └── [id]/
│   │       └── page.tsx                 # (신규) 전체 페이지 수정 폼
│   ├── @modal/
│   │   ├── (.)edit/
│   │   │   └── [id]/
│   │   │       └── page.tsx             # (신규) 인터셉팅 모달
│   │   └── ...existing...
│   └── ...existing...
├── features/admin/
│   ├── SkillAddForm.tsx                 # (수정) mode/initialData props 추가
│   ├── SkillAddModal.tsx                # (기존 유지)
│   ├── SkillEditModal.tsx               # (신규) 수정 모달 래퍼
│   ├── SkillCard.tsx                    # (수정) 수정 버튼 Link 연결
│   ├── MarkdownFileUpload.tsx           # (수정) 기존 파일 표시 지원
│   ├── TemplateFileUpload.tsx           # (수정) 기존 파일 표시 지원
│   ├── DraftSaveDialog.tsx              # (수정) edit 모드 지원
│   └── CloseConfirmDialog.tsx           # (기존 유지)
└── shared/infrastructure/supabase/
    └── storage.ts                       # (기존) uploadFile, deleteFile 활용
```

**Structure Decision**: 기존 프로젝트의 Clean Architecture 패턴(domain → application → infrastructure)과 Next.js App Router 인터셉팅 라우트 패턴을 그대로 따른다. 신규 파일은 최소화하고 기존 컴포넌트를 모드 기반으로 확장한다.

## Complexity Tracking

> 헌법 위반 사항 없음. 모든 설계가 기존 패턴을 따름.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (없음) | — | — |
