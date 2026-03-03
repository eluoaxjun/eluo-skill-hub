# Performance SLO Contract: 인증 페이지

**Version**: 1.0.0
**Date**: 2026-03-03
**Feature**: 인증 페이지 로딩 성능 최적화

---

## 계약 정의

이 문서는 로그인·회원가입 페이지에 적용되는 성능 서비스 수준 목표(SLO)를 정의한다.
구현 후 이 계약을 만족하는지 Playwright E2E 테스트로 자동 검증한다.

---

## 로그인 페이지 (`/login`) SLO

| 메트릭 | 조건 | 목표값 | 비고 |
|--------|------|--------|------|
| TTI (Time to Interactive) | 데스크탑, 첫 방문, 캐시 없음 | ≤ 2,000ms | FR-001 |
| TTI (Time to Interactive) | 모바일 Fast 4G, 첫 방문 | ≤ 4,000ms | FR-001 |
| CLS (Cumulative Layout Shift) | 모든 조건 | < 0.1 | FR-003 |
| 폼 인터랙션 가능 여부 | 페이지 로드 후 | 즉시 입력 가능 | FR-001 |
| 재방문 TTI | 캐시 있음 | ≤ 1,000ms | US1 Scenario 3 |

## 회원가입 페이지 (`/signup`) SLO

| 메트릭 | 조건 | 목표값 | 비고 |
|--------|------|--------|------|
| TTI (Time to Interactive) | 데스크탑, 첫 방문, 캐시 없음 | ≤ 2,000ms | FR-002 |
| TTI (Time to Interactive) | 모바일 Fast 4G, 첫 방문 | ≤ 4,000ms | FR-002 |
| CLS (Cumulative Layout Shift) | 모든 조건 | < 0.1 | FR-003 |
| 폼 인터랙션 가능 여부 | 페이지 로드 후 | 즉시 입력 가능 | FR-002 |

## 페이지 간 전환 SLO

| 전환 | 목표값 | 비고 |
|------|--------|------|
| `/login` → `/signup` 링크 클릭 후 폼 표시 | ≤ 1,000ms | FR-004, US3 |
| `/signup` → `/login` 링크 클릭 후 폼 표시 | ≤ 1,000ms | FR-004, US3 |

## 폼 제출 응답 SLO

| 동작 | 목표값 | 비고 |
|------|--------|------|
| 로그인 제출 후 응답(성공/오류) | ≤ 3,000ms | FR-006 |
| 회원가입 제출 후 응답(성공/오류) | ≤ 3,000ms | FR-006 |

---

## 측정 기준 환경

```
도구: Playwright v1.58+, Lighthouse CLI v12+
빌드: Production (npm run build && npm run start)

데스크탑 조건:
  CPU: 기본 (throttle 없음)
  Network: Fast 4G (40ms RTT, 10Mbps down)

모바일 조건:
  CPU: 4x slowdown
  Network: Fast 4G (40ms RTT, 10Mbps down)

캐시: 첫 방문 = 캐시 비활성화, 재방문 = 브라우저 기본 캐시
```

---

## 계약 위반 조건

다음 중 하나라도 해당되면 PR은 병합될 수 없다:

1. TTI가 데스크탑 기준 2,000ms를 초과하는 경우 (로그인 또는 회원가입)
2. CLS가 0.1을 초과하는 경우
3. 기존 인증 기능(로그인, 회원가입, 이메일 인증)에서 회귀가 발생한 경우
4. TypeScript 빌드 오류가 발생한 경우
