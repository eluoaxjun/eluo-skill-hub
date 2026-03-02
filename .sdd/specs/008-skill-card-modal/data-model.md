# Data Model: 스킬 카드 팝업 (모달, 북마크, 피드백)

- **Feature ID**: 008
- **Created**: 2026-03-02

---

## 1. DB 스키마 추가

### `bookmarks` 테이블 (신규)

```sql
CREATE TABLE bookmarks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id    uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, skill_id)
);

-- RLS 활성화
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 자기 북마크만 읽기
CREATE POLICY "bookmarks_select_own"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- 자기 북마크만 추가
CREATE POLICY "bookmarks_insert_own"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 자기 북마크만 삭제
CREATE POLICY "bookmarks_delete_own"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

| 컬럼명 | 타입 | Null | 설명 |
|--------|------|------|------|
| `id` | `uuid` | NOT NULL | PK |
| `user_id` | `uuid` | NOT NULL | FK → auth.users |
| `skill_id` | `uuid` | NOT NULL | FK → skills |
| `created_at` | `timestamptz` | NOT NULL | 북마크 시각 |

복합 유니크 제약: `(user_id, skill_id)`

---

### `skill_feedback_logs` 테이블 (신규)

```sql
CREATE TABLE skill_feedback_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id    uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  rating      integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text,
  created_at  timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE skill_feedback_logs ENABLE ROW LEVEL SECURITY;

-- 자기 피드백만 읽기
CREATE POLICY "feedback_select_own"
  ON skill_feedback_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 자기 피드백만 추가
CREATE POLICY "feedback_insert_own"
  ON skill_feedback_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

| 컬럼명 | 타입 | Null | 설명 |
|--------|------|------|------|
| `id` | `uuid` | NOT NULL | PK |
| `user_id` | `uuid` | NOT NULL | FK → auth.users |
| `skill_id` | `uuid` | NOT NULL | FK → skills |
| `rating` | `integer` | NOT NULL | 1~5점 (CHECK 제약) |
| `comment` | `text` | NULL | 코멘트 (선택) |
| `created_at` | `timestamptz` | NOT NULL | 제출 시각 |

> 동일 사용자가 동일 스킬에 여러 번 피드백 가능 (unique 제약 없음, 누적 로그)

---

## 2. 도메인 모델

### `Skill` 엔티티 변경 (skill-marketplace BC)

```typescript
// 기존 필드 유지, 신규 필드 추가
export class Skill extends Entity<string> {
  private readonly _name: string;
  private readonly _description: string;
  private readonly _icon: string;           // computeSkillIcon(id)으로 생성
  private readonly _categories: SkillCategory[];
  private readonly _markdownContent: string | null;  // 신규
  private readonly _createdAt: Date;                 // 신규

  // getters...
  get markdownContent(): string | null { ... }
  get createdAt(): Date { ... }
}
```

### `Bookmark` 엔티티 (bookmark BC, 신규)

```typescript
export interface BookmarkProps {
  id: string;
  userId: string;
  skillId: string;
  createdAt: Date;
}

export class Bookmark extends Entity<string> {
  private readonly _userId: string;
  private readonly _skillId: string;
  private readonly _createdAt: Date;

  static create(props: BookmarkProps): Bookmark
  get userId(): string
  get skillId(): string
  get createdAt(): Date
}
```

### `FeedbackLog` 엔티티 (skill-feedback BC, 신규)

```typescript
export interface FeedbackLogProps {
  id: string;
  userId: string;
  skillId: string;
  rating: number;    // 1-5
  comment: string | null;
  createdAt: Date;
}

export class FeedbackLog extends Entity<string> {
  // FeedbackLog.create() - rating 유효성 검사 포함
  // rating이 1-5 범위 밖이면 RangeError 발생
  static create(props: FeedbackLogProps): FeedbackLog
  get rating(): number
  get comment(): string | null
  // ...
}
```

---

## 3. Repository 인터페이스

### `BookmarkRepository` (bookmark BC)

```typescript
export interface BookmarkRepository {
  findSkillIdsByUserId(userId: string): Promise<string[]>;
  toggle(userId: string, skillId: string): Promise<{ isBookmarked: boolean }>;
}
```

### `FeedbackLogRepository` (skill-feedback BC)

```typescript
export interface FeedbackLogRepository {
  save(log: FeedbackLog): Promise<void>;
}
```

### `SkillRepository` (skill-marketplace BC, 변경 없음)

```typescript
export interface SkillRepository {
  getRecommended(categoryName?: string): Promise<Skill[]>;
}
```

---

## 4. UI ViewModel (Client Component 전달용)

Server → Client 경계에서 직렬화 가능한 plain object로 변환.

```typescript
// src/features/root-page/types.ts (신규)
export interface SkillViewModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  categoryName: string;
  markdownContent: string | null;
  createdAt: string;   // Date → ISO string
}
```

DashboardPage에서 변환:
```typescript
const skillViewModels: SkillViewModel[] = skills.map(skill => ({
  id: skill.id,
  name: skill.name,
  description: skill.description,
  icon: skill.icon,
  categoryName: skill.categories[0]?.name ?? '',
  markdownContent: skill.markdownContent,
  createdAt: skill.createdAt.toISOString(),
}));
```

---

## 5. 전체 데이터 흐름

### 대시보드 초기 로드
```
page.tsx (Server)
  ├─ SupabaseSkillRepository.getRecommended(categoryName?)
  │    → SELECT skills JOIN categories WHERE status='active'
  │    → Skill[] (with markdownContent, createdAt, icon computed)
  │
  └─ SupabaseBookmarkRepository.findSkillIdsByUserId(userId)
       → SELECT skill_id FROM bookmarks WHERE user_id = $1
       → string[]

  → SkillCardGrid({ skills: SkillViewModel[], initialBookmarkedIds: string[] })
```

### 북마크 토글
```
SkillModal (Client) → toggleBookmarkAction(skillId) (Server Action)
  → SupabaseBookmarkRepository.toggle(userId, skillId)
  → INSERT or DELETE bookmarks
  → { isBookmarked: boolean }
  → SkillCardGrid 낙관적 상태 갱신
```

### 피드백 제출
```
SkillModal (Client) → submitFeedbackAction(skillId, rating, comment) (Server Action)
  → SubmitFeedbackUseCase.execute(userId, skillId, rating, comment)
  → FeedbackLog.create({...}) → 유효성 검사
  → SupabaseFeedbackLogRepository.save(feedbackLog)
  → INSERT skill_feedback_logs
  → 성공 반환
```

### 내 에이전트 페이지
```
myagent/page.tsx (Server)
  ├─ SupabaseBookmarkRepository.findSkillIdsByUserId(userId) → string[]
  └─ SupabaseSkillRepository.getByIds(skillIds) → Skill[]  (또는 getRecommended 후 필터링)

  → SkillCardGrid({ skills, initialBookmarkedIds })
```

> `getByIds` 메서드 추가 또는 `getRecommended()`로 전체 조회 후 클라이언트 필터링.
> 스킬 수가 적으므로 전체 조회 후 필터링이 단순하고 효율적.
