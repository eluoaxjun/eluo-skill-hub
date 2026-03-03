# Quickstart: 인증 페이지 성능 측정 및 검증

**Feature**: 인증 페이지 로딩 성능 최적화
**Date**: 2026-03-03

---

## 전제 조건

```bash
node --version   # v20+ 필요
npm --version    # v10+ 권장

# 의존성 설치 (이미 되어 있으면 생략)
npm install
```

---

## 1. 베이스라인 측정 (구현 전)

> **중요**: 최적화 작업을 시작하기 전에 반드시 베이스라인을 기록한다.

### 1-A. Production 빌드 실행

```bash
npm run build
npm run start
# 서버가 http://localhost:3000 에서 실행 중이어야 함
```

### 1-B. Lighthouse CLI로 측정

```bash
# Lighthouse CLI가 없으면 설치
npm install -g lighthouse

# 로그인 페이지 측정
lighthouse http://localhost:3000/login \
  --output json \
  --output-path ./specs/001-optimize-auth-pages/baseline-login.json \
  --throttling-method simulate \
  --preset desktop \
  --only-categories performance \
  --chrome-flags="--headless"

# 회원가입 페이지 측정
lighthouse http://localhost:3000/signup \
  --output json \
  --output-path ./specs/001-optimize-auth-pages/baseline-signup.json \
  --throttling-method simulate \
  --preset desktop \
  --only-categories performance \
  --chrome-flags="--headless"
```

### 1-C. 핵심 지표 추출

```bash
# 로그인 페이지 TTI, FCP, CLS 출력
node -e "
  const r = require('./specs/001-optimize-auth-pages/baseline-login.json');
  const a = r.audits;
  console.log('=== LOGIN BASELINE ===');
  console.log('TTI:', a['interactive']?.displayValue);
  console.log('FCP:', a['first-contentful-paint']?.displayValue);
  console.log('CLS:', a['cumulative-layout-shift']?.displayValue);
  console.log('LCP:', a['largest-contentful-paint']?.displayValue);
"
```

베이스라인 수치를 `data-model.md`의 측정 기준점 레코드에 기입한다.

---

## 2. 개발 서버에서 빠른 확인

```bash
npm run dev
# http://localhost:3000/login 열기
# Chrome DevTools → Network 탭 → "Disable cache" 체크
# Reload → 렌더 블로킹 리소스 확인 (빨간 막대)
```

**확인 포인트**:
- `cdn.jsdelivr.net` 요청이 있는가? (있으면 병목)
- `highlight.js/styles/github.css`가 로드되는가? (있으면 불필요한 CSS)
- DOM Content Loaded 이전에 차단되는 요청이 있는가?

---

## 3. 구현 후 검증

### 3-A. Playwright E2E 성능 테스트 실행

```bash
# Production 빌드 서버가 실행 중인 상태에서
npm run build && npm run start &

# E2E 테스트 실행
npx playwright test tests/e2e/auth-performance.spec.ts

# 전체 E2E 테스트 실행 (기능 회귀 없음 확인)
npx playwright test
```

### 3-B. 개선 후 Lighthouse 재측정

```bash
lighthouse http://localhost:3000/login \
  --output json \
  --output-path ./specs/001-optimize-auth-pages/after-login.json \
  --throttling-method simulate \
  --preset desktop \
  --only-categories performance \
  --chrome-flags="--headless"
```

### 3-C. 개선율 계산

```bash
node -e "
  const before = require('./specs/001-optimize-auth-pages/baseline-login.json');
  const after = require('./specs/001-optimize-auth-pages/after-login.json');
  const bTTI = before.audits['interactive']?.numericValue;
  const aTTI = after.audits['interactive']?.numericValue;
  console.log('Before TTI:', Math.round(bTTI), 'ms');
  console.log('After TTI:', Math.round(aTTI), 'ms');
  console.log('Improvement:', Math.round((bTTI - aTTI) / bTTI * 100) + '%');
"
```

목표: **50% 이상 단축** (SC-001/SC-002)

---

## 4. 성공 기준 체크리스트

구현이 완료되었다고 판단하려면 아래 항목을 모두 통과해야 한다.

- [ ] 로그인 페이지 TTI ≤ 2,000ms (데스크탑, 첫 방문)
- [ ] 회원가입 페이지 TTI ≤ 2,000ms (데스크탑, 첫 방문)
- [ ] 두 페이지 CLS < 0.1
- [ ] `cdn.jsdelivr.net` 폰트 요청 없음 (Network 탭 확인)
- [ ] `highlight.js` CSS가 인증 페이지에서 로드되지 않음
- [ ] 로그인 기능 정상 동작 (기존 계정으로 로그인 성공)
- [ ] 회원가입 기능 정상 동작 (이메일 인증 포함)
- [ ] TypeScript 빌드 오류 없음 (`npm run build` 성공)
- [ ] Playwright E2E 테스트 전체 통과

---

## 5. 롤백 방법

최적화 작업 중 문제가 발생하면:

```bash
# 변경 사항 되돌리기
git checkout src/app/layout.tsx
git checkout src/app/globals.css
git checkout next.config.ts

# 추가한 파일 삭제
git clean -fd src/app/login/loading.tsx
git clean -fd src/app/signup/loading.tsx
git clean -fd src/features/auth/AuthSkeleton.tsx
```
