# Project Constitution

> Eluo Skill Hub의 모든 개발 의사결정의 기준이 되는 헌법 문서.
> 이 문서는 spec, plan, tasks, implementation 전 단계에서 참조된다.

---

## 1. 프로젝트 개요

웹 에이전시의 기획-디자인-퍼블리싱-개발-QA 워크플로우를 자동화하는 플러그인 마켓플레이스.
Claude Code 플러그인(Skill) 시스템 기반으로, 각 직군별 반복 업무를 자동화하는 스킬을 등록·검색·설치·실행할 수 있다.

---

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend Framework | Next.js | App Router 기반 |
| Language | TypeScript | strict 모드 필수 |
| Database | Supabase | MCP 기반 연동 |
| Unit/Integration Test | Jest + React Testing Library | TDD 필수 |
| E2E Test | Playwright | 주요 플로우 커버 |

### 기술 스택 원칙
- 새로운 라이브러리 도입 시 기존 스택과의 호환성을 반드시 검토한다
- 프레임워크가 제공하는 기본 기능을 우선 사용하고, 외부 라이브러리는 최소화한다
- `any` 타입 사용을 금지하며, strict TypeScript를 준수한다

---

## 3. 아키텍처 원칙 (Domain-Driven Development)

### 계층 구조
```
domain → application → infrastructure
```

### 핵심 원칙
- 바운디드 컨텍스트별 모듈 분리
- 3계층 아키텍처: domain → application → infrastructure
- **domain 계층은 외부 의존성 금지** (순수 비즈니스 로직만)
- **Aggregate Root를 통해서만 데이터를 변경**한다
- 컨텍스트 간 통신은 도메인 이벤트로 수행

### 금지 사항
- Aggregate Root를 거치지 않는 직접 데이터 변경 금지
- `any` 타입 사용 금지
- domain 계층에서 infrastructure 의존성 import 금지

---

## 4. 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 엔티티 | PascalCase | `Order`, `OrderItem` |
| 값 객체 | PascalCase | `Money`, `ShippingAddress` |
| 유스케이스 | PascalCase + UseCase 접미사 | `CreateOrderUseCase` |
| 리포지토리 | PascalCase + Repository 접미사 | `OrderRepository` |
| 파일명 (컴포넌트) | PascalCase | `SkillCard.tsx` |
| 파일명 (유틸) | camelCase | `formatDate.ts` |
| 디렉토리 | kebab-case | `skill-marketplace/` |

---

## 5. 코드 품질 기준

### 필수 규칙
- TypeScript strict 모드 활성화
- ESLint + Prettier 설정 준수
- 함수/메서드는 단일 책임 원칙(SRP) 준수
- 매직 넘버 금지 (상수로 추출)
- 중복 코드 최소화 (DRY 원칙)

### 코드 리뷰 기준
- 비즈니스 로직의 정확성
- 아키텍처 원칙 준수 여부
- 네이밍 컨벤션 준수 여부
- 테스트 코드 포함 여부

---

## 6. 테스트 정책

### 방법론: TDD (Test-Driven Development) 필수
1. Red: 실패하는 테스트를 먼저 작성
2. Green: 테스트를 통과하는 최소한의 코드 작성
3. Refactor: 코드 정리 및 리팩토링

### 커버리지 목표: 80% 이상

### 테스트 유형별 기준
| 유형 | 도구 | 대상 | 필수 여부 |
|------|------|------|-----------|
| Unit Test | Jest | domain 계층, 유틸 함수 | 필수 |
| Integration Test | Jest + RTL | application 계층, 컴포넌트 | 필수 |
| E2E Test | Playwright | 주요 사용자 플로우 | 권장 |

### 테스트 작성 원칙
- 모든 domain 로직은 반드시 단위 테스트를 동반한다
- 유스케이스는 통합 테스트로 검증한다
- 테스트는 독립적이며 실행 순서에 의존하지 않는다
- 외부 의존성은 mock/stub으로 대체한다

---

## 7. 보안 요구사항

### 수준: 표준

### 필수 항목
- **인증/인가**: 모든 보호된 엔드포인트에 인증 필수 (Supabase Auth 활용)
- **입력 검증**: 사용자 입력에 대한 기본 유효성 검사 적용
- **시크릿 관리**: 환경변수로 관리, 코드에 하드코딩 금지
- **의존성 보안**: 알려진 취약점이 있는 패키지 사용 금지

### 금지 사항
- 시크릿/API 키를 코드에 직접 삽입 금지
- `eval()` 사용 금지
- 검증되지 않은 사용자 입력의 직접 사용 금지

---

## 8. 성능 기준

### 수준: 표준

| 지표 | 목표 |
|------|------|
| 페이지 초기 로드 | 3초 이내 |
| API 응답 시간 | 500ms 이내 |
| Lighthouse 점수 | 80+ |

### 성능 원칙
- 불필요한 리렌더링 방지 (React.memo, useMemo, useCallback 적절히 활용)
- 이미지 최적화 (Next.js Image 컴포넌트 활용)
- 코드 스플리팅 및 레이지 로딩 적용
- 데이터베이스 쿼리 최적화 (N+1 문제 방지)

---

## 9. 커밋 컨벤션

### 형식
```
<prefix>: <한글 설명>
```

### Prefix (영어)
| Prefix | 용도 |
|--------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 스타일 수정 |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드 프로세스나 툴의 변경 |
| `ci` | CI/CD 관련 변경 |

### 규칙
- prefix는 영어로 작성
- 설명은 한글로 작성

---

## 10. 팀 고유 규칙

- CLAUDE.md에 정의된 아키텍처 원칙과 네이밍 컨벤션을 우선 적용한다
- 모든 코드 변경은 이 Constitution 문서의 원칙에 부합해야 한다
- Constitution 변경 시 팀 합의가 필요하다

---

*최종 업데이트: 2026-03-02*
