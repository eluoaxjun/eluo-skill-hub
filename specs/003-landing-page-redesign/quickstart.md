# Quickstart: 랜딩페이지 디자인 수정

**Branch**: `003-landing-page-redesign` | **Date**: 2026-03-03

## 변경 파일 요약

| 파일 | 액션 | 설명 |
|------|------|------|
| `src/app/layout.tsx` | 수정 | eluo font 등록, html 클래스에 `eluo.variable` 추가 |
| `src/app/globals.css` | 수정 | `@theme inline`에 `--font-eluo` 토큰 추가 |
| `src/shared/ui/interactive-globe.tsx` | 신규 | Canvas 기반 인터랙티브 3D 글로브 컴포넌트 |
| `src/features/root-page/LandingPage.tsx` | 수정 | 2단 히어로 레이아웃 + 글로브 + eluo 폰트 적용 |
| `src/shared/ui/__tests__/interactive-globe.test.tsx` | 신규 | InteractiveGlobe 단위 테스트 |
| `src/__tests__/e2e/landing-page.spec.ts` | 신규 | 랜딩페이지 E2E 테스트 |

## 외부 의존성

없음 — Canvas API 기반 순수 구현. 신규 npm 패키지 설치 불필요.

## 로컬 개발 시작

```bash
# 1. 브랜치 확인
git checkout 003-landing-page-redesign

# 2. 개발 서버 실행 (이미 설치된 경우)
npm run dev
# → http://localhost:3000 에서 랜딩 페이지 확인

# 3. 타입 체크
npx tsc --noEmit

# 4. 단위 테스트
npm test src/shared/ui/__tests__/interactive-globe.test.tsx

# 5. E2E 테스트 (dev 서버 실행 상태에서)
npx playwright test src/__tests__/e2e/landing-page.spec.ts
```

## 폰트 적용 확인 방법

1. 브라우저에서 http://localhost:3000 접속
2. DevTools → Elements → `<h1>` 선택
3. Computed 탭 → `font-family` 값 확인: `ELUOFACEVF` 포함 여부

## 글로브 인터랙션 확인 방법

1. 랜딩 페이지 히어로 섹션 우측의 글로브 확인
2. 마우스 드래그로 글로브 회전 조작
3. 도시 마커(점 + 레이블)와 연결 아크(곡선) 표시 확인
4. 아크 위 이동하는 점 애니메이션 확인

## 반응형 레이아웃 확인 방법

1. DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. 모바일 뷰(375px): 텍스트 상단, 글로브 하단 수직 배치
3. 태블릿 뷰(768px): 좌우 2단 레이아웃 전환 확인
4. 데스크탑 뷰(1440px): 글로브 460px 크기, 좌측 텍스트와 균형

## 핵심 구현 포인트

### 1. 폰트 변수 충돌 방지
`next/font/local`의 `variable`을 `"--font-eluo-face"`로 설정하여 Tailwind 테마 토큰 `--font-eluo`와 이름 충돌 방지.

### 2. SSR 비활성화
```tsx
// LandingPage.tsx
const InteractiveGlobe = dynamic(
  () => import("@/shared/ui/interactive-globe").then(m => m.InteractiveGlobe),
  { ssr: false }
)
```
Canvas API는 서버에서 실행 불가하므로 반드시 `ssr: false` 옵션 필요.

### 3. Canvas 단위 테스트 패턴
```tsx
// jsdom은 Canvas를 완전 지원하지 않으므로 mock 필요
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    clearRect: jest.fn(), fillRect: jest.fn(), ...
  })
})
```
