---
description: "Task list for 인증 페이지 로딩 성능 최적화"
---

# Tasks: 인증 페이지 로딩 성능 최적화

**Input**: Design documents from `/specs/001-optimize-auth-pages/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/performance-slo.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 어느 유저 스토리에 속하는지 (US1, US2, US3)

## Path Conventions

- App Router pages: `src/app/[route]/`
- Feature components: `src/features/auth/`
- Font files: `src/app/fonts/`
- E2E tests: `src/__tests__/e2e/`

---

## Phase 1: Setup

**Purpose**: 구현 전 성능 기준점(baseline) 측정 및 환경 확인

- [x] T001 로그인/회원가입 페이지 baseline 성능 측정 — `npm run build && npm run start` 후 `lighthouse http://localhost:3000/login --preset desktop --only-categories performance` 실행, TTI·FCP·CLS 수치를 `specs/001-optimize-auth-pages/data-model.md`의 Baseline 레코드에 기록
- [x] T002 [P] 폰트 파일 경로 확인 — `src/app/fonts/PretendardVariable.woff2` 존재 여부 확인 및 파일 크기 점검 (Variable 폰트 여부)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 유저 스토리의 전제가 되는 공용 인프라 변경

**⚠️ CRITICAL**: 세 태스크 모두 완료 전까지 어떤 유저 스토리 작업도 시작할 수 없다.

- [x] T003 [P] `src/app/globals.css` 1번째 줄 CDN @import 제거 — `@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css");` 한 줄 삭제. 폰트 변수(`--font-sans`, `--font-display`)는 유지
- [x] T004 [P] `src/app/layout.tsx`에 `next/font/local` 적용 — `localFont`로 `./fonts/PretendardVariable.woff2` 로드, `variable: '--font-pretendard'`, `display: 'swap'` 설정; `import "highlight.js/styles/github.css"` 줄 제거; `<html>` 태그에 폰트 CSS variable 클래스 추가
- [x] T005 [P] `src/features/auth/AuthSkeleton.tsx` 신규 생성 — `AuthLayout`과 동일한 외형(흰 카드, 둥근 모서리, 중앙 정렬)의 스켈레톤 컴포넌트; 제목 영역(h1 크기), 서브타이틀, 입력 필드 2개, 버튼 1개를 `animate-pulse` 회색 블록으로 표현; `'use client'` 불필요

**Checkpoint**: T003·T004·T005 완료 후 `npm run build` 실행 → 빌드 오류 없음 확인

---

## Phase 3: User Story 1 - 로그인 페이지 빠른 진입 (Priority: P1) 🎯 MVP

**Goal**: 로그인 페이지가 첫 방문 기준 2초 이내에 인터랙션 가능한 상태가 된다.

**Independent Test**: `/login` 접속 후 이메일 필드가 2초 안에 포커스 가능한지 확인

### Implementation for User Story 1

- [x] T006 [US1] `src/app/login/loading.tsx` 신규 생성 — `AuthSkeleton`을 import해 그대로 반환하는 기본 export 컴포넌트; Next.js App Router가 자동으로 Suspense 경계로 사용

### E2E Test for User Story 1

- [x] T007 [US1] `src/__tests__/e2e/auth-performance.spec.ts` 신규 생성 — `test('로그인 페이지 TTI ≤ 2000ms')`: `page.goto('/login')` 후 `page.waitForSelector('input[name="email"]', { state: 'visible' })` 완료까지 걸린 시간이 2000ms 이하인지 assert; `test('로그인 페이지 CLS < 0.1')`: `page.evaluate`로 PerformanceObserver CLS 수집 후 assert

**Checkpoint**: `/login` 독립 접속 → 이메일 폼 2초 내 표시, 스켈레톤 UI 깜빡임 없음

---

## Phase 4: User Story 2 - 회원가입 페이지 빠른 진입 (Priority: P2)

**Goal**: 회원가입 페이지가 첫 방문 기준 2초 이내에 인터랙션 가능한 상태가 된다.

**Independent Test**: `/signup` 접속 후 이메일 필드가 2초 안에 입력 가능한지 확인

### Implementation for User Story 2

- [x] T008 [P] [US2] `src/app/signup/loading.tsx` 신규 생성 — T006과 동일 패턴: `AuthSkeleton` import 후 기본 export; T006과 파일이 다르므로 병렬 가능

### E2E Test for User Story 2

- [x] T009 [US2] `src/__tests__/e2e/auth-performance.spec.ts`에 회원가입 테스트 추가 — `test('회원가입 페이지 TTI ≤ 2000ms')`: `/signup` goto 후 `input[name="email"]` visible 대기 시간 ≤ 2000ms assert; `test('회원가입 페이지 CLS < 0.1')`: CLS assert

**Checkpoint**: `/signup` 독립 접속 → 가입 폼 2초 내 표시, User Story 1과 독립적으로 테스트 가능

---

## Phase 5: User Story 3 - 인증 페이지 간 원활한 이동 (Priority: P3)

**Goal**: 로그인 ↔ 회원가입 페이지 간 전환이 1초 이내에 완료된다.

**Independent Test**: `/login`에서 "회원가입" 링크 클릭 후 `/signup` 폼 표시까지 1초 이내

### E2E Test for User Story 3

- [x] T010 [US3] `src/__tests__/e2e/auth-performance.spec.ts`에 전환 타이밍 테스트 추가 — `test('로그인→회원가입 전환 ≤ 1000ms')`: `/login` 이동 후 `a[href="/signup"]` 클릭, `input[name="email"]` visible까지 경과 시간 ≤ 1000ms assert; 역방향(`/signup`→`/login`) 테스트도 추가

**Checkpoint**: 로그인/회원가입 링크 클릭 시 즉시 다음 페이지 폼 표시, 추가 로딩 없음

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: 기능 회귀 검증 및 최적화 결과 기록

- [x] T011 [P] TypeScript 빌드 검증 — `npm run build` 실행, 타입 오류·빌드 오류 없음 확인
- [ ] T012 전체 Playwright E2E 테스트 실행 — `npx playwright test` 전체 실행, 기존 인증 기능(로그인·회원가입·이메일 인증) 회귀 없음 확인
- [ ] T013 최적화 후 성능 측정 및 비교 — T001과 동일 방법으로 `/login`·`/signup` 재측정, 개선율(TTI 50% 이상 단축 여부) `data-model.md`에 기록

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 시작 — 모든 유저 스토리 차단
- **US1 (Phase 3)**: Phase 2 완료 후 시작
- **US2 (Phase 4)**: Phase 2 완료 후 시작 — US1과 병렬 가능 (T008 [P])
- **US3 (Phase 5)**: Phase 3·4 완료 후 시작
- **Polish (Final)**: US3 완료 후 시작

### User Story Dependencies

- **US1 (P1)**: T005 완료 후 T006 시작 → T007
- **US2 (P2)**: T005 완료 후 T008 시작 (T006과 병렬) → T009
- **US3 (P3)**: T006·T007·T008·T009 완료 후 T010

### Parallel Opportunities

- T003, T004, T005 — 서로 다른 파일, 동시 실행 가능
- T006, T008 — 서로 다른 파일 (`login/loading.tsx`, `signup/loading.tsx`), 동시 실행 가능
- T011, T012, T013 — 독립적, 병렬 가능 (T013은 빌드 서버 필요)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: T001, T002 완료
2. Phase 2: T003, T004, T005 완료 (병렬)
3. Phase 3: T006, T007 완료
4. **STOP and VALIDATE**: `/login` TTI ≤ 2000ms 확인
5. 목표 달성 시 배포/데모 가능

### Incremental Delivery

1. Phase 1 + 2 → 폰트·CSS 최적화 완료 (두 페이지 모두 즉시 개선)
2. Phase 3 → 로그인 스켈레톤 + E2E 테스트 (US1 MVP 완성)
3. Phase 4 → 회원가입 스켈레톤 + E2E 테스트 (US2 완성)
4. Phase 5 + Final → 전환 테스트 + 회귀 검증 + 성과 측정

### Parallel Team Strategy

Phase 2 완료 후:
- Developer A: T006 + T007 (US1)
- Developer B: T008 + T009 (US2)
- 두 스토리 완료 후 합류 → T010 + Final Phase

---

## Notes

- T003과 T004는 각각 `globals.css`, `layout.tsx`를 수정 — 같은 PR에서 진행
- `next/font/local`의 `variable` 옵션을 사용하면 CSS `var(--font-pretendard)`로 Tailwind와 통합 가능
- T004에서 highlight.js CSS를 제거할 때, 스킬 상세 페이지 등 코드 하이라이팅이 필요한 곳에 import가 있는지 확인 후 해당 파일에만 추가 (별도 이슈로 추적)
- E2E 성능 테스트는 `npm run dev`(개발 서버)가 아닌 `npm run build && npm run start`(프로덕션) 기준으로 검증해야 실제 사용자 경험과 일치
