# Implementation Plan: 스킬 카드 팝업 (모달, 북마크, 피드백)

- **Feature ID**: 008
- **Plan Version**: 1.0
- **Created**: 2026-03-02
- **Spec**: `spec.md`

---

## 1. 아키텍처 결정

### 1.1 바운디드 컨텍스트 구성

| BC | 위치 | 역할 |
|----|------|------|
| `skill-marketplace` (확장) | `src/skill-marketplace/` | Skill 도메인 엔티티 확장, SupabaseSkillRepository 신규 |
| `bookmark` (신규) | `src/bookmark/` | 북마크 도메인, 토글/조회 유스케이스, Supabase 인프라 |
| `skill-feedback` (신규) | `src/skill-feedback/` | 피드백 로그 도메인, 제출 유스케이스, Supabase 인프라 |

### 1.2 클라이언트/서버 컴포넌트 경계

```
page.tsx (Server Component)
  └─ DashboardPage (Server Component) ─── Supabase 데이터 페칭
        └─ SkillCardGrid (Client Component) ─── 모달 상태 관리
              ├─ SkillCard (Client Component) ─── 카드 클릭 핸들러
              └─ SkillModal (Client Component) ─── 모달 UI
                    ├─ toggleBookmarkAction (Server Action)
                    └─ submitFeedbackAction (Server Action)
```

- **Server Component**: Skill 목록 + 사용자 북마크 ID 목록을 초기 로드
- **Client Component**: 모달 open/close 상태, 낙관적 북마크 상태 관리
- **Server Action**: 북마크 토글, 피드백 제출 (인증 필수)

### 1.3 아이콘 결정적 랜덤 할당

DB `skills` 테이블에 `icon` 컬럼이 없으므로:
- `src/skill-marketplace/infrastructure/utils/computeSkillIcon.ts` 유틸 생성
- `skill.id`의 charCode 합 % 이모지 배열 길이로 결정적 배정
- SupabaseSkillRepository에서 row → domain 변환 시 적용

### 1.4 SkillRepository 인터페이스 변경 없음

기존 `getRecommended(categoryName?: string): Promise<Skill[]>` 유지.
SupabaseSkillRepository는 `categories` 테이블 join → name으로 필터링.

---

## 2. 변경 파일 목록

### 신규 생성 — Domain

| 파일 | 설명 |
|------|------|
| `src/bookmark/domain/entities/Bookmark.ts` | Bookmark 엔티티 |
| `src/bookmark/domain/repositories/BookmarkRepository.ts` | 리포지토리 인터페이스 |
| `src/skill-feedback/domain/entities/FeedbackLog.ts` | FeedbackLog 엔티티 |
| `src/skill-feedback/domain/repositories/FeedbackLogRepository.ts` | 리포지토리 인터페이스 |

### 신규 생성 — Application

| 파일 | 설명 |
|------|------|
| `src/bookmark/application/ToggleBookmarkUseCase.ts` | 북마크 토글 |
| `src/bookmark/application/GetBookmarkedSkillsUseCase.ts` | 북마크된 스킬 목록 조회 |
| `src/skill-feedback/application/SubmitFeedbackUseCase.ts` | 피드백 제출 |

### 신규 생성 — Infrastructure

| 파일 | 설명 |
|------|------|
| `src/skill-marketplace/infrastructure/SupabaseSkillRepository.ts` | DB 연동 SkillRepository |
| `src/skill-marketplace/infrastructure/utils/computeSkillIcon.ts` | 결정적 이모지 할당 유틸 |
| `src/bookmark/infrastructure/SupabaseBookmarkRepository.ts` | DB 연동 BookmarkRepository |
| `src/skill-feedback/infrastructure/SupabaseFeedbackLogRepository.ts` | DB 연동 FeedbackLogRepository |

### 신규 생성 — Presentation

| 파일 | 설명 |
|------|------|
| `src/features/root-page/SkillCardGrid.tsx` | 클라이언트 - 카드 그리드 + 모달 상태 |
| `src/features/root-page/SkillModal.tsx` | 클라이언트 - 스킬 상세 모달 |
| `src/app/actions/bookmarkActions.ts` | Server Action: 북마크 토글 |
| `src/app/actions/feedbackActions.ts` | Server Action: 피드백 제출 |

### 신규 생성 — Tests

| 파일 | 설명 |
|------|------|
| `src/bookmark/domain/__tests__/Bookmark.test.ts` | Bookmark 엔티티 단위 테스트 |
| `src/bookmark/application/__tests__/ToggleBookmarkUseCase.test.ts` | 유스케이스 단위 테스트 |
| `src/bookmark/application/__tests__/GetBookmarkedSkillsUseCase.test.ts` | 유스케이스 단위 테스트 |
| `src/skill-feedback/domain/__tests__/FeedbackLog.test.ts` | FeedbackLog 엔티티 단위 테스트 |
| `src/skill-feedback/application/__tests__/SubmitFeedbackUseCase.test.ts` | 유스케이스 단위 테스트 |
| `src/features/root-page/__tests__/SkillCardGrid.test.tsx` | 컴포넌트 통합 테스트 |
| `src/features/root-page/__tests__/SkillModal.test.tsx` | 컴포넌트 통합 테스트 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/skill-marketplace/domain/entities/Skill.ts` | `markdownContent: string \| null`, `createdAt: Date` 필드 추가 |
| `src/skill-marketplace/infrastructure/InMemorySkillRepository.ts` | 새 필드 null/Date 값 추가 |
| `src/features/root-page/DashboardPage.tsx` | SupabaseSkillRepository 사용, 북마크 ID 페칭, SkillCardGrid로 교체 |
| `src/features/root-page/SkillGrid.tsx` | "전체 보기" 링크 제거, SkillCardGrid에 통합 (or 삭제) |
| `src/features/root-page/SkillCard.tsx` | Link → button, `isBookmarked` prop, `onClick` 핸들러 추가 |
| `src/features/myagent/MyAgentPage.tsx` | 북마크된 스킬 그리드 표시로 교체 |
| `src/app/myagent/page.tsx` | 북마크+스킬 데이터 페칭 추가 |

---

## 3. 단계별 구현 계획

### Step 1. DB 마이그레이션

`bookmarks` 테이블, `skill_feedback_logs` 테이블, RLS 정책 생성.

### Step 2. Skill 도메인 엔티티 확장

`Skill.ts`에 `markdownContent: string | null`, `createdAt: Date` 추가.
생성자 및 getter 업데이트. `InMemorySkillRepository`에 빈 값 추가.

### Step 3. SupabaseSkillRepository 구현

```typescript
// skills 테이블 JOIN categories
// status = 'active' 필터
// categoryName 있으면 categories.name으로 추가 필터
// computeSkillIcon(id)으로 icon 필드 생성
```

### Step 4. computeSkillIcon 유틸 구현

```typescript
const SKILL_ICONS = ['🤖', '✍️', '📊', '🔍', '📧', '🎨', '⚡', '📝', '🔧', '🧪'];
export function computeSkillIcon(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SKILL_ICONS[sum % SKILL_ICONS.length];
}
```

### Step 5. Bookmark 도메인 + 애플리케이션

- `Bookmark` 엔티티: id, userId, skillId, createdAt
- `BookmarkRepository`: `findByUserId(userId)`, `toggle(userId, skillId)` → `{ isBookmarked: boolean }`
- `ToggleBookmarkUseCase`: toggle 호출 후 상태 반환
- `GetBookmarkedSkillsUseCase`: userId로 북마크된 skill ID 목록 조회

### Step 6. SupabaseBookmarkRepository 구현

```typescript
// findByUserId: SELECT skill_id FROM bookmarks WHERE user_id = $1
// toggle: 존재하면 DELETE, 없으면 INSERT
// RLS 덕분에 user_id 기반 보안 자동 처리
```

### Step 7. FeedbackLog 도메인 + 애플리케이션

- `FeedbackLog` 엔티티: id, userId, skillId, rating(1-5), comment, createdAt
- `FeedbackLogRepository`: `save(log)`
- `SubmitFeedbackUseCase`: 유효성 검사 (rating 1-5) 후 저장

### Step 8. SupabaseFeedbackLogRepository 구현

```typescript
// INSERT INTO skill_feedback_logs (user_id, skill_id, rating, comment)
```

### Step 9. Server Actions

```typescript
// src/app/actions/bookmarkActions.ts
'use server';
export async function toggleBookmarkAction(skillId: string): Promise<{ isBookmarked: boolean }>

// src/app/actions/feedbackActions.ts
'use server';
export async function submitFeedbackAction(
  skillId: string, rating: number, comment: string
): Promise<void>
```

두 Action 모두 `createClient()`로 세션 검증 후 처리.

### Step 10. SkillCard 수정

- `<Link>` → `<button>` 변환
- Props: `skill`, `index`, `isBookmarked`, `onClick: (skill: Skill) => void`
- 북마크 뱃지 추가 (우측 상단 아이콘)

### Step 11. SkillCardGrid 신규 생성 (Client Component)

```typescript
'use client';
interface SkillCardGridProps {
  skills: SkillViewModel[];   // Skill 엔티티 → 직렬화 가능 ViewModel로 변환 후 전달
  initialBookmarkedIds: string[];
}
// 상태: selectedSkill, bookmarkedIds (낙관적 업데이트)
// 모달 open: setSelectedSkill(skill)
// 모달 close: setSelectedSkill(null)
```

> **직렬화**: Server Component → Client Component 경계에서 도메인 엔티티 직접 전달 불가.
> `DashboardPage`에서 `SkillViewModel` 타입으로 변환 후 전달.

### Step 12. SkillModal 신규 생성 (Client Component)

레이아웃: `reference/skill-modal.html` 2단 구조 (좌: 콘텐츠, 우: 액션 패널)

구현 요소:
- 배경 overlay + 모달 컨테이너
- ESC 키 이벤트 핸들러 (`useEffect`)
- 마크다운 렌더링: `react-markdown` (이미 설치 여부 확인 필요) 또는 `<pre>` 태그
- 북마크 버튼: `toggleBookmarkAction` 호출 + 낙관적 상태 업데이트
- 클립보드 복사: `navigator.clipboard.writeText(skill.markdownContent)`
- 피드백 폼: 별점(useState) + textarea + 제출 버튼 → `submitFeedbackAction`
- 폼 제출 상태: idle | submitting | success | error

### Step 13. DashboardPage 수정

```typescript
// SupabaseSkillRepository 사용
const repository = new SupabaseSkillRepository(supabase);
const useCase = new GetRecommendedSkillsUseCase(repository);
const skills = await useCase.execute(categoryName);

// 사용자 북마크 조회
const bookmarkRepository = new SupabaseBookmarkRepository(supabase);
const bookmarkUseCase = new GetBookmarkedSkillsUseCase(bookmarkRepository);
const bookmarkedSkillIds = await bookmarkUseCase.execute(user.id);

// ViewModel 변환 후 SkillCardGrid에 전달
```

### Step 14. SkillGrid 처리

`SkillGrid.tsx`의 "전체 보기" 링크 제거. 그리드 렌더링 책임은 `SkillCardGrid`로 이동.
`SkillGrid.tsx`는 이후 삭제 가능하지만, 이번 단계에서는 `SkillCardGrid`로 교체만 진행.

### Step 15. MyAgentPage 수정

```typescript
// src/app/myagent/page.tsx에서 북마크된 스킬 ID 조회 후 SkillCardGrid에 전달
// MyAgentPage는 SkillCardGrid + 빈 상태 처리만 담당
```

### Step 16. 테스트

TDD 순서:
1. `Bookmark`, `FeedbackLog` 도메인 단위 테스트 먼저 작성
2. `ToggleBookmarkUseCase`, `SubmitFeedbackUseCase` 테스트 작성
3. `SkillCard`, `SkillCardGrid`, `SkillModal` 컴포넌트 테스트 작성
4. 기존 `SkillCard.test.tsx` 업데이트 (Link → button, props 변경)

---

## 4. 의존성 확인

### react-markdown 사용 여부

마크다운 렌더링에 `react-markdown` 라이브러리 필요 여부 확인:

```bash
# package.json 확인 필요
```

미설치 시 선택지:
1. `react-markdown` 설치 (경량, 사이드이펙트 없음)
2. 단순 `<pre className="whitespace-pre-wrap">` 렌더링으로 임시 처리

**결정**: `react-markdown`이 이미 설치되어 있으면 사용, 없으면 `<pre>` 태그 사용 (외부 라이브러리 최소화 원칙).

---

## 5. Constitution 준수 검증

| 원칙 | 준수 여부 | 비고 |
|------|----------|------|
| DDD 3계층 (domain → application → infrastructure) | ✅ | 각 BC별 계층 분리 |
| Aggregate Root 통한 데이터 변경 | ✅ | Bookmark, FeedbackLog 엔티티 통해 변경 |
| domain 계층 외부 의존성 금지 | ✅ | Supabase 의존성은 infrastructure에만 |
| `any` 타입 금지 | ✅ | 모든 Row 타입 명시적 interface 정의 |
| TypeScript strict 모드 | ✅ | 기존 설정 유지 |
| TDD 필수 | ✅ | domain/application 계층 테스트 선행 |
| 커버리지 80% 이상 | ✅ | 신규 BC 전체 테스트 커버 |
| 외부 라이브러리 최소화 | ✅ | react-markdown 미설치 시 <pre> 사용 |
| Supabase Auth 활용 | ✅ | Server Action에서 세션 검증 |
| 컨텍스트 간 도메인 이벤트 통신 | ⚠️ | bookmark ↔ skill-marketplace 간 직접 조회 사용 (이벤트 미적용). 규모상 적절한 트레이드오프. |

> **주의**: `bookmark` BC에서 `skill-marketplace` BC의 `Skill` 엔티티를 직접 참조하지 않도록 한다.
> `GetBookmarkedSkillsUseCase`는 skill_id 목록만 반환하고, 스킬 조회는 `skill-marketplace` BC에서 별도로 처리한다.
