# Research: 어드민 스킬 추가 팝업

**Branch**: `011-admin-skill-add-modal` | **Date**: 2026-03-04

## R1: Next.js Intercepting Routes + Parallel Routes 모달 패턴

**Decision**: `@modal` parallel route slot + `(.)new` intercepting route 조합으로 구현

**Rationale**:
- 소프트 네비게이션(Link 클릭) 시 모달 표시, 하드 네비게이션(직접 URL/새로고침) 시 전체 페이지 표시
- Next.js App Router의 공식 권장 패턴
- 프로젝트의 Next.js 16.1.6 버전에서 완벽 지원

**Alternatives considered**:
- Dialog 상태 관리 + URL 동기화: URL 직접 접근 시 전체 페이지 폴백이 복잡해짐
- React Portal + 브라우저 History API: Next.js 라우팅 시스템과 충돌 가능성

**구현 폴더 구조**:
```
src/app/admin/skills/
├── page.tsx                    # 스킬 목록 (기존)
├── layout.tsx                  # NEW: @modal 슬롯을 받는 레이아웃
├── new/
│   └── page.tsx                # 전체 페이지 폼 (하드 네비게이션용)
└── @modal/
    ├── default.tsx             # null 반환 (모달 비활성 상태)
    ├── (.)new/
    │   └── page.tsx            # 인터셉트된 모달 버전 (소프트 네비게이션)
    └── [...catchAll]/
        └── page.tsx            # null 반환 (다른 라우트로 이동 시 모달 닫기)
```

**핵심 규칙**:
- `@modal`은 라우트 세그먼트가 아니므로 `(.)new`(같은 레벨)을 사용
- `default.tsx` 필수 — 없으면 하드 네비게이션 시 404 발생
- `[...catchAll]` 필요 — 없으면 다른 라우트 이동 시 모달이 유지됨
- 모달 닫기는 `router.back()` 사용

## R2: Supabase Storage 파일 업로드

**Decision**: Supabase Storage 버킷을 사용하여 마크다운 및 템플릿 파일 저장

**Rationale**:
- 프로젝트가 이미 Supabase를 데이터베이스로 사용 중
- `@supabase/supabase-js`에 Storage API 내장 (추가 의존성 불필요)
- RLS 정책으로 접근 제어 가능
- CDN을 통한 파일 다운로드 지원

**Alternatives considered**:
- Vercel Blob: 추가 비용, 별도 SDK 필요
- DB TEXT 컬럼 직접 저장: 바이너리 파일(.zip) 불가, 대용량 비효율

**버킷 구조**:
- `skill-descriptions`: 설명 마크다운 파일 (`.md`)
- `skill-templates`: 템플릿 파일 (`.zip`, `.md`)

**파일 경로 규칙**: `{skill_id}/{filename}`

## R3: DB 스키마 변경

**Decision**: `skills` 테이블에 `icon` 컬럼 추가, `skill_templates` 테이블 신규 생성, `status` 값 마이그레이션

**Rationale**:
- 현재 `skills` 테이블에 `icon` 필드 부재 — 이모지 저장 불가
- 템플릿은 1:N 관계이므로 별도 테이블이 적합 (JSONB 컬럼 대비 개별 파일 CRUD 용이)
- `status` 값 'active'/'inactive'를 'published'/'drafted'로 변경하여 도메인 용어 일치

**Alternatives considered**:
- 템플릿을 JSONB 배열로 저장: 개별 파일 삭제/수정 시 전체 배열 교체 필요, 비효율
- `status` 매핑만 적용 (DB 변경 없음): 도메인과 DB 용어 불일치로 혼란 야기

## R4: OS 네이티브 이모지 입력기 연동

**Decision**: `contentEditable` 요소에서 OS 이모지 입력기를 트리거하는 방식 사용

**Rationale**:
- 별도 이모지 피커 라이브러리 불필요 (번들 크기 절감)
- 각 OS의 네이티브 이모지 UI를 그대로 활용

**구현 방식**:
- 버튼 클릭 시 숨겨진 `contentEditable` 요소에 포커스
- `inputMode="none"` 속성으로 키보드 방지, 이모지 입력만 허용
- 또는 단순히 텍스트 input에 이모지 직접 입력 가능하게 하고, 버튼 클릭 시 input에 포커스하여 사용자가 OS 이모지 단축키(Win+. / Ctrl+Cmd+Space)를 사용하도록 안내

**Alternatives considered**:
- emoji-mart 라이브러리: 추가 번들 30KB+, 헌법의 불필요 의존성 최소화 원칙에 위배

## R5: 임시저장 다이얼로그

**Decision**: Shadcn AlertDialog 사용

**Rationale**:
- `src/shared/ui/alert-dialog.tsx`에 이미 AlertDialog 컴포넌트 존재
- 모달 위에 다이얼로그를 오버레이하는 z-index 관리 가능
- 접근성(a11y) 기본 지원 (Radix UI 기반)

**Alternatives considered**:
- 브라우저 `window.confirm()`: 커스텀 스타일 불가, UX 불일치
- 커스텀 다이얼로그: 기존 AlertDialog 재사용이 효율적

## R6: 토스트 알림

**Decision**: sonner 라이브러리 사용

**Rationale**:
- `package.json`에 `sonner ^2.0.7` 이미 설치됨
- 아직 프로젝트에서 사용하지 않아 `<Toaster />` 프로바이더 추가 필요
- Shadcn UI와 호환되는 경량 토스트 라이브러리

**필요 작업**:
- 루트 레이아웃(`src/app/layout.tsx`)에 `<Toaster />` 컴포넌트 추가
- 저장 성공/실패 시 `toast()` 함수 호출
