# Quickstart: 어드민 회원관리 기능

**Feature Branch**: `009-admin-member-management`
**Date**: 2026-03-04

## Prerequisites

- Node.js 18+
- Supabase 프로젝트 (RLS 활성화)
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## Setup Steps

### 1. DB 마이그레이션 실행

Supabase MCP를 통해 다음 마이그레이션을 순서대로 실행한다:

1. **profiles.name 필드 추가 + 데이터 마이그레이션**
2. **viewer 역할 추가**
3. **permissions, role_permissions 테이블 생성 + RLS + seed**
4. **handle_new_user() 트리거 수정**

### 2. Shadcn Select 컴포넌트 설치

```bash
npx shadcn@latest add select
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 확인 사항

1. `/admin/members` 접속 → 회원 목록에 이름 컬럼 표시 확인
2. 역할 드롭다운 클릭 → admin/user/viewer 선택지 확인
3. 역할 변경 → 성공 토스트 메시지 확인
4. 자기 자신의 역할 변경 → 드롭다운 비활성화 확인
5. 검색 입력 필드에 이름/이메일 입력 → 300ms 후 필터링된 결과 확인
6. 검색어 입력 시 URL에 `?q=검색어` 반영 확인
7. 검색어 입력 시 페이지가 1페이지로 리셋 확인
8. 검색 결과 0건 시 "검색 결과가 없습니다" 메시지 확인

## Architecture Overview

```
src/app/admin/members/
├── page.tsx              # 회원관리 페이지 (Server Component)
└── actions.ts            # updateMemberRole Server Action

src/admin/
├── domain/types.ts       # MemberRow, Role 등 타입 수정
├── application/
│   ├── get-members-use-case.ts     # 기존 (수정: name 필드 포함)
│   └── update-member-role-use-case.ts  # 신규
└── infrastructure/
    └── supabase-admin-repository.ts  # 기존 (수정: role 변경 메서드 추가)

src/features/admin/
├── MemberSearch.tsx          # 신규 (검색 입력 Client Component, debounce 300ms)
├── MembersTable.tsx          # 기존 (수정: Select 드롭다운, 검색 빈 상태)
└── RoleSelect.tsx            # 신규 (Client Component)

src/shared/ui/
└── select.tsx                # Shadcn Select 컴포넌트 (신규 설치)
```

## Key Decisions

- **Select > DropdownMenu**: 값 선택 UI에 의미적으로 적합
- **Server Action**: 기존 패턴 일관성 유지
- **name 필드**: profiles 테이블에 직접 저장 (auth.users 조인 제거)
- **RBAC 표준 모델**: permissions + role_permissions 조인 테이블
- **Supabase ILIKE 검색**: name + email 필드 부분 문자열 매칭, parameterized query로 SQL Injection 방지
- **URL 파라미터 상태 관리**: `?q=검색어&page=번호`, Server Component 자동 리렌더링 활용
