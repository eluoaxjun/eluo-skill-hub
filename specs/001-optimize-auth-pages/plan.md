# Implementation Plan: 인증 페이지 로딩 성능 최적화

**Branch**: `001-optimize-auth-pages` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-optimize-auth-pages/spec.md`

## Summary

로그인·회원가입 페이지의 느린 로딩 시간을 해결한다.
근본 원인은 세 가지다: (1) 외부 CDN에서 렌더 블로킹 방식으로 로드되는 Pretendard 폰트,
(2) 인증 페이지에 불필요하게 전역 로드되는 highlight.js CSS,
(3) 서버 컴포넌트 렌더링 중 사용자에게 보여지는 빈 화면.
해결책은 `next/font/local`로 폰트 로컬화, CSS 스코프 조정, `loading.tsx` 스켈레톤 추가다.
도메인·애플리케이션 계층은 변경하지 않는다.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16.1.6 (App Router) / React 19.2.3
**Primary Dependencies**: next/font (내장), Tailwind CSS v4, Playwright 1.58
**Storage**: N/A (이 기능은 데이터 저장소 변경 없음)
**Testing**: Jest + React Testing Library (컴포넌트), Playwright (E2E 성능 검증)
**Target Platform**: 웹 브라우저 (데스크탑 + 모바일)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 로그인/회원가입 TTI ≤ 2,000ms (데스크탑), CLS < 0.1
**Constraints**: 도메인 로직 무변경, `any` 타입 금지, 기존 인증 기능 회귀 없음
**Scale/Scope**: 2개 라우트 (login, signup) + 공용 레이아웃 컴포넌트 1개

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. Domain-Driven Architecture | ✅ PASS | 변경 범위는 `infrastructure`/UI 계층만. `domain`/`application` 계층 무변경. |
| II. Aggregate Root Integrity | ✅ PASS | 상태 변경 없음. 성능 최적화는 렌더링 파이프라인만 변경. |
| III. Type Safety | ✅ PASS | 신규 파일 모두 TypeScript strict 적용. `any` 사용 없음. |
| IV. Test Discipline | ✅ PASS | Playwright E2E 성능 테스트 + 컴포넌트 테스트 포함. |
| V. Commit Convention | ✅ PASS | `perf:` 또는 `fix:` 프리픽스로 커밋 예정. |

**Post-design re-check**: ✅ Phase 1 설계 완료 후 동일하게 통과. 구조적 변경 없음.

## Project Structure

### Documentation (this feature)

```text
specs/001-optimize-auth-pages/
├── plan.md              # This file
├── research.md          # Phase 0 output — 병목 분석 및 해결 방향
├── data-model.md        # Phase 1 output — 성능 메트릭 모델
├── quickstart.md        # Phase 1 output — 측정 및 검증 가이드
├── contracts/
│   └── performance-slo.md   # Phase 1 output — 성능 SLO 계약
├── checklists/
│   └── requirements.md      # 스펙 품질 체크리스트
└── tasks.md             # Phase 2 output (/speckit.tasks 커맨드로 생성)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                  # 수정: next/font/local 적용, highlight.js 제거
│   ├── globals.css                 # 수정: CDN @import url() 제거, CSS 변수 정리
│   ├── login/
│   │   ├── page.tsx                # 변경 없음
│   │   └── loading.tsx             # 신규: 로그인 라우트 스켈레톤 UI
│   └── signup/
│       ├── page.tsx                # 변경 없음
│       └── loading.tsx             # 신규: 회원가입 라우트 스켈레톤 UI
├── features/
│   └── auth/
│       ├── AuthLayout.tsx          # 변경 없음
│       ├── LoginForm.tsx           # 변경 없음
│       ├── SignupForm.tsx          # 변경 없음
│       └── AuthSkeleton.tsx        # 신규: 공용 인증 페이지 스켈레톤 컴포넌트
└── fonts/
    └── PretendardVariable.woff2    # 신규: 로컬 폰트 파일 (next/font/local용)

tests/
└── e2e/
    └── auth-performance.spec.ts    # 신규: Playwright 성능 검증 테스트
```

**Structure Decision**: 기존 App Router 구조 유지. 각 라우트에 `loading.tsx` 추가
(Next.js App Router 컨벤션). 공용 스켈레톤은 `src/features/auth/` 에 배치
(기존 auth feature 컴포넌트와 동일 위치). 폰트 파일은 `src/fonts/` 에 배치
(next/font/local 공식 문서 권장 위치).

## Complexity Tracking

> 이 기능은 모든 Constitution Check를 통과했다. 복잡도 위반 없음.
