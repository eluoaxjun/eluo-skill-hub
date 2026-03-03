# Data Model: 랜딩페이지 디자인 수정

**Branch**: `003-landing-page-redesign` | **Date**: 2026-03-03

> 이 기능은 순수 UI/프레젠테이션 레이어 변경이므로 데이터베이스 스키마나 도메인 엔티티 변경은 없다.
> 아래는 컴포넌트 인터페이스 데이터 모델(Props 타입)과 정적 데이터 구조를 정의한다.

---

## 1. InteractiveGlobe Props

```typescript
interface GlobeProps {
  className?: string;           // 추가 CSS 클래스
  size?: number;                 // 캔버스 크기(px), 기본값: 600
  dotColor?: string;             // 점 색상 (ALPHA 플레이스홀더 포함 rgba 문자열)
  arcColor?: string;             // 아크 색상 (rgba 문자열)
  markerColor?: string;          // 마커 색상 (rgba 문자열)
  autoRotateSpeed?: number;      // 자동 회전 속도 (라디안/프레임), 기본값: 0.002
  connections?: GlobeConnection[]; // 도시 간 연결 목록
  markers?: GlobeMarker[];       // 지도 마커 목록
}

interface GlobeConnection {
  from: [number, number]; // [위도, 경도]
  to: [number, number];   // [위도, 경도]
}

interface GlobeMarker {
  lat: number;
  lng: number;
  label?: string;
}
```

### 기본 마커 데이터

| 도시 | 위도 | 경도 |
|------|------|------|
| San Francisco | 37.78 | -122.42 |
| London | 51.51 | -0.13 |
| Tokyo | 35.68 | 139.69 |
| Sydney | -33.87 | 151.21 |
| Singapore | 1.35 | 103.82 |
| Moscow | 55.76 | 37.62 |
| São Paulo | -23.55 | -46.63 |
| Mexico City | 19.43 | -99.13 |
| Delhi | 28.61 | 77.21 |
| Erbil | 36.19 | 44.01 |

### 기본 연결 데이터

총 9개 도시 간 연결:
- San Francisco ↔ London
- London ↔ Tokyo
- Tokyo ↔ Sydney
- San Francisco ↔ Singapore
- London ↔ Delhi
- San Francisco ↔ São Paulo
- Singapore ↔ Sydney
- Delhi ↔ Erbil
- London ↔ Erbil

---

## 2. 폰트 토큰 모델

```css
/* CSS 변수 흐름 */
next/font/local (ELUOFACEVF.ttf)
  → CSS variable: --font-eluo-face = "<font-family-string>"
  → applied via: eluo.variable className on <html>

@theme inline (globals.css)
  → --font-eluo: var(--font-eluo-face), sans-serif

Tailwind utility
  → font-eluo → font-family: var(--font-eluo)
```

---

## 3. 정적 피처 카드 데이터

기존 `features` 배열은 변경 없이 유지:

```typescript
interface FeatureCard {
  icon: string;    // 이모지 문자
  title: string;   // 기능명 (한국어)
  description: string; // 기능 설명 (한국어)
}
```

| icon | title | description |
|------|-------|-------------|
| 🔍 | 스킬 검색 | 직군별 자동화 스킬을 카테고리로 검색하고 즉시 설치 |
| ⚡ | 원클릭 실행 | Claude Code 플러그인으로 등록된 스킬을 바로 실행 |
| 🛠️ | 스킬 관리 | 관리자가 새 스킬을 등록하고 버전 관리 |

---

## 4. 컴포넌트 내부 상태 모델

InteractiveGlobe는 ref 기반 상태를 사용 (리렌더링 없음):

```typescript
// 회전 상태 (ref)
rotYRef: MutableRefObject<number>  // Y축 회전 각도 (라디안)
rotXRef: MutableRefObject<number>  // X축 회전 각도 (라디안, -1~1 clamp)

// 드래그 상태 (ref)
dragRef: MutableRefObject<{
  active: boolean;
  startX: number;
  startY: number;
  startRotY: number;
  startRotX: number;
}>

// 애니메이션 상태 (ref)
animRef: MutableRefObject<number>  // requestAnimationFrame ID
timeRef: MutableRefObject<number>  // 누적 시간 (아크 애니메이션용)

// 구 점 데이터 (ref)
dotsRef: MutableRefObject<[number, number, number][]>  // 1200개 피보나치 구 좌표
```

> 모든 상태가 `ref`로 관리되므로 React 리렌더링 없이 Canvas에 직접 그림. 이는 60fps 애니메이션 성능에 필수적.
