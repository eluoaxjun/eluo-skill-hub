# Data Model: 인증 페이지 로딩 성능 최적화

**Phase**: 1 — Design
**Date**: 2026-03-03
**Feature**: [spec.md](./spec.md) | [research.md](./research.md)

---

## 개요

이 기능은 기존 도메인 엔티티를 추가하거나 변경하지 않는다.
성능 최적화는 순수하게 인프라스트럭처·UI 계층 변경으로 구성된다.

데이터 모델 문서는 **성능 측정 지표 모델**을 정의한다.
구현 전후 개선 여부를 객관적으로 판단하기 위한 메트릭 정의다.

---

## 성능 메트릭 모델

### Core Web Vitals (측정 대상)

| 메트릭 | 약어 | 정의 | 측정 방법 |
|--------|------|------|-----------|
| First Contentful Paint | FCP | 브라우저가 첫 콘텐츠(텍스트/이미지)를 화면에 그리는 시간 | `performance.getEntriesByType('paint')` |
| Time to Interactive | TTI | 페이지가 완전히 인터랙션 가능해지는 시간 | Lighthouse CLI |
| Cumulative Layout Shift | CLS | 로드 중 레이아웃 이동의 누적 점수 | Lighthouse CLI |
| Largest Contentful Paint | LCP | 뷰포트에서 가장 큰 콘텐츠 요소가 렌더링되는 시간 | Lighthouse CLI |

### 스펙 요구사항과 메트릭 매핑

| 스펙 요구사항 | 측정 메트릭 | 목표값 | 측정 조건 |
|---------------|-------------|--------|-----------|
| FR-001: 로그인 폼 2초 내 인터랙션 | TTI | ≤ 2,000ms | 데스크탑, 첫 방문, 표준 광대역 |
| FR-002: 회원가입 폼 2초 내 인터랙션 | TTI | ≤ 2,000ms | 데스크탑, 첫 방문, 표준 광대역 |
| FR-003: CLS 0.1 미만 | CLS | < 0.1 | Lighthouse audit |
| FR-004: 페이지 간 전환 1초 내 | Navigation timing | ≤ 1,000ms | Playwright `page.goto()` timing |
| SC-001/002: 50% 로딩 단축 | TTI | ≤ 50% of baseline | baseline 측정 후 비교 |

---

## 측정 기준점 (Baseline) 레코드 구조

구현 착수 전 베이스라인을 기록하기 위한 측정 레코드 형식:

```
페이지: /login | /signup
환경: production build, desktop, Fast 4G throttling, cache disabled
측정 도구: Lighthouse CLI v12+

측정값:
  FCP: ___ ms
  TTI: ___ ms
  LCP: ___ ms
  CLS: ___
  Total Blocking Time: ___ ms

측정일시: YYYY-MM-DD HH:MM
```

> **NOTE**: 실제 수치는 구현 첫 번째 태스크(T001 - 베이스라인 측정)에서 채워진다.

---

## 신규 파일 목록 (도메인 모델 변경 없음)

이 기능에서 생성/수정되는 파일은 모두 인프라스트럭처·UI 계층이다.

| 유형 | 파일 경로 | 변경 내용 |
|------|-----------|-----------|
| 신규 | `src/app/login/loading.tsx` | 로그인 라우트 스켈레톤 UI |
| 신규 | `src/app/signup/loading.tsx` | 회원가입 라우트 스켈레톤 UI |
| 신규 | `src/features/auth/AuthSkeleton.tsx` | 공용 인증 페이지 스켈레톤 컴포넌트 |
| 신규 | `src/fonts/PretendardVariable.woff2` | 로컬 폰트 파일 |
| 수정 | `src/app/layout.tsx` | `next/font/local` 적용, `highlight.js` import 제거 |
| 수정 | `src/app/globals.css` | CDN `@import url()` 제거 |
| 신규 | `tests/e2e/auth-performance.spec.ts` | Playwright 성능 검증 테스트 |

**도메인 계층 변경 없음**: `src/auth/domain/`, `src/auth/application/` 하위 파일은
이 기능에서 일절 수정하지 않는다.
