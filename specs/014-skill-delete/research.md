# Research: 스킬 삭제 기능

**Feature Branch**: `014-skill-delete`
**Date**: 2026-03-04

## R-001: 삭제 전략 — Hard Delete vs Soft Delete

**Decision**: Hard Delete (영구 삭제)
**Rationale**: 스펙에 명시된 요구사항. 스킬 삭제 시 관련 데이터(피드백 로그, 템플릿, 마크다운 파일)를 모두 제거하여 통계 분석에 영향을 미치는 것을 관리자가 인지하고 결정한다. 소프트 삭제는 통계 데이터를 보존하지만 사용자 요구사항과 다르다.
**Alternatives considered**:
- Soft Delete (`deleted_at` 컬럼 추가): 통계 보존 가능하지만 스펙 요구사항에 반함
- Archival (별도 아카이브 테이블): 복잡도 증가, 현재 요구사항 범위 초과

## R-002: 관련 데이터 삭제 순서

**Decision**: 자식 레코드 먼저 삭제 후 부모 레코드 삭제 (bottom-up)
**Rationale**: FK 제약 조건 위반을 방지하기 위해 의존 데이터를 먼저 삭제해야 한다. Supabase Storage 파일은 DB 레코드 삭제 전에 제거하여 고아 레코드가 남지 않도록 한다.
**Alternatives considered**:
- CASCADE DELETE (DB 레벨): DB 설정 변경 필요, 스토리지 파일 삭제를 별도로 처리해야 함
- 단일 트랜잭션: Supabase JS SDK에서 Storage와 DB를 하나의 트랜잭션으로 묶기 어려움

**삭제 순서**:
1. `skill_feedback_logs` (skill_id 기준)
2. `skill_templates` 레코드 조회 → Storage 파일 삭제 → DB 레코드 삭제
3. `skills` 레코드의 `markdown_file_path`로 Storage 파일 삭제
4. `skills` 레코드 삭제

## R-003: 확인 다이얼로그 UI 패턴

**Decision**: 기존 `AlertDialog` (Shadcn/Radix) 컴포넌트 재사용
**Rationale**: 프로젝트에 이미 `CloseConfirmDialog`, `DraftSaveDialog`가 동일 패턴으로 구현되어 있다. 일관된 UX를 위해 동일 컴포넌트를 사용한다.
**Alternatives considered**:
- 커스텀 모달: 불필요한 중복 구현
- Browser `confirm()`: UX 비일관, 스타일링 불가

## R-004: 통계 영향 경고 메시지 표현

**Decision**: AlertDialog 내에 경고 아이콘(lucide-react `AlertTriangle`)과 강조 텍스트로 표시
**Rationale**: 기존 다이얼로그 패턴에 경고 메시지를 추가하는 방식이 가장 자연스럽다. 경고 아이콘과 amber/yellow 계열 색상으로 시각적 강조를 준다.
**Alternatives considered**:
- 별도 경고 배너 컴포넌트: 과도한 구현, AlertDialog description 영역으로 충분
- 체크박스 확인: UX 복잡도 증가, 단순 삭제에 과도함

## R-005: 삭제 후 목록 갱신 전략

**Decision**: `revalidatePath`를 사용한 서버 사이드 리밸리데이션
**Rationale**: 기존 `createSkill`, `updateSkill` 서버 액션에서 사용하는 패턴과 동일. Next.js App Router의 서버 사이드 캐시를 무효화하여 목록을 자동 갱신한다.
**Alternatives considered**:
- `router.refresh()`: 클라이언트 사이드, 서버 컴포넌트 데이터 갱신 불확실
- SWR/React Query 뮤테이션: 프로젝트에서 사용하지 않는 라이브러리

## R-006: 에러 처리 전략

**Decision**: Result 타입 패턴 (`{ success: true } | { success: false; error: string }`)
**Rationale**: 기존 `CreateSkillResult`, `UpdateSkillResult`와 동일한 패턴. 일관된 에러 처리 인터페이스를 유지한다.
**Alternatives considered**:
- 예외 throw: 서버 액션에서 클라이언트로 에러 전파가 불명확
- HTTP 상태 코드: Server Action은 HTTP가 아닌 RPC 방식
