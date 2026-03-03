# Implementation Plan: 프로젝트 환경 세팅

**Branch**: `002-project-setup` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-project-setup/spec.md`

## Summary

Next.js 16 + Tailwind CSS v4 프로젝트에서 Eluo 브랜드 컬러(#FEFE01, #00007F, #F0F0F0)를
CSS custom property 토큰으로 등록하고, 외부 CDN 폰트를 `next/font/local` 기반 로컬 서빙으로
전환하며, ESLint `no-explicit-any` 규칙을 error 수준으로 추가하여 컨스티튜션 원칙 I–V를
코드베이스 전체에 자동 강제한다.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict: true` 이미 설정)
**Primary Dependencies**: Next.js 16.1.6, React 19, Tailwind CSS v4, shadcn/ui, ESLint v9
**Storage**: N/A (설정 파일 변경만)
**Testing**: Jest + React Testing Library (단위), Playwright (E2E)
**Target Platform**: Web (Vercel)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: FOUT 제거 (localFont preload 자동 적용)
**Constraints**: 외부 CDN 폰트 의존 제거, `any` 타입 빌드 타임 차단
**Scale/Scope**: 프로젝트 전역 설정 변경 (모든 페이지/컴포넌트에 영향)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 확인 항목 | 상태 |
|-----|---------|-----|
| I. Type Safety | `tsconfig.json` `strict: true` 유지, ESLint `no-explicit-any: error` 추가 | ✅ PASS |
| II. Clean Architecture | 설정 파일 변경만, 도메인/애플리케이션 레이어 무변경 | ✅ PASS |
| III. Test Coverage | 설정 변경은 단위 테스트 대상 아님; 기존 테스트 회귀 없음 확인 | ✅ PASS |
| IV. Feature Module Isolation | 글로벌 CSS/레이아웃 변경만, bounded context 간 의존성 없음 | ✅ PASS |
| V. Security-First | 데이터 접근 없음, N/A | ✅ N/A |

**모든 게이트 통과 — 구현 진행 가능**

## Project Structure

### Documentation (this feature)

```text
specs/002-project-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── design-tokens.md # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
└── app/
    ├── font/
    │   └── PretendardVariable.woff2   # 로컬 폰트 파일 (신규 디렉토리)
    ├── globals.css                    # 브랜드 컬러 토큰 추가, CDN import 제거
    ├── layout.tsx                     # localFont 등록 + CSS variable 주입
    └── page.tsx                       # (변경 없음, LandingPage가 브랜드 컬러 표시)
src/features/root-page/
    └── LandingPage.tsx                # 브랜드 컬러 3종 사용 레이아웃

eslint.config.mjs                      # no-explicit-any: error 추가
```

**Structure Decision**: 단일 Next.js 프로젝트 구조 유지 (Option 1).
설정 파일 변경과 `src/app/font/` 신규 디렉토리만 추가.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. 이 표는 비워둔다.
