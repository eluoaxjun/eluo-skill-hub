# Implementation Plan: 어드민 스킬 추가 팝업

**Branch**: `011-admin-skill-add-modal` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-admin-skill-add-modal/spec.md`

## Summary

관리자가 스킬을 등록할 수 있는 모달 팝업을 구현한다. Next.js Intercepting Routes + Parallel Routes 패턴으로 모달을 구현하고, 임시저장 다이얼로그(2종: 임시저장용 / X버튼 닫기용), published/drafted 상태 관리, 파일 업로드(마크다운 설명 + 템플릿 파일)를 지원한다.

**핵심 변경 (Clarification 반영)**:
- 모달 외부 클릭 → 무시 (클릭 이벤트 차단)
- 임시저장 버튼 → 전용 다이얼로그 ("입력한 내용을 초안으로 저장합니다", 취소/임시저장)
- X 버튼 → 전용 다이얼로그 ("저장하지 않으면 입력한 내용이 사라집니다", 취소/닫기)
- 임시저장 시 필수 필드 유효성 검사 건너뜀

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` 금지)
**Primary Dependencies**: Next.js 16.1.6 (App Router), React 19.2.3, @supabase/ssr ^0.8.0, @supabase/supabase-js ^2.98.0, Shadcn UI (Radix UI), Tailwind CSS v4, sonner ^2.0.7, lucide-react 0.576.0
**Storage**: Supabase (PostgreSQL) + Supabase Storage (skill-descriptions, skill-templates 버킷)
**Testing**: Playwright (E2E), React Testing Library + Jest (Unit/Component)
**Target Platform**: Web (Vercel 배포)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 모달 열기/닫기 200ms 이내, 저장 응답 2초 이내
**Constraints**: 파일 업로드 100KB/템플릿, 1MB/마크다운, RLS 필수
**Scale/Scope**: 관리자 전용 기능, 동시 사용자 수 적음

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety | PASS | 모든 타입 명시적 정의 (SkillRow, CreateSkillInput, CreateSkillResult 등). `any` 미사용 |
| II. Clean Architecture | PASS | domain/types.ts → application/use-case.ts → infrastructure/supabase-repo.ts 3계층 분리 유지 |
| III. Test Coverage | PASS | 각 use case, 컴포넌트, E2E 흐름에 대한 테스트 계획 포함 |
| IV. Feature Module Isolation | PASS | `src/admin/` 도메인 내 자체 완결. `src/features/admin/` UI 분리. 공유 요소는 `src/shared/` |
| V. Security-First | PASS | 서버 액션에서 admin role 재검증, RLS 정책 적용, 서버 사이드 인증 |

**Tech Stack**:
| Layer | Required | Used | Status |
|-------|----------|------|--------|
| Frontend | Next.js (App Router) | Next.js 16.1.6 | PASS |
| Language | TypeScript (strict) | TypeScript 5 | PASS |
| Styling | Tailwind CSS v4 | Tailwind CSS v4 | PASS |
| Component | Shadcn UI | Shadcn UI (AlertDialog, Switch, Select 등) | PASS |
| Database | Supabase (via MCP) | Supabase + RLS | PASS |
| Unit Test | Jest + RTL | Jest + React Testing Library | PASS |
| E2E Test | Playwright | Playwright | PASS |
| Deploy | Vercel | Vercel | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/011-admin-skill-add-modal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── admin/
│   ├── domain/
│   │   └── types.ts                          # SkillRow, CreateSkillInput, SkillTemplateRow 등
│   ├── application/
│   │   ├── get-skills-use-case.ts            # 스킬 목록 조회
│   │   └── create-skill-use-case.ts          # 스킬 생성 (신규)
│   └── infrastructure/
│       └── supabase-admin-repository.ts      # Supabase 구현체
├── app/admin/skills/
│   ├── layout.tsx                            # Parallel routes 레이아웃 (@modal 슬롯)
│   ├── page.tsx                              # 스킬 목록 페이지
│   ├── actions.ts                            # Server Actions (createSkill, getCategories)
│   ├── new/
│   │   └── page.tsx                          # 전체 페이지 폼 (하드 네비게이션)
│   └── @modal/
│       ├── default.tsx                       # null (모달 비활성)
│       ├── (.)new/
│       │   └── page.tsx                      # Intercepting route → SkillAddModal
│       └── [...catchAll]/
│           └── page.tsx                      # null (다른 라우트 전환)
├── features/admin/
│   ├── SkillAddModal.tsx                     # 모달 래퍼 (오버레이 + dirty 상태 관리)
│   ├── SkillAddForm.tsx                      # 폼 컴포넌트 (입력 + 유효성 검사)
│   ├── DraftSaveDialog.tsx                   # 임시저장 확인 다이얼로그 (수정 필요)
│   ├── CloseConfirmDialog.tsx                # X 버튼 닫기 확인 다이얼로그 (신규)
│   ├── TemplateFileUpload.tsx                # 템플릿 파일 업로드 컴포넌트
│   ├── SkillCard.tsx                         # 스킬 카드
│   ├── SkillsCardGrid.tsx                    # 스킬 카드 그리드
│   ├── SkillSearch.tsx                       # 검색
│   └── SkillStatusFilter.tsx                 # 상태 필터
└── shared/
    ├── ui/
    │   ├── alert-dialog.tsx                  # Shadcn AlertDialog
    │   ├── sonner.tsx                        # Toaster 설정
    │   ├── switch.tsx                        # 토글 스위치
    │   └── textarea.tsx                      # 텍스트 영역
    └── infrastructure/supabase/
        ├── server.ts                         # 서버 클라이언트
        ├── client.ts                         # 브라우저 클라이언트
        └── storage.ts                        # 파일 업로드 유틸리티
```

**Structure Decision**: 기존 Clean Architecture 구조(`admin/domain → application → infrastructure`)를 그대로 유지. UI 컴포넌트는 `features/admin/` 하위에 배치. 다이얼로그 컴포넌트를 2개로 분리 (DraftSaveDialog, CloseConfirmDialog).

## Component Interaction Design

### Dialog 분리 전략 (Clarification 핵심 반영)

기존에는 하나의 `DraftSaveDialog`가 모든 닫기 시도를 처리했으나, 사양 변경으로 2가지 독립 다이얼로그로 분리:

#### 1. DraftSaveDialog (임시저장 버튼 전용)
- **트리거**: 모달 폼의 '임시저장' 버튼 클릭
- **메시지**: "입력한 내용을 초안으로 저장합니다"
- **버튼**: '취소' (다이얼로그만 닫힘, 모달 유지) / '임시저장' (유효성 검사 없이 drafted로 저장 후 모달 닫힘)
- **유효성 검사**: 건너뜀 (빈 필드 허용)

#### 2. CloseConfirmDialog (X 버튼 전용)
- **트리거**: 모달 상단 X 버튼 클릭 (입력 내용 있을 때만)
- **메시지**: "저장하지 않으면 입력한 내용이 사라집니다"
- **버튼**: '취소' (다이얼로그만 닫힘, 모달 유지) / '닫기' (내용 버리고 모달 닫힘)
- **조건**: 아무 입력 없으면 다이얼로그 없이 즉시 닫힘

#### 3. 모달 외부 클릭
- **동작**: 클릭 이벤트 완전 무시 (입력 상태와 무관)
- **구현**: overlay `onClick` 핸들러 제거 또는 `e.stopPropagation()`

### SkillAddModal 상태 흐름

```
[모달 열림]
  │
  ├─ 외부 클릭 → 무시 (아무 동작 없음)
  │
  ├─ X 버튼 클릭
  │    ├─ isDirty === false → 즉시 닫힘 (router.back())
  │    └─ isDirty === true → CloseConfirmDialog 표시
  │         ├─ '취소' → 다이얼로그 닫힘, 모달 유지
  │         └─ '닫기' → 내용 버리고 router.back()
  │
  ├─ 임시저장 버튼 클릭 → DraftSaveDialog 표시
  │    ├─ '취소' → 다이얼로그 닫힘, 모달 유지
  │    └─ '임시저장' → 유효성 검사 없이 drafted 저장 → 모달 닫힘
  │
  └─ 저장 버튼 클릭 → 유효성 검사 → published/drafted 상태로 저장 → 모달 닫힘
```

### SkillAddForm Props 변경

```typescript
interface SkillAddFormProps {
  categories?: CategoryOption[];
  onDirtyChange?: (isDirty: boolean) => void;
  onRequestDraftSave?: (input: CreateSkillInput) => void;  // 임시저장 버튼 클릭 시
}
```

## Complexity Tracking

> No constitution violations detected. No complexity exceptions needed.

## Research References

- [R1: Intercepting + Parallel Routes](./research.md#r1)
- [R2: Supabase Storage](./research.md#r2)
- [R3: DB 스키마 변경](./research.md#r3)
- [R4: OS 이모지 입력기](./research.md#r4)
- [R5: 임시저장 다이얼로그](./research.md#r5)
- [R6: 토스트 알림](./research.md#r6)

## Data Model Reference

- [Entity & Migration](./data-model.md)
