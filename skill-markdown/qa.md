# QA `v1.0.0`

기능 테스트(TC 자동 생성), WCAG 2.1 AA 접근성 검증, Core Web Vitals 성능 테스트를 통합 실행합니다. 비주얼 리그레션 테스트를 지원합니다.

## 포함 자산

### Skills (4)

| 스킬명 | 설명 |
| :--- | :--- |
| `qa` | QA 전체 파이프라인 — 기능 + 접근성 + 성능 통합 테스트 |
| `qa-functional` | 기능 테스트 — FN 명세 기반 TC 자동 생성, 정상/예외/에러 3단계 검증, 비주얼 리그레션 |
| `qa-accessibility` | 접근성 테스트 — WCAG 2.1 AA 4원칙(인식/운용/이해/견고), 위반 항목별 수정 가이드 |
| `qa-performance` | 성능 테스트 — Core Web Vitals(LCP/FID/CLS), 리소스 최적화, NFR 목표값 검증 |

### Commands (2)

| 커맨드 | 설명 |
| :--- | :--- |
| `/qa:qa-run` | QA 전체 실행 (기능 + 접근성 + 성능) |
| `/qa:qa` | 테스트계획서 생성 |

### Agents (2)

| 에이전트 | 설명 |
| :--- | :--- |
| `qa-orchestrator` | QA 오케스트레이터 — Gate(범위/크로스체크) + Playwright 통합 + 비주얼 리그레션 |
| `qa-reviewer` | QA 검수자 — 크로스 체크 8항목, 채점 기준 8개, 비주얼 리그레션 포함 |

## 설치

```bash
/plugin install qa@eluo-hub
```

## 의존성

| 유형 | 플러그인 | 설명 |
| :--- | :--- | :--- |
| 필수 | [Core](core.md) | 공통 규칙 + PM Router |
| 권장 | [Publish](publish.md) | 퍼블리싱 결과물을 검증 대상으로 사용 |

## 파이프라인 위치

Planning → Design → Publish → **QA**

> QA는 파이프라인의 마지막 단계로, 퍼블리싱 결과물의 품질을 최종 검증합니다.
