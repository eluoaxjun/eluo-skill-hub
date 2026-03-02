# Implementation Plan: 001-root-page

> **Date**: 2026-03-02
> **Spec**: `.sdd/specs/001-root-page/spec.md`
> **Research**: `.sdd/specs/001-root-page/research.md`
> **Data Model**: `.sdd/specs/001-root-page/data-model.md`

---

## 1. 구현 개요

루트 페이지(`/`)를 인증 상태에 따라 랜딩 페이지 또는 대시보드로 분기하여 렌더링한다.
서버 컴포넌트에서 인증을 확인하여 FOUC를 방지하고, DDD 아키텍처 원칙을 준수한다.

---

## 2. 기술 스택 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| 인증 | `@supabase/ssr` + Server Component `getUser()` | NFR-05 FOUC 방지, Supabase 공식 권장 |
| 라우팅 | 단일 `page.tsx` 조건부 렌더링 | spec "완전히 다른 페이지" + URL 유지 |
| 아이콘 | Inline SVG 컴포넌트 | Constitution "외부 라이브러리 최소화" |
| 폰트 | Inter + Noto Sans KR (`next/font/google`) | reference.html 일치 |
| 다크 모드 | Tailwind `dark:` class 기반 | reference.html 일치 |
| 스타일링 | Tailwind CSS v4 | 제약조건 §4 |

---

## 3. 디렉토리 구조

```
src/
├── app/
│   ├── globals.css                    # 디자인 토큰 추가 (primary, background 등)
│   ├── layout.tsx                     # 루트 레이아웃 (폰트 변경, 다크모드 지원)
│   └── page.tsx                       # 서버 컴포넌트: auth 확인 → 분기 렌더링
│
├── shared/
│   ├── domain/                        # (기존 유지)
│   │   ├── events/DomainEvent.ts
│   │   └── types/
│   │       ├── Entity.ts
│   │       └── ValueObject.ts
│   ├── infrastructure/
│   │   └── supabase/
│   │       ├── client.ts              # 브라우저 클라이언트 (수정: @supabase/ssr 사용)
│   │       └── server.ts              # 서버 클라이언트 (신규)
│   └── ui/
│       ├── icons/                     # SVG 아이콘 컴포넌트들 (신규)
│       │   └── index.ts
│       ├── DashboardLayout.tsx        # 대시보드 레이아웃 (sidebar + header + main) (신규)
│       ├── Sidebar.tsx                # 사이드바 (신규)
│       ├── Header.tsx                 # 헤더 (신규)
│       └── FeedbackFab.tsx            # 플로팅 액션 버튼 (신규)
│
├── skill-marketplace/                 # 바운디드 컨텍스트 (신규)
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Skill.ts              # Skill 엔티티
│   │   └── value-objects/
│   │       └── SkillCategory.ts      # SkillCategory 값 객체
│   ├── application/
│   │   └── GetRecommendedSkillsUseCase.ts  # 추천 스킬 조회 유스케이스
│   └── infrastructure/
│       └── InMemorySkillRepository.ts # 목업 데이터 리포지토리
│
├── middleware.ts                       # Supabase Auth 세션 갱신 (신규)
│
└── features/
    └── root-page/                     # 루트 페이지 피처 컴포넌트 (신규)
        ├── LandingPage.tsx            # 비로그인 랜딩 페이지
        ├── DashboardPage.tsx          # 로그인 대시보드 메인 콘텐츠
        ├── SearchBar.tsx              # 스킬 검색바
        ├── SkillCard.tsx              # 스킬 카드
        └── SkillGrid.tsx              # 스킬 카드 그리드
```

---

## 4. 구현 단계

### Phase 1: 인프라 설정

#### 1-1. `@supabase/ssr` 설치
```bash
npm install @supabase/ssr
```

#### 1-2. Supabase 서버 클라이언트 생성
- **파일**: `src/shared/infrastructure/supabase/server.ts`
- `createServerClient` from `@supabase/ssr` 사용
- `cookies()` from `next/headers`로 쿠키 관리

#### 1-3. Supabase 브라우저 클라이언트 수정
- **파일**: `src/shared/infrastructure/supabase/client.ts`
- `createClient` → `createBrowserClient` from `@supabase/ssr`로 변경

#### 1-4. Middleware 생성
- **파일**: `src/middleware.ts`
- Supabase Auth 세션 갱신 처리
- `matcher` 설정으로 정적 에셋 제외

### Phase 2: 디자인 시스템 기반

#### 2-1. 폰트 변경
- **파일**: `src/app/layout.tsx`
- Geist → Inter + Noto Sans KR로 교체
- `lang="ko"` 설정

#### 2-2. 디자인 토큰 추가
- **파일**: `src/app/globals.css`
- `@theme inline` 블록에 커스텀 컬러 추가
  - `--color-primary: #196ee6`
  - `--color-background-light: #f6f7f8`
  - `--color-background-dark: #111821`
- 다크 모드 variant 설정

#### 2-3. 아이콘 컴포넌트 생성
- **파일**: `src/shared/ui/icons/index.ts`
- reference.html에서 사용하는 아이콘들의 SVG 컴포넌트
- 필요한 아이콘: `dashboard`, `storefront`, `smart_toy`, `account_tree`, `edit_note`, `bar_chart`, `terminal`, `search`, `notifications`, `chevron_right`, `add`, `help_outline`, `auto_awesome`, `contact_support`

### Phase 3: 도메인 모델

#### 3-1. Skill 엔티티
- **파일**: `src/skill-marketplace/domain/entities/Skill.ts`
- `Entity<string>` 확장
- 필드: name, description, icon, categories

#### 3-2. SkillCategory 값 객체
- **파일**: `src/skill-marketplace/domain/value-objects/SkillCategory.ts`
- `ValueObject` 확장
- 필드: name, variant

#### 3-3. SkillRepository 인터페이스
- **파일**: `src/skill-marketplace/domain/repositories/SkillRepository.ts`
- `getRecommended(): Promise<Skill[]>` 메서드

### Phase 4: 애플리케이션 계층

#### 4-1. GetRecommendedSkillsUseCase
- **파일**: `src/skill-marketplace/application/GetRecommendedSkillsUseCase.ts`
- `SkillRepository`를 주입받아 추천 스킬 목록 반환

#### 4-2. InMemorySkillRepository
- **파일**: `src/skill-marketplace/infrastructure/InMemorySkillRepository.ts`
- reference.html의 6개 스킬을 목업 데이터로 반환

### Phase 5: 공유 UI 컴포넌트

#### 5-1. Sidebar
- **파일**: `src/shared/ui/Sidebar.tsx`
- FR-11~16 구현
- 서비스 로고, 메인 메뉴, 카테고리, 에이전트 생성 버튼, 도움말
- 현재 경로 기반 활성 메뉴 표시 (pathname 비교)
- Client Component (`usePathname` 사용)

#### 5-2. Header
- **파일**: `src/shared/ui/Header.tsx`
- FR-17~20 구현
- 브레드크럼, 네비게이션 링크, 알림 아이콘, 프로필 아바타
- 사용자 정보를 props로 전달

#### 5-3. DashboardLayout
- **파일**: `src/shared/ui/DashboardLayout.tsx`
- 사이드바 + 헤더 + 메인 콘텐츠 영역 조합
- `children`으로 메인 콘텐츠를 받음
- 향후 다른 인증 필요 페이지에서 재사용

#### 5-4. FeedbackFab
- **파일**: `src/shared/ui/FeedbackFab.tsx`
- FR-29~30 구현
- hover 시 라벨 표시 애니메이션

### Phase 6: 피처 컴포넌트

#### 6-1. LandingPage
- **파일**: `src/features/root-page/LandingPage.tsx`
- FR-04~07 구현
- 서비스명, 소개 문구, 로그인/회원가입 버튼
- 서버 컴포넌트 (상호작용 불필요)

#### 6-2. SearchBar
- **파일**: `src/features/root-page/SearchBar.tsx`
- FR-21~23 구현
- 검색 입력 필드 + 인기 검색어 태그
- Client Component (입력 처리)

#### 6-3. SkillCard
- **파일**: `src/features/root-page/SkillCard.tsx`
- FR-26~27 구현
- 개별 스킬 카드 (아이콘, 이름, 설명, 카테고리 태그)
- Link 컴포넌트로 상세 페이지 연결

#### 6-4. SkillGrid
- **파일**: `src/features/root-page/SkillGrid.tsx`
- FR-24~25, 28 구현
- 추천 스킬 카드 그리드 + "전체 보기" 링크 + "더 많은 결과 보기" 버튼

#### 6-5. DashboardPage
- **파일**: `src/features/root-page/DashboardPage.tsx`
- SearchBar + SkillGrid를 조합한 대시보드 메인 콘텐츠

### Phase 7: 페이지 조립

#### 7-1. Root Page
- **파일**: `src/app/page.tsx`
- 서버 컴포넌트로 구현
- `getUser()`로 인증 확인
- 비로그인 → `<LandingPage />`
- 로그인 → `<DashboardLayout><DashboardPage /></DashboardLayout>`
- FR-01~03 구현

#### 7-2. Root Layout 업데이트
- **파일**: `src/app/layout.tsx`
- 메타데이터 업데이트 (title: "AI 스킬 허브")
- 폰트 적용
- `<html lang="ko">` 설정

### Phase 8: 테스트

#### 8-1. 도메인 단위 테스트
- Skill 엔티티 생성/검증
- SkillCategory 값 객체 동등성
- GetRecommendedSkillsUseCase 동작

#### 8-2. 컴포넌트 통합 테스트 (Jest + RTL)
- LandingPage 렌더링 및 버튼 존재 확인
- SkillCard 렌더링 및 데이터 표시 확인
- Sidebar 메뉴 항목 렌더링 확인
- SearchBar 입력 동작 확인

#### 8-3. E2E 테스트 (Playwright, 권장)
- 비로그인 시 랜딩 페이지 표시 확인
- 로그인 후 대시보드 표시 확인

---

## 5. 요구사항 ↔ 구현 매핑

| 요구사항 | 구현 파일 | Phase |
|---------|----------|-------|
| FR-01~03 (인증 라우팅) | `page.tsx`, `server.ts`, `middleware.ts` | 1, 7 |
| FR-04~07 (랜딩) | `LandingPage.tsx` | 6 |
| FR-08~10 (레이아웃) | `DashboardLayout.tsx` | 5 |
| FR-11~16 (사이드바) | `Sidebar.tsx` | 5 |
| FR-17~20 (헤더) | `Header.tsx` | 5 |
| FR-21~23 (검색) | `SearchBar.tsx` | 6 |
| FR-24~28 (추천 스킬) | `SkillCard.tsx`, `SkillGrid.tsx` | 6 |
| FR-29~30 (FAB) | `FeedbackFab.tsx` | 5 |
| NFR-01 (로드 3초) | 서버 컴포넌트, 코드 스플리팅 | 전체 |
| NFR-02 (다크 모드) | `globals.css`, `dark:` classes | 2 |
| NFR-03 (반응형) | Tailwind responsive classes | 5, 6 |
| NFR-05 (FOUC 방지) | 서버 `getUser()` | 1, 7 |

---

## 6. Constitution 준수 검증

| Constitution 원칙 | 준수 여부 | 설명 |
|-------------------|----------|------|
| §2 기술 스택 (Next.js, TS, Supabase) | ✅ | App Router + `@supabase/ssr` 사용 |
| §2 외부 라이브러리 최소화 | ✅ | `@supabase/ssr`만 추가 (Supabase 공식) |
| §2 `any` 타입 금지 | ✅ | 모든 타입 명시적 정의 |
| §3 DDD 3계층 (domain → app → infra) | ✅ | skill-marketplace 컨텍스트에 적용 |
| §3 도메인 외부 의존성 금지 | ✅ | Skill, SkillCategory는 순수 타입 |
| §3 Aggregate Root 통한 변경 | ✅ | 현재 단계는 읽기 전용 |
| §3 바운디드 컨텍스트 분리 | ✅ | skill-marketplace 독립 모듈 |
| §4 네이밍 컨벤션 | ✅ | PascalCase 엔티티/컴포넌트, kebab-case 디렉토리 |
| §5 SRP | ✅ | 컴포넌트별 단일 책임 |
| §6 TDD | ✅ | Phase 8에서 테스트 작성 |
| §7 인증 필수 | ✅ | 서버 사이드 인증 확인 |
| §7 시크릿 환경변수 | ✅ | `NEXT_PUBLIC_SUPABASE_URL` 등 환경변수 사용 |
| §8 성능 (3초, Lighthouse 80+) | ✅ | 서버 컴포넌트 + 코드 스플리팅 |

### 위반 사항: 없음

---

## 7. 의존성 관계

```
Phase 1 (인프라)
    ↓
Phase 2 (디자인 시스템)
    ↓
Phase 3 (도메인 모델)  →  Phase 4 (애플리케이션)
    ↓                        ↓
Phase 5 (공유 UI)     →  Phase 6 (피처 컴포넌트)
                              ↓
                        Phase 7 (페이지 조립)
                              ↓
                        Phase 8 (테스트)
```

---

## 8. 리스크 및 주의사항

| 리스크 | 대응 |
|--------|------|
| Supabase Auth 미설정 시 대시보드 테스트 불가 | 목업 인증 모드 또는 Supabase 프로젝트 설정 선행 |
| Tailwind v4 `@theme` 디자인 토큰 호환성 | reference.html의 Tailwind v3 설정을 v4 `@theme` 문법으로 변환 확인 |
| Material Symbols → SVG 변환 작업량 | 14개 아이콘으로 제한, 필요 시 점진적 추가 |
| Next.js 16 + `@supabase/ssr` 호환성 | 최신 버전 호환 여부 사전 확인 |
