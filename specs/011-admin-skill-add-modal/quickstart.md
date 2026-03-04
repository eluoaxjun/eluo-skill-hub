# Quickstart: 어드민 스킬 추가 팝업

**Branch**: `011-admin-skill-add-modal` | **Date**: 2026-03-04

## 구현 순서 (권장)

### 1단계: DB 마이그레이션
- `skills` 테이블에 `icon` 컬럼 추가
- `status` 값 마이그레이션 (active→published, inactive→drafted)
- `skill_templates` 테이블 생성 + RLS 정책
- Supabase Storage 버킷 생성 (skill-descriptions, skill-templates)

### 2단계: 도메인 타입 업데이트
- `src/admin/domain/types.ts`에서 SkillRow 타입의 status를 `'published' | 'drafted'`로 변경
- CreateSkillInput, SkillTemplateRow 등 새로운 타입 추가

### 3단계: 라우트 구조 생성
```
src/app/admin/skills/
├── layout.tsx              # @modal 슬롯 수용
├── new/
│   └── page.tsx            # 전체 페이지 폼
└── @modal/
    ├── default.tsx         # null
    ├── (.)new/
    │   └── page.tsx        # 모달 래퍼 + 폼
    └── [...catchAll]/
        └── page.tsx        # null
```

### 4단계: 스킬 추가 폼 컴포넌트
- `src/features/admin/SkillAddForm.tsx` — 폼 필드 + 유효성 검사
- 이모지 입력, 카테고리 드롭다운, 제목, 설명, 파일 업로드, 공개 토글
- **임시저장 버튼** 추가 (저장 버튼 옆)

### 5단계: 서버 액션 + 인프라
- `src/app/admin/skills/actions.ts` — createSkill, getCategories
- `src/admin/infrastructure/` — 저장소 업데이트
- Supabase Storage 업로드 유틸리티

### 6단계: 다이얼로그 구현 (2종)
- **DraftSaveDialog**: 임시저장 버튼 전용. 메시지 "입력한 내용을 초안으로 저장합니다", 버튼 '취소'/'임시저장'. 유효성 검사 건너뜀
- **CloseConfirmDialog**: X 버튼 전용. 메시지 "저장하지 않으면 입력한 내용이 사라집니다", 버튼 '취소'/'닫기'

### 7단계: 모달 닫기 보호
- **모달 외부 클릭** → 무시 (overlay onClick 제거)
- **X 버튼** → isDirty 체크 → CloseConfirmDialog 또는 즉시 닫힘
- **ESC 키** → X 버튼과 동일 동작

### 8단계: 토스트 알림
- sonner Toaster 프로바이더 추가 (이미 설정됨)
- 저장 성공 토스트 ("스킬이 저장되었습니다")
- 임시저장 성공 토스트 ("임시저장되었습니다")

### 9단계: 기존 코드 업데이트
- 스킬 목록 페이지에서 '새 스킬 추가하기' 버튼 추가
- SkillStatusFilter, SkillCard 등에서 status 값 업데이트 (active→published, inactive→drafted)

## 핵심 파일 참조

| 파일 | 역할 |
|------|------|
| `src/admin/domain/types.ts` | 도메인 타입 정의 |
| `src/admin/infrastructure/supabase-admin-repository.ts` | DB 접근 계층 |
| `src/app/admin/skills/page.tsx` | 스킬 목록 페이지 |
| `src/features/admin/SkillAddModal.tsx` | 모달 래퍼 (외부 클릭 무시, dirty 상태 관리) |
| `src/features/admin/SkillAddForm.tsx` | 폼 (임시저장 버튼 포함) |
| `src/features/admin/DraftSaveDialog.tsx` | 임시저장 확인 다이얼로그 |
| `src/features/admin/CloseConfirmDialog.tsx` | X 버튼 닫기 확인 다이얼로그 (신규) |
| `src/shared/ui/alert-dialog.tsx` | AlertDialog 컴포넌트 |
| `src/shared/infrastructure/supabase/server.ts` | Supabase 서버 클라이언트 |

## 주의 사항

- `any` 타입 사용 금지 (헌법 원칙 I)
- 모든 Supabase 테이블에 RLS 정책 필수 (헌법 원칙 V)
- 서버 액션에서 관리자 인증 재검증 필수 (헌법 원칙 V)
- Clean Architecture 레이어 분리 유지 (헌법 원칙 II)
- 임시저장은 유효성 검사를 건너뜀 (빈 필드 허용)
