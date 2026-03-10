# Research: 스킬 관리 페이지 테이블뷰 추가

## 1. 뷰 모드 상태 관리 방식

**Decision**: React `useState`를 `SkillsCardGrid` 내부에서 사용
**Rationale**: 뷰 모드는 순수 UI 상태로, 서버 상태나 URL에 반영할 필요 없음. 페이지 새로고침 시 기본값(grid)으로 복원되는 것이 스펙 요구사항과 일치.
**Alternatives considered**:
- URL 쿼리 파라미터(`?view=table`): 불필요한 페이지 이동/리렌더링 유발, 스펙에서 "새로고침 시 기본값" 명시
- localStorage 영속화: 스펙에서 요구하지 않으며, 추후 필요 시 추가 가능

## 2. 테이블 컴포넌트 구현 방식

**Decision**: Tailwind CSS 기반 커스텀 `<table>` 요소 사용
**Rationale**: Shadcn UI의 Table 컴포넌트(Radix 기반이 아닌 순수 HTML table 래퍼)를 활용하면 일관된 스타일링이 가능하지만, 현재 프로젝트에 Shadcn Table이 설치되어 있지 않을 수 있으므로 Tailwind 기반 순수 table로 구현. 필요 시 Shadcn Table로 교체 가능.
**Alternatives considered**:
- Shadcn UI Table: 좋은 선택이나 추가 의존성 확인 필요
- AG Grid 등 서드파티 테이블 라이브러리: 과도한 의존성, 단순 표시 목적에 불필요

## 3. 토글 버튼 아이콘 선택

**Decision**: lucide-react의 `LayoutGrid` (그리드뷰) + `List` (테이블뷰) 아이콘 사용
**Rationale**: 프로젝트에 이미 lucide-react가 설치되어 있으며, 이 두 아이콘이 뷰 전환 UI에서 가장 직관적으로 인식됨.
**Alternatives considered**:
- `Grid3x3` + `Table`: Grid3x3는 너무 작게 보이고, Table은 스프레드시트 연상
- `Rows3` + `Columns3`: 의미가 덜 직관적

## 4. 테이블뷰 컬럼 구성

**Decision**: 제목 | 카테고리 | 버전 | 상태 | 태그 | 생성일 | 수정일 | 액션(수정/삭제)
**Rationale**: 스펙 FR-004에서 명시된 컬럼 + FR-005의 수정/삭제 액션을 마지막 컬럼에 배치
**Alternatives considered**:
- 설명 컬럼 포함: 행 높이가 과도하게 늘어남, 테이블뷰의 정보 밀도 이점 상실

## 5. 빈 상태 처리

**Decision**: 기존 `SkillsCardGrid`의 빈 상태 UI를 뷰 모드와 무관하게 공유
**Rationale**: 빈 상태는 데이터 부재를 나타내므로 뷰 모드에 따라 다를 필요 없음. "새 스킬 추가하기" CTA도 동일하게 표시.
