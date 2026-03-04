# Quickstart: 어드민 페이지

**Feature Branch**: `008-admin-page`
**Date**: 2026-03-04

## Prerequisites

- Node.js 18+
- pnpm (패키지 매니저)
- Supabase 프로젝트 활성 상태 (profiles, roles, skills, categories, skill_feedback_logs 테이블)
- admin role이 할당된 테스트 계정

## Setup

```bash
# 1. 브랜치 체크아웃
git checkout 008-admin-page

# 2. 의존성 설치
pnpm install

# 3. 환경변수 확인 (.env.local)
# NEXT_PUBLIC_SUPABASE_URL=<your-url>
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-key>

# 4. 개발 서버 실행
pnpm dev
```

## 테스트 계정 준비

admin 역할 테스트를 위해 Supabase Dashboard에서 특정 사용자의 `profiles.role_id`를 `a0000000-0000-0000-0000-000000000001` (admin)로 변경하거나, 다음 SQL을 실행:

```sql
UPDATE profiles
SET role_id = 'a0000000-0000-0000-0000-000000000001'
WHERE email = '<admin-test-email>';
```

## 주요 URL

| URL | 설명 |
|-----|------|
| `/admin` | 대시보드 (admin만 접근) |
| `/admin/members` | 회원 관리 |
| `/admin/skills` | 스킬 관리 |
| `/admin/feedbacks` | 피드백 관리 |

## 테스트 실행

```bash
# 단위 테스트
pnpm test -- --testPathPattern=admin

# E2E 테스트
pnpm exec playwright test src/__tests__/e2e/admin.spec.ts
```

## 검증 체크리스트

1. admin 계정으로 `/admin` 접속 → 대시보드 표시
2. user 계정으로 `/admin` 접속 → 접근 거부 안내 + 대시보드 이동 버튼
3. 비인증 상태로 `/admin` 접속 → 로그인 페이지 리다이렉트
4. 사이드바 메뉴 클릭 → 탭 전환 및 URL 변경
5. 각 탭에서 목록 데이터 표시 확인
