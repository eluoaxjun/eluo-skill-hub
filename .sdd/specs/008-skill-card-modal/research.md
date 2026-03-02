# Research: 스킬 카드 팝업 (모달, 북마크, 피드백)

- **Feature ID**: 008
- **Created**: 2026-03-02

---

## 1. 기존 코드베이스 현황

### 1.1 현재 `DashboardPage` 데이터 소스

`InMemorySkillRepository`를 사용 중. DB와 연결되지 않은 하드코딩 목업 데이터.

```typescript
// 현재 DashboardPage.tsx
const repository = new InMemorySkillRepository();
const useCase = new GetRecommendedSkillsUseCase(repository);
const skills = await useCase.execute(categoryName);
```

→ **교체 필요**: `SupabaseSkillRepository` 신규 생성 및 대체.

### 1.2 현재 SkillCard 네비게이션

```typescript
// 현재 SkillCard.tsx
<Link href={`/skills/${skill.id}`}>
```

→ `/skills/[id]` 라우트가 존재하지 않음. 클릭 시 404.
→ **교체 필요**: Link 제거, onClick 핸들러로 모달 오픈.

### 1.3 현재 SkillGrid "전체 보기" 링크

```typescript
<Link href="/marketplace" ...>전체 보기</Link>
```

→ `/marketplace` 라우트 미존재, 003-sidebar-refactor에서도 제거 결정.
→ **제거 필요**.

### 1.4 현재 MyAgentPage

빈 상태 UI만 존재. 북마크 기능 미구현 상태 (003 spec에서 "추후 별도 명세"로 위임).
→ **이번 피처에서 구현**.

### 1.5 현재 Skill 도메인 엔티티

```typescript
class Skill {
  id: string
  name: string
  description: string
  icon: string       // 이모지 직접 할당
  categories: SkillCategory[]
}
```

→ `markdownContent`, `createdAt` 필드 없음. 모달 표시에 필요하여 추가 필요.

### 1.6 현재 DB 스킬 데이터

확인된 실제 데이터:
- `id`: UUID
- `title`: 스킬명
- `description`: AI 생성 설명 (non-null)
- `markdown_content`: 마크다운 전체 내용 (non-null)
- `category_id`: UUID
- `status`: 'active'

→ `icon` 컬럼 없음. 결정적 랜덤 할당 필요.

---

## 2. 기술 패턴 분석

### 2.1 Server Component → Client Component 데이터 전달

Next.js App Router에서 Server Component의 결과를 Client Component에 전달할 때, 클래스 인스턴스는 직렬화되지 않는다.

**문제**: `Skill` 도메인 엔티티(클래스 인스턴스)를 Client Component에 직접 전달 불가.

**해결책**: Server Component에서 plain object `SkillViewModel`로 변환 후 전달.

```typescript
// DashboardPage (Server Component)에서 변환
const viewModels = skills.map(skill => ({
  id: skill.id,
  name: skill.name,
  ...  // Date → ISO string 변환 포함
}));

// SkillCardGrid (Client Component) 수신
function SkillCardGrid({ skills }: { skills: SkillViewModel[] }) { ... }
```

### 2.2 낙관적 업데이트 (북마크 토글)

```typescript
// SkillCardGrid에서 낙관적 업데이트
function handleToggleBookmark(skillId: string) {
  // 1. 즉시 UI 업데이트
  setBookmarkedIds(prev =>
    prev.includes(skillId)
      ? prev.filter(id => id !== skillId)
      : [...prev, skillId]
  );

  // 2. Server Action 실행 (비동기)
  toggleBookmarkAction(skillId)
    .catch(() => {
      // 실패 시 롤백
      setBookmarkedIds(prev =>
        prev.includes(skillId)
          ? prev.filter(id => id !== skillId)
          : [...prev, skillId]
      );
    });
}
```

### 2.3 모달 ESC 키 처리

```typescript
// SkillModal에서 ESC 키 처리
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

### 2.4 북마크 토글 SQL 패턴

```sql
-- toggle: 없으면 INSERT, 있으면 DELETE
-- Supabase JS에서는 별도 SELECT 후 분기 처리
const existing = await client
  .from('bookmarks')
  .select('id')
  .eq('user_id', userId)
  .eq('skill_id', skillId)
  .single();

if (existing.data) {
  await client.from('bookmarks').delete().eq('id', existing.data.id);
  return { isBookmarked: false };
} else {
  await client.from('bookmarks').insert({ user_id: userId, skill_id: skillId });
  return { isBookmarked: true };
}
```

### 2.5 기존 SupabaseCategoryRepository 패턴 재사용

신규 리포지토리들은 `SupabaseCategoryRepository`의 패턴을 따른다:
- Row 타입 interface 명시적 정의
- `toDomain()` 변환 함수 분리
- 에러 시 한국어 메시지와 함께 throw

---

## 3. 마크다운 렌더링 결정

### package.json 확인 필요

```bash
cat package.json | grep react-markdown
```

- **설치 되어 있으면**: `react-markdown` 사용 (Table 플러그인 포함)
- **미설치**: `<pre className="whitespace-pre-wrap text-sm">` 태그 사용

Constitution 원칙 "외부 라이브러리 최소화" 준수 → 미설치 시 설치 생략.

---

## 4. 아이콘 결정적 랜덤 할당

```typescript
// computeSkillIcon.ts
const SKILL_ICONS = [
  '🤖', '✍️', '📊', '🔍', '📧', '🎨',
  '⚡', '📝', '🔧', '🧪', '💡', '🚀'
];

export function computeSkillIcon(id: string): string {
  const sum = id
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SKILL_ICONS[sum % SKILL_ICONS.length];
}
```

UUID 기반이므로 동일 스킬은 항상 동일 아이콘 반환. 페이지 새로고침에도 일관성 유지.

---

## 5. 구현 우선순위 및 리스크

### 우선순위

1. DB 마이그레이션 (블로커)
2. Skill 엔티티 확장 + SupabaseSkillRepository (핵심 기능)
3. SkillCardGrid + SkillModal UI (사용자 가시적 가치)
4. 북마크 도메인 + 인프라 (내 에이전트 탭 활성화)
5. 피드백 도메인 + 인프라

### 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Next.js Server Action 인증 처리 | 중 | createClient()의 세션 기반 user 확인, 실패 시 401 반환 |
| 모달에서 Server Action 호출 시 revalidation | 중 | `revalidatePath('/')`, `revalidatePath('/myagent')` 추가 |
| Skill 엔티티 변경으로 기존 테스트 깨짐 | 저 | InMemorySkillRepository에 null 값 추가로 대응 |
| 직렬화 오류 (Date 타입) | 저 | ViewModel에서 `.toISOString()` 변환 |
