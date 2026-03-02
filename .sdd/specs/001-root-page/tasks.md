# Tasks: 001-root-page

> **Date**: 2026-03-02
> **Spec**: `.sdd/specs/001-root-page/spec.md`
> **Plan**: `.sdd/specs/001-root-page/plan.md`
> **Data Model**: `.sdd/specs/001-root-page/data-model.md`

---

## 범례

- `[P]` : 같은 그룹 내 병렬 실행 가능
- `[TEST]` : 테스트 코드 작성 (TDD Red 단계)
- `[IMPL]` : 구현 코드 작성 (TDD Green 단계)
- `[CONFIG]` : 설정/인프라 작업
- `→` : 선행 의존성

---

## Phase 1: 인프라 설정

> 모든 US에 대한 공통 기반. 인증 라우팅과 Supabase 연동에 필수.

### T-001 [CONFIG] `@supabase/ssr` 패키지 설치
- **파일**: `package.json`
- **작업**: `npm install @supabase/ssr` 실행
- **수용 기준**: `@supabase/ssr`이 dependencies에 추가됨
- [ ] 완료

### T-002 [IMPL] Supabase 서버 클라이언트 생성 → T-001
- **파일**: `src/shared/infrastructure/supabase/server.ts` (신규)
- **작업**: `createServerClient` from `@supabase/ssr` 사용, `cookies()` from `next/headers`로 쿠키 관리
- **수용 기준**: 서버 컴포넌트에서 `createClient()`로 Supabase 클라이언트를 생성할 수 있음
- [ ] 완료

### T-003 [IMPL] Supabase 브라우저 클라이언트 수정 [P] → T-001
- **파일**: `src/shared/infrastructure/supabase/client.ts` (수정)
- **작업**: `createClient` → `createBrowserClient` from `@supabase/ssr`로 변경
- **수용 기준**: 클라이언트 컴포넌트에서 Supabase 클라이언트를 사용할 수 있음
- [ ] 완료

### T-004 [IMPL] Middleware 생성 → T-002
- **파일**: `src/middleware.ts` (신규)
- **작업**: Supabase Auth 세션 갱신 처리, `matcher` 설정으로 정적 에셋 제외
- **수용 기준**: 모든 페이지 요청 시 세션이 자동 갱신됨
- **FR**: FR-01, FR-02
- [ ] 완료

---

### ✅ CHECKPOINT 1: 인프라 설정 완료
- [ ] `@supabase/ssr` 설치됨
- [ ] 서버/브라우저 클라이언트 생성 가능
- [ ] Middleware가 세션 갱신 처리
- [ ] `npm run build` 에러 없음

---

## Phase 2: 디자인 시스템 기반

> 모든 UI 컴포넌트의 기반이 되는 폰트, 색상, 아이콘 설정.

### T-005 [CONFIG] 폰트 변경 [P]
- **파일**: `src/app/layout.tsx` (수정)
- **작업**: Geist → Inter + Noto Sans KR (`next/font/google`)로 교체, `lang="ko"` 설정
- **수용 기준**: 페이지에 Inter + Noto Sans KR 폰트가 적용됨
- [ ] 완료

### T-006 [CONFIG] 디자인 토큰 추가 [P]
- **파일**: `src/app/globals.css` (수정)
- **작업**: `@theme inline` 블록에 커스텀 컬러 추가 (`--color-primary: #196ee6`, `--color-background-light: #f6f7f8`, `--color-background-dark: #111821` 등), 다크 모드 variant 설정
- **수용 기준**: Tailwind에서 `bg-primary`, `bg-background-light` 등의 유틸리티 클래스 사용 가능
- **NFR**: NFR-02
- [ ] 완료

### T-007 [IMPL] 아이콘 컴포넌트 생성 [P]
- **파일**: `src/shared/ui/icons/index.ts` (신규)
- **작업**: reference.html에서 사용하는 14개 아이콘의 inline SVG 컴포넌트 생성 (`dashboard`, `storefront`, `smart_toy`, `account_tree`, `edit_note`, `bar_chart`, `terminal`, `search`, `notifications`, `chevron_right`, `add`, `help_outline`, `auto_awesome`, `contact_support`)
- **수용 기준**: `import { DashboardIcon } from '@/shared/ui/icons'` 형태로 사용 가능
- [ ] 완료

---

### ✅ CHECKPOINT 2: 디자인 시스템 기반 완료
- [ ] 폰트가 Inter + Noto Sans KR로 변경됨
- [ ] 커스텀 컬러 토큰이 Tailwind에서 사용 가능
- [ ] 다크 모드 전환 시 색상이 올바르게 변경됨
- [ ] 모든 아이콘 컴포넌트가 렌더링됨

---

## Phase 3: 도메인 모델 (US-002, US-004)

> Skill Marketplace 바운디드 컨텍스트의 도메인 모델. TDD 적용.

### T-008 [TEST] Skill 엔티티 + SkillCategory 값 객체 단위 테스트 → CHECKPOINT 1
- **파일**: `src/skill-marketplace/domain/__tests__/Skill.test.ts` (신규)
- **작업**:
  - Skill 엔티티 생성 테스트 (id, name, description, icon, categories)
  - SkillCategory 값 객체 동등성 테스트
  - SkillCategory variant 검증 테스트
- **수용 기준**: 테스트가 실패함 (Red)
- [ ] 완료

### T-009 [IMPL] Skill 엔티티 구현 → T-008
- **파일**: `src/skill-marketplace/domain/entities/Skill.ts` (신규)
- **작업**: `Entity<string>` 확장, 필드: name, description, icon, categories
- **수용 기준**: T-008의 Skill 관련 테스트가 통과함 (Green)
- [ ] 완료

### T-010 [IMPL] SkillCategory 값 객체 구현 [P] → T-008
- **파일**: `src/skill-marketplace/domain/value-objects/SkillCategory.ts` (신규)
- **작업**: `ValueObject` 확장, 필드: name, variant (`'default' | 'primary'`)
- **수용 기준**: T-008의 SkillCategory 관련 테스트가 통과함 (Green)
- [ ] 완료

### T-011 [IMPL] SkillRepository 인터페이스 정의 → T-009
- **파일**: `src/skill-marketplace/domain/repositories/SkillRepository.ts` (신규)
- **작업**: `getRecommended(): Promise<Skill[]>` 메서드 정의
- **수용 기준**: 인터페이스가 Skill 엔티티 타입에 의존하며 컴파일됨
- [ ] 완료

---

### ✅ CHECKPOINT 3: 도메인 모델 완료
- [ ] Skill 엔티티 테스트 통과
- [ ] SkillCategory 값 객체 테스트 통과
- [ ] SkillRepository 인터페이스 정의됨
- [ ] domain 계층에 외부 의존성 없음 (순수 비즈니스 로직)

---

## Phase 4: 애플리케이션 계층 (US-002, US-004)

> 유스케이스와 인프라 구현. TDD 적용.

### T-012 [TEST] GetRecommendedSkillsUseCase 단위 테스트 → CHECKPOINT 3
- **파일**: `src/skill-marketplace/application/__tests__/GetRecommendedSkillsUseCase.test.ts` (신규)
- **작업**: mock SkillRepository를 주입하여 추천 스킬 목록 반환 테스트
- **수용 기준**: 테스트가 실패함 (Red)
- [ ] 완료

### T-013 [IMPL] GetRecommendedSkillsUseCase 구현 → T-012
- **파일**: `src/skill-marketplace/application/GetRecommendedSkillsUseCase.ts` (신규)
- **작업**: SkillRepository를 생성자 주입, `execute()` 메서드에서 `getRecommended()` 호출
- **수용 기준**: T-012 테스트가 통과함 (Green)
- [ ] 완료

### T-014 [IMPL] InMemorySkillRepository 구현 → T-011, T-013
- **파일**: `src/skill-marketplace/infrastructure/InMemorySkillRepository.ts` (신규)
- **작업**: SkillRepository 인터페이스 구현, reference.html 기준 6개 목업 스킬 데이터 반환
- **수용 기준**: `getRecommended()` 호출 시 6개 스킬이 반환됨
- [ ] 완료

---

### ✅ CHECKPOINT 4: 애플리케이션 계층 완료
- [ ] GetRecommendedSkillsUseCase 테스트 통과
- [ ] InMemorySkillRepository가 목업 데이터 반환
- [ ] application 계층이 domain 인터페이스에만 의존

---

## Phase 5: 공유 UI 컴포넌트 (US-002, US-003)

> 대시보드 레이아웃을 구성하는 공유 컴포넌트. 향후 다른 페이지에서도 재사용.

### T-015 [TEST] Sidebar 컴포넌트 테스트 → CHECKPOINT 2
- **파일**: `src/shared/ui/__tests__/Sidebar.test.tsx` (신규)
- **작업**:
  - 메뉴 항목 렌더링 확인 (대시보드, 마켓플레이스, 내 에이전트, 카테고리들)
  - 서비스 로고 표시 확인
  - 에이전트 생성 버튼 존재 확인
  - 도움말 링크 존재 확인
- **수용 기준**: 테스트가 실패함 (Red)
- **FR**: FR-11~FR-16
- [ ] 완료

### T-016 [IMPL] Sidebar 컴포넌트 구현 → T-015, T-007
- **파일**: `src/shared/ui/Sidebar.tsx` (신규)
- **작업**: Client Component (`usePathname` 사용), 서비스 로고, 메인 메뉴/카테고리 그룹, 현재 경로 기반 활성 메뉴 표시, 에이전트 생성 버튼, 도움말 링크
- **수용 기준**: T-015 테스트 통과, 활성 메뉴 시각적 구분
- **FR**: FR-11~FR-16
- [ ] 완료

### T-017 [TEST] Header 컴포넌트 테스트 [P] → CHECKPOINT 2
- **파일**: `src/shared/ui/__tests__/Header.test.tsx` (신규)
- **작업**:
  - 브레드크럼 표시 확인
  - 네비게이션 링크 확인
  - 알림 아이콘 확인
  - 프로필 아바타 확인
- **수용 기준**: 테스트가 실패함 (Red)
- **FR**: FR-17~FR-20
- [ ] 완료

### T-018 [IMPL] Header 컴포넌트 구현 → T-017, T-007
- **파일**: `src/shared/ui/Header.tsx` (신규)
- **작업**: 브레드크럼, 탐색하기/인기 스킬 링크, 알림 아이콘(뱃지), 프로필 아바타. 사용자 정보를 props로 전달
- **수용 기준**: T-017 테스트 통과
- **FR**: FR-17~FR-20
- [ ] 완료

### T-019 [IMPL] DashboardLayout 컴포넌트 구현 → T-016, T-018
- **파일**: `src/shared/ui/DashboardLayout.tsx` (신규)
- **작업**: Sidebar + Header + `children`(메인 콘텐츠 영역) 조합, 반응형 레이아웃
- **수용 기준**: 좌측 사이드바(w-64) + 상단 헤더(h-16) + 메인 콘텐츠 레이아웃 렌더링
- **FR**: FR-08~FR-10
- **NFR**: NFR-03
- [ ] 완료

### T-020 [IMPL] FeedbackFab 컴포넌트 구현 [P] → CHECKPOINT 2
- **파일**: `src/shared/ui/FeedbackFab.tsx` (신규)
- **작업**: 화면 우측 하단 고정, hover 시 "플랫폼 개선 제안하기" 라벨 표시 애니메이션
- **수용 기준**: FAB가 우측 하단에 표시되고, hover 시 라벨 노출
- **FR**: FR-29~FR-30
- [ ] 완료

---

### ✅ CHECKPOINT 5: 공유 UI 완료
- [ ] Sidebar 메뉴 항목 전체 렌더링, 활성 상태 표시
- [ ] Header 브레드크럼 + 프로필 렌더링
- [ ] DashboardLayout에서 Sidebar/Header/Main 조합 정상
- [ ] FeedbackFab hover 애니메이션 동작
- [ ] 다크 모드 적용 확인
- [ ] 반응형 레이아웃 확인 (모바일~데스크탑)

---

## Phase 6: 피처 컴포넌트

### US-001: 비로그인 사용자의 첫 방문

### T-021 [TEST] LandingPage 컴포넌트 테스트 → CHECKPOINT 2
- **파일**: `src/features/root-page/__tests__/LandingPage.test.tsx` (신규)
- **작업**:
  - 서비스명("AI 스킬 허브") 표시 확인
  - 소개 문구 표시 확인
  - 로그인/회원가입 버튼 존재 및 링크 확인
- **수용 기준**: 테스트가 실패함 (Red)
- **FR**: FR-04~FR-07
- [ ] 완료

### T-022 [IMPL] LandingPage 컴포넌트 구현 → T-021
- **파일**: `src/features/root-page/LandingPage.tsx` (신규)
- **작업**: 서버 컴포넌트, 서비스명 + 소개 문구 + 핵심 가치 설명 + 로그인/회원가입 버튼
- **수용 기준**: T-021 테스트 통과
- **FR**: FR-04~FR-07
- [ ] 완료

### US-004: 스킬 검색

### T-023 [TEST] SearchBar 컴포넌트 테스트 → CHECKPOINT 2
- **파일**: `src/features/root-page/__tests__/SearchBar.test.tsx` (신규)
- **작업**:
  - "AI 스킬 탐색하기" 제목 표시 확인
  - 검색 입력 필드 존재 확인
  - 인기 검색어 태그 표시 확인
  - 입력 동작 확인
- **수용 기준**: 테스트가 실패함 (Red)
- **FR**: FR-21~FR-23
- [ ] 완료

### T-024 [IMPL] SearchBar 컴포넌트 구현 → T-023
- **파일**: `src/features/root-page/SearchBar.tsx` (신규)
- **작업**: Client Component, 검색 입력 필드 + 인기 검색어 태그 (목업: "파이썬 스크립트", "PDF 요약기", "회의록 정리")
- **수용 기준**: T-023 테스트 통과
- **FR**: FR-21~FR-23
- [ ] 완료

### US-002: 로그인 사용자의 대시보드

### T-025 [TEST] SkillCard 컴포넌트 테스트 → CHECKPOINT 4
- **파일**: `src/features/root-page/__tests__/SkillCard.test.tsx` (신규)
- **작업**:
  - 아이콘, 이름, 설명, 카테고리 태그 표시 확인
  - 카드 클릭 시 상세 페이지 링크 확인
- **수용 기준**: 테스트가 실패함 (Red)
- **FR**: FR-26~FR-27
- [ ] 완료

### T-026 [IMPL] SkillCard 컴포넌트 구현 → T-025
- **파일**: `src/features/root-page/SkillCard.tsx` (신규)
- **작업**: Skill 엔티티 데이터를 받아 카드 UI 렌더링, Link 컴포넌트로 상세 페이지 연결
- **수용 기준**: T-025 테스트 통과
- **FR**: FR-26~FR-27
- [ ] 완료

### T-027 [IMPL] SkillGrid 컴포넌트 구현 → T-026
- **파일**: `src/features/root-page/SkillGrid.tsx` (신규)
- **작업**: "추천 에이전트" 섹션 제목 + "전체 보기" 링크 + SkillCard 그리드(3열) + "더 많은 결과 보기" 버튼
- **수용 기준**: 6개 카드가 3x2 그리드로 렌더링, 전체 보기 링크 존재
- **FR**: FR-24~FR-25, FR-28
- [ ] 완료

### T-028 [IMPL] DashboardPage 컴포넌트 구현 → T-024, T-027
- **파일**: `src/features/root-page/DashboardPage.tsx` (신규)
- **작업**: SearchBar + SkillGrid를 조합한 대시보드 메인 콘텐츠, GetRecommendedSkillsUseCase로 스킬 데이터 조회
- **수용 기준**: 검색바 + 추천 스킬 그리드가 함께 렌더링됨
- [ ] 완료

---

### ✅ CHECKPOINT 6: 피처 컴포넌트 완료
- [ ] LandingPage: 서비스명, 소개, 로그인/회원가입 버튼 표시
- [ ] SearchBar: 검색 입력 + 인기 검색어 태그 동작
- [ ] SkillCard: 아이콘/이름/설명/카테고리 태그 표시
- [ ] SkillGrid: 3열 그리드 + 전체 보기 + 더보기 버튼
- [ ] DashboardPage: SearchBar + SkillGrid 조합 정상
- [ ] 모든 컴포넌트 테스트 통과 (Green)

---

## Phase 7: 페이지 조립 (US-001, US-002)

### T-029 [IMPL] Root Page 구현 → T-022, T-028, T-019
- **파일**: `src/app/page.tsx` (수정)
- **작업**: 서버 컴포넌트에서 `getUser()`로 인증 확인, 비로그인 → `<LandingPage />`, 로그인 → `<DashboardLayout><DashboardPage /></DashboardLayout>` + `<FeedbackFab />`
- **수용 기준**: 인증 상태에 따라 올바른 페이지 렌더링, FOUC 없음
- **FR**: FR-01~FR-03
- **NFR**: NFR-05
- [ ] 완료

### T-030 [IMPL] Root Layout 메타데이터 업데이트 [P] → T-005
- **파일**: `src/app/layout.tsx` (수정)
- **작업**: 메타데이터 업데이트 (title: "AI 스킬 허브"), `<html lang="ko">` 설정
- **수용 기준**: 브라우저 탭에 "AI 스킬 허브" 표시, lang="ko" 설정됨
- [ ] 완료

---

### ✅ CHECKPOINT 7: 페이지 조립 완료
- [ ] 비로그인 → 랜딩 페이지 표시
- [ ] 로그인 → 대시보드 표시
- [ ] 화면 깜빡임(FOUC) 없음
- [ ] `npm run build` 에러 없음
- [ ] 다크 모드 전체 페이지 동작 확인

---

## Phase 8: E2E 테스트

### T-031 [TEST] 비로그인 시 랜딩 페이지 E2E 테스트 → CHECKPOINT 7
- **파일**: `e2e/root-page.spec.ts` (신규)
- **작업**:
  - `/` 접속 시 랜딩 페이지 표시 확인
  - 서비스명, 로그인/회원가입 버튼 표시 확인
- **수용 기준**: Playwright 테스트 통과
- [ ] 완료

### T-032 [TEST] 로그인 후 대시보드 E2E 테스트 [P] → CHECKPOINT 7
- **파일**: `e2e/root-page.spec.ts` (추가)
- **작업**:
  - 로그인 상태에서 `/` 접속 시 대시보드 표시 확인
  - 사이드바, 헤더, 검색바, 추천 스킬 그리드 표시 확인
- **수용 기준**: Playwright 테스트 통과
- [ ] 완료

---

### ✅ CHECKPOINT 8: 전체 완료
- [ ] 모든 단위 테스트 통과
- [ ] 모든 통합 테스트 통과
- [ ] E2E 테스트 통과
- [ ] `npm run build` 성공
- [ ] Lighthouse 점수 80+ (NFR-04)
- [ ] 페이지 로드 3초 이내 (NFR-01)

---

## 의존성 그래프

```
T-001 (@supabase/ssr 설치)
├── T-002 (서버 클라이언트) ── T-004 (Middleware)
└── T-003 (브라우저 클라이언트) [P]

T-005 (폰트) [P] ── T-030 (Layout 메타데이터) [P]
T-006 (디자인 토큰) [P]
T-007 (아이콘) [P]
  ├── T-016 (Sidebar 구현)
  └── T-018 (Header 구현)

T-008 (도메인 테스트)
├── T-009 (Skill 구현)
│   └── T-011 (SkillRepository 인터페이스)
└── T-010 (SkillCategory 구현) [P]

T-012 (UseCase 테스트) → T-013 (UseCase 구현)
T-011 + T-013 → T-014 (InMemorySkillRepository)

T-015 (Sidebar 테스트) → T-016 (Sidebar 구현) ─┐
T-017 (Header 테스트) → T-018 (Header 구현) ───┤
                                                └→ T-019 (DashboardLayout)

T-021 (Landing 테스트) → T-022 (Landing 구현) ─────────┐
T-023 (Search 테스트) → T-024 (Search 구현) ───────────┤
T-025 (SkillCard 테스트) → T-026 → T-027 → T-028 ─────┤
                                                        ↓
                               T-019 + T-022 + T-028 → T-029 (Root Page)
                                                        ↓
                                        T-031, T-032 (E2E 테스트) [P]
```

---

## 태스크 요약

| Phase | 태스크 수 | TEST | IMPL | CONFIG |
|-------|----------|------|------|--------|
| 1. 인프라 설정 | 4 | 0 | 3 | 1 |
| 2. 디자인 시스템 | 3 | 0 | 1 | 2 |
| 3. 도메인 모델 | 4 | 1 | 3 | 0 |
| 4. 애플리케이션 계층 | 3 | 1 | 2 | 0 |
| 5. 공유 UI | 6 | 2 | 4 | 0 |
| 6. 피처 컴포넌트 | 8 | 3 | 5 | 0 |
| 7. 페이지 조립 | 2 | 0 | 2 | 0 |
| 8. E2E 테스트 | 2 | 2 | 0 | 0 |
| **합계** | **32** | **9** | **20** | **3** |

---

## US ↔ 태스크 매핑

| 유저 스토리 | 관련 태스크 |
|------------|-----------|
| US-001 (비로그인 랜딩) | T-021, T-022, T-029, T-031 |
| US-002 (대시보드) | T-008~T-014, T-019, T-025~T-029, T-032 |
| US-003 (사이드바 네비게이션) | T-015, T-016, T-019 |
| US-004 (스킬 검색) | T-008~T-014, T-023, T-024, T-028 |
