# Research: 스킬 추가 - AI 제목/설명 자동 생성

- **Feature ID**: 007

---

## 1. 현재 코드 분석

### 스킬 추가 흐름 (현재)
```
AddSkillModal (client)
  → onSubmit(formData) → createSkill Server Action
  → CreateManagedSkillUseCase.execute({ title: fileName, ... })
  → SupabaseManagedSkillRepository.save()
    → Supabase Storage 업로드
    → skills 테이블 INSERT
```

현재 `title`은 파일명에서 파생: `fileName.replace(/\.md$/, '')`
`description` 컬럼 없음.

### 기존 모달 상태 구조
- `categoryId`, `file`, `isDragging`, `isSubmitting`, `fileError`
- 제목/설명 입력 필드 없음

---

## 2. 기술 스택 결정

### Anthropic SDK
- 패키지: `@anthropic-ai/sdk` (프로젝트에 미설치)
- 사용 방식: `new Anthropic().messages.create()`
- 환경변수: `ANTHROPIC_API_KEY`

### 마크다운 렌더링
- `react-markdown@^10.1.0` 이미 설치됨
- `remark-gfm@^4.0.1` 이미 설치됨
- 추가 설치 불필요

### AI 호출 위치
- **Next.js API Route** 선택 (`src/app/api/admin/skills/generate-metadata/route.ts`)
- Server Action 대신 API Route를 사용하는 이유:
  - 파일 선택 즉시 비동기 AI 호출 필요 → `useTransition` 없이 `fetch`로 가능
  - 에러/로딩 상태를 모달 내에서 독립적으로 관리 용이
  - API Route는 `POST` body로 텍스트 수신 → 간결

---

## 3. 변경 영향 범위

### 영향받는 테스트 파일
- `src/skill-marketplace/domain/__tests__/ManagedSkill.test.ts` — `description` 추가 반영
- `src/skill-marketplace/application/__tests__/CreateManagedSkillUseCase.test.ts` — command에 `description` 추가
- `src/features/admin/__tests__/AddSkillModal.test.tsx` — 새 UI 요소 테스트 추가

### 영향없는 파일
- `GetAllManagedSkillsUseCase.ts` — 목록 조회만, description 표시 불필요 (현재)
- `SkillTable.tsx`, `SkillPreviewModal.tsx` — description 표시는 이번 스펙 범위 아님

---

## 4. 보안 고려사항

- API Route에서 `createClient()`로 사용자 인증 및 admin role 검증 수행
- `ANTHROPIC_API_KEY`는 `process.env`에서만 접근 (서버 사이드 전용)
- 마크다운 내용 길이 제한: API Route에서 10,000자 이상 시 400 반환 (DoS 방지)

---

## 5. 폴백 시나리오

| 상황 | 처리 방식 |
|------|-----------|
| AI API 응답 실패 (5xx, 타임아웃) | `generationError` 상태 → 빈 입력 필드 활성화, 수동 입력 유도 |
| JSON 파싱 실패 | 동일 폴백 처리 |
| `title`/`description` 빈 문자열 반환 | 빈 필드로 처리 → 사용자 직접 입력 |
