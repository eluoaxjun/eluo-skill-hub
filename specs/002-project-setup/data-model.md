# Data Model: 프로젝트 환경 세팅

**Phase 1 Output** | Branch: `002-project-setup` | Date: 2026-03-03

이 피처는 데이터베이스 엔티티를 도입하지 않는다.
대신 **디자인 토큰**과 **설정 계약**이 핵심 산출물이다.

---

## Design Token Entities

### BrandColorToken

프로젝트 전체에서 사용되는 브랜드 컬러의 단일 진실 공급원(Single Source of Truth).

| Token Name | CSS Custom Property | Raw Value | Light Mode | Dark Mode |
|-----------|-------------------|-----------|-----------|----------|
| `brand-yellow` | `--color-brand-yellow` | `#FEFE01` | 포인트 강조, 버튼, 배지 | 동일 (브랜드 컬러 불변) |
| `brand-navy` | `--color-brand-navy` | `#00007F` | 주 배경, 헤더, 텍스트 강조 | 동일 (브랜드 컬러 불변) |
| `brand-light` | `--color-brand-light` | `#F0F0F0` | 섹션 배경, 카드 배경 | 동일 (브랜드 컬러 불변) |

**규칙**:
- 브랜드 컬러는 다크 모드에서도 변경하지 않는다 (회사 아이덴티티 고정).
- `--color-brand-*` 값은 `globals.css`의 `@theme inline` 블록에서만 정의한다.
- 컴포넌트에서 헥스 코드를 직접 사용하는 것은 금지된다.

---

### FontToken

| Token Name | CSS Custom Property | Value |
|-----------|-------------------|-------|
| `sans` | `--font-sans` | `var(--font-pretendard), sans-serif` |
| `display` | `--font-display` | `var(--font-pretendard), sans-serif` |

**규칙**:
- `--font-pretendard`는 `next/font/local` API가 `layout.tsx`에서 런타임에 주입한다.
- `globals.css`는 `var(--font-pretendard)`를 참조하되, 직접 폰트 이름을 하드코딩하지 않는다.

---

### FontFileAsset

| 속성 | 값 |
|----|----|
| 파일명 | `PretendardVariable.woff2` |
| 위치 | `src/app/font/PretendardVariable.woff2` |
| 포맷 | WOFF2 (Variable Font) |
| Weight Range | 100–900 |
| Preload | 빌드 타임 자동 (Next.js) |
| Display | `swap` |

---

### ESLintRule

컨스티튜션 원칙 I을 자동 강제하는 린트 규칙 계약.

| Rule ID | Level | 적용 파일 | 목적 |
|--------|-------|---------|-----|
| `@typescript-eslint/no-explicit-any` | `error` | `**/*.ts`, `**/*.tsx` | `any` 타입 완전 차단 |

---

## Configuration File Ownership

| 파일 | 역할 | 이 피처에서 변경 |
|-----|-----|--------------|
| `src/app/globals.css` | 전역 스타일, 브랜드 토큰, Tailwind 테마 | ✅ 브랜드 컬러 추가, CDN 제거 |
| `src/app/layout.tsx` | 앱 루트 레이아웃, 폰트 초기화 | ✅ localFont 등록 |
| `eslint.config.mjs` | 코드 품질 규칙 | ✅ no-explicit-any 추가 |
| `tsconfig.json` | TypeScript 컴파일러 옵션 | ❌ 이미 strict:true |
| `src/app/font/*.woff2` | 로컬 폰트 파일 | ✅ 디렉토리 생성 및 파일 배치 |
| `src/features/root-page/LandingPage.tsx` | 비로그인 랜딩 페이지 | ✅ 브랜드 컬러 적용 |
