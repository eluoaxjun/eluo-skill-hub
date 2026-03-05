# DB 쿼리 최적화 및 성능 분석 보고서

## 분석 일자: 2026-03-05

---

## 1. 현재 상태 요약

### 핵심 문제 2가지

| 문제 | 원인 | 영향 |
|---|---|---|
| 페이지 이동 시 캐싱 없이 매번 DB 요청 | 모든 페이지가 dynamic rendering, `unstable_cache`/`revalidate` 미설정 | 매 네비게이션마다 불필요한 DB 왕복 |
| 로그인 인증 시간 과다 | 미들웨어 비활성 + 요청당 `getUser()` 3~6회 중복 호출 | 토큰 갱신 불가(1시간 후 로그아웃), 인증 지연 |

---

## 2. 상세 분석

### 2.1 미들웨어 비활성 상태

**현황:** `src/proxy.ts`에 올바른 미들웨어 로직 구현되어 있음. Next.js 16에서는 `proxy.ts`가 기본 미들웨어 파일로 인식되므로 (`middleware.ts` 사용 불가) 이미 활성화 상태.

**결론:** 빌드 출력에서 `ƒ Proxy (Middleware)` 확인됨. 미들웨어는 정상 작동 중이며 JWT 토큰 자동 갱신 및 라우트 보호 동작.

**참고:** Next.js 16에서는 `middleware.ts`와 `proxy.ts`를 동시에 사용할 수 없으며, `proxy.ts`만 사용해야 함.

---

### 2.2 `getUser()` 중복 호출 분석

| 파일 | `getUser()` 호출 횟수 | 비고 |
|---|---|---|
| `src/app/(portal)/layout.tsx` | 1 | + profiles.roles 쿼리 1회 |
| `src/app/(portal)/dashboard/page.tsx` | 1 | Promise.all 내부 |
| `src/app/(portal)/myagent/page.tsx` | 1 | |
| `src/app/(portal)/dashboard/actions.ts` | 6 | 각 server action마다 개별 호출 |
| `src/app/admin/layout.tsx` | 1 | + profiles.roles 쿼리 1회 |
| `src/app/admin/members/page.tsx` | 1 | |
| `src/app/admin/members/actions.ts` | 1 | + profiles.roles 인라인 쿼리 |
| `src/app/admin/skills/actions.ts` | 6 | `verifyAdmin()` 내부에서 매번 호출 |
| `src/app/admin/skills/edit/[id]/page.tsx` | 1 | + profiles.roles 인라인 쿼리 |
| `src/app/admin/skills/@modal/(.)edit/[id]/page.tsx` | 1 | + profiles.roles 인라인 쿼리 |

**총합:** 단일 페이지 렌더링 시 layout + page + action에서 `getUser()` 3~6회 호출. 각 호출은 Supabase Auth 서버로 네트워크 왕복 발생.

**수정 계획:** React `cache()` 기반 공유 헬퍼로 요청 단위 1회 실행 보장

---

### 2.3 정적 데이터 캐싱 부재

| 데이터 | 변경 빈도 | 현재 캐싱 | 조회 위치 |
|---|---|---|---|
| `categories` | 거의 없음 | 없음 (매 요청 DB 조회) | dashboard-repository, admin-repository |
| `roles` | 거의 없음 | 없음 (매 요청 DB 조회) | admin-repository |

**수정 계획:** `unstable_cache` (tag: `'categories'`/`'roles'`, revalidate: 3600)

---

### 2.4 쿼리 워터폴 분석

**`supabase-admin-repository.ts` - `getSkillById()`:**
```
skill 조회 (SELECT skills) → 완료 후 → templates 조회 (SELECT skill_templates)
```
두 쿼리는 독립적이므로 `Promise.all`로 병렬화 가능.

**`supabase-admin-repository.ts` - `deleteSkill()`:**
```
skill 조회 → 완료 후 → templates 조회 → 완료 후 → 병렬 삭제
```
skill + templates 조회를 `Promise.all`로 병렬화 가능.

**`supabase-admin-repository.ts` - `getSkillStatusCounts()`:**
```
published COUNT 쿼리 + drafted COUNT 쿼리 (이미 Promise.all)
```
이미 병렬화되어 있으나, 단일 쿼리로 통합하여 DB 왕복 1회로 줄일 수 있음.

---

### 2.5 클라이언트 번들 오염

**문제:** `gray-matter` (Node.js 라이브러리, `js-yaml` 의존)가 클라이언트 번들에 포함됨.

**경로:** `parse-frontmatter.ts` → `gray-matter` → `js-yaml` (~15KB)

`parse-frontmatter.ts`는 `'use client'` 컴포넌트 체인에서 사용되어 클라이언트로 번들링됨. 실제 frontmatter 파싱은 단순 regex로 대체 가능.

---

## 3. 개선 계획 및 예상 효과

| Phase | 작업 | 예상 효과 |
|---|---|---|
| **Phase 1** | 미들웨어 활성화 | JWT 자동 갱신, Edge 라우트 보호 |
| **Phase 2** | `getUser()` React `cache()` 적용 | 요청당 auth API 3~6회 → 1회 |
| **Phase 3** | `unstable_cache` 적용 (categories, roles) | 카테고리/역할 DB 조회 1시간 캐싱 |
| **Phase 4** | 쿼리 워터폴 병렬화 | admin 스킬 편집/삭제 시 DB 왕복 1회 절약 |
| **Phase 5** | `gray-matter` 제거 → regex 파서 | 클라이언트 번들 ~15KB 절감 |

---

## 4. 변경 대상 파일

| 구분 | 파일 |
|---|---|
| **생성** | `src/middleware.ts`, `src/shared/infrastructure/supabase/auth.ts` |
| **수정** | `src/app/(portal)/layout.tsx`, `src/app/(portal)/dashboard/page.tsx`, `src/app/(portal)/myagent/page.tsx`, `src/app/(portal)/dashboard/actions.ts`, `src/app/admin/layout.tsx`, `src/app/admin/members/page.tsx`, `src/app/admin/members/actions.ts`, `src/app/admin/skills/actions.ts`, `src/app/admin/skills/edit/[id]/page.tsx`, `src/app/admin/skills/@modal/(.)edit/[id]/page.tsx`, `src/admin/infrastructure/supabase-admin-repository.ts`, `src/dashboard/infrastructure/supabase-dashboard-repository.ts`, `src/shared/utils/parse-frontmatter.ts` |
| **삭제** | `package.json`에서 `gray-matter` 의존성 |

---

## 5. 검증 방법

1. **미들웨어:** 로그아웃 상태 `/admin` → `/signin` 리다이렉트, 로그인 상태 `/signin` → `/dashboard` 리다이렉트
2. **토큰 갱신:** 1시간+ 세션 유지 후 로그인 상태 확인
3. **캐싱:** 네트워크 탭에서 페이지 이동 시 categories/roles 쿼리 캐시 적중 확인
4. **중복 제거:** Supabase 대시보드에서 요청당 auth API 호출 횟수 감소 확인
5. **번들 사이즈:** `npx next build` 후 클라이언트 번들에서 `gray-matter` 제거 확인
6. **회귀 테스트:** 로그인/로그아웃, 스킬 CRUD, 멤버 역할 변경, 대시보드 북마크 정상 동작 확인
