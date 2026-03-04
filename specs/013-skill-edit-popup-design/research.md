# Research: 스킬 수정 팝업 디자인

**Feature**: 013-skill-edit-popup-design
**Date**: 2026-03-04

## R-001: 기존 추가 팝업 구조 재사용 전략

**Decision**: SkillAddForm을 모드(add/edit) 기반으로 확장하여 재사용한다. 별도 SkillEditForm 컴포넌트를 만들지 않는다.

**Rationale**: SkillAddForm과 수정 폼의 레이아웃, 필드, 유효성 검사가 100% 동일하다. 모달 래퍼(SkillEditModal)만 별도로 만들되, 내부 폼은 props로 모드를 구분하여 초기값 채우기 + 저장 로직만 분기한다.

**Alternatives considered**:
- SkillEditForm 별도 생성: 코드 중복이 크고, 추가 팝업 수정 시 두 곳을 동시에 관리해야 함 → 유지보수 부담
- 공통 SkillForm 추출 후 Add/Edit 래퍼: 과도한 추상화, 현재 규모에서 불필요

## R-002: 인터셉팅 라우트 패턴 — edit/[id] 경로 구조

**Decision**: 기존 `new` 라우트와 동일한 패턴으로 `edit/[id]` 경로를 구성한다.

```
src/app/admin/skills/
├── edit/[id]/
│   └── page.tsx              # 전체 페이지 폴백
└── @modal/
    ├── (.)edit/[id]/
    │   └── page.tsx          # 인터셉팅 모달
    └── ...existing...
```

**Rationale**: Next.js App Router의 인터셉팅 라우트 패턴(`(.)` prefix)은 이미 `(.)new`에서 검증되었다. 동일 패턴을 `(.)edit/[id]`에 적용하면 클라이언트 내비게이션 시 모달, 직접 URL 접근 시 전체 페이지로 자연스럽게 동작한다.

**Alternatives considered**:
- `edit?id=xxx` 쿼리 파라미터 방식: 인터셉팅 라우트와 호환 불가, URL 공유 시 의미 불명확
- `[id]/edit` (id 먼저): 가능하나 기존 `new` 패턴과 일관성 저하

## R-003: 기존 파일 표시 및 삭제 처리

**Decision**: 기존 파일(이미 서버에 업로드된 파일)과 신규 파일(아직 업로드 전인 로컬 File 객체)을 구분하는 타입을 도입한다.

```typescript
// 기존 서버 파일 (경로 기반)
interface ExistingFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
}

// 수정 폼의 파일 상태
interface EditFileState {
  existingFiles: ExistingFile[];      // 서버에 이미 존재
  removedFileIds: string[];            // 삭제 대상 (저장 시 제거)
  newFiles: File[];                    // 신규 업로드 대상
}
```

**Rationale**: MarkdownFileUpload와 TemplateFileUpload는 현재 `File` 객체만 다루고 있다. 수정 모드에서는 서버에 이미 존재하는 파일 정보(이름, 크기)를 표시해야 하므로, 기존 파일을 나타내는 별도 타입이 필요하다. 삭제는 즉시 실행하지 않고 저장 시 일괄 처리한다.

**Alternatives considered**:
- 기존 파일을 File 객체로 변환(fetch 후 Blob): 불필요한 네트워크 비용, 대용량 파일 시 성능 이슈
- 삭제 즉시 반영: 사용자가 취소했을 때 복구 불가, UX 문제

## R-004: getSkillById 데이터 조회 설계

**Decision**: 스킬 상세 조회용 `getSkillById` 메서드를 AdminRepository에 추가한다. 스킬 기본 정보 + 카테고리 + 템플릿 파일 목록을 단일 호출로 반환한다.

**Rationale**: 수정 팝업이 열릴 때 모든 필드를 미리 채워야 하므로, 스킬의 전체 데이터(기본 정보, 마크다운 콘텐츠, 템플릿 파일 목록)를 한 번에 조회하는 것이 효율적이다.

**Alternatives considered**:
- 스킬 기본 정보와 템플릿을 별도 API로 분리: 추가 라운드트립, 로딩 상태 복잡해짐
- 기존 getSkills 결과에서 필터링: 마크다운 콘텐츠와 템플릿 정보가 없음

## R-005: updateSkill 서버 액션 설계

**Decision**: `createSkill`과 동일한 FormData 기반 서버 액션으로 `updateSkill`을 구현한다. 파일 삭제 대상 ID는 FormData에 `removedTemplateIds` 필드로 전달한다.

**Rationale**: 기존 createSkill의 유효성 검사 로직을 재사용할 수 있고, FormData는 파일과 텍스트를 함께 전송하는 표준 방식이다.

**Alternatives considered**:
- JSON body + 별도 파일 업로드: 두 번의 요청 필요, 트랜잭션 관리 복잡
- GraphQL mutation: 프로젝트 스택에 GraphQL이 없음

## R-006: DraftSaveDialog 수정 모드 대응

**Decision**: DraftSaveDialog에 `mode` prop을 추가하여 create/update 액션을 분기한다. `skillId` prop을 통해 수정 대상을 식별한다.

**Rationale**: 임시저장 기능은 추가/수정 모두에서 동일한 UX가 요구된다. 기존 다이얼로그를 확장하는 것이 새로 만드는 것보다 효율적이다.

**Alternatives considered**:
- 별도 DraftUpdateDialog: 코드 중복, 두 다이얼로그의 UI가 동일함
- onSave 콜백으로 추상화: 모달 컴포넌트에 저장 로직이 이미 존재하므로 분기가 더 명확
