# Data Model: 스킬 추가 - AI 제목/설명 자동 생성

- **Feature ID**: 007
- **Updated**: 2026-03-02 (v2.0 - CLI 방식으로 변경)

---

## 1. DB 스키마 변경

### `skills` 테이블 — 컬럼 추가

```sql
ALTER TABLE skills
  ADD COLUMN description text,
  ADD COLUMN markdown_content text;
```

| 컬럼명 | 타입 | Null 허용 | 설명 |
|--------|------|-----------|------|
| `description` | `text` | ✅ | AI 생성 스킬 설명 (150자 이내 권장) |
| `markdown_content` | `text` | ✅ | 마크다운 전체 내용 (CLI 등록 시 직접 저장) |

- 기존 `markdown_file_path` 컬럼은 **하위 호환성을 위해 유지**
- CLI로 등록된 스킬: `markdown_content`에 저장, `markdown_file_path`는 null
- 웹 UI로 기존 등록된 스킬: `markdown_file_path`에 경로 존재, `markdown_content`는 null

---

## 2. 도메인 모델 변경

### `ManagedSkillProps` (변경 후)

```typescript
export interface ManagedSkillProps {
  id: string;
  title: string;
  description: string | null;  // 신규 추가
  categoryId: string;
  markdownFilePath: string | null;
  authorId: string;
  status: SkillStatus;
  createdAt: Date;
}
```

### `ManagedSkillWithCategory` (변경 후)

```typescript
export interface ManagedSkillWithCategory {
  id: string;
  title: string;
  description: string | null;  // 신규 추가
  categoryId: string;
  categoryName: string;
  markdownFilePath: string | null;
  authorId: string;
  status: SkillStatus;
  createdAt: Date;
}
```

---

## 3. `getSkillMarkdown` 조회 전략

```
[요청: markdownFilePath]
  → skills 테이블에서 markdown_content 조회
  → markdown_content 존재 → 반환 ✅
  → markdown_content 없음 → Supabase Storage에서 다운로드 (폴백)
```

---

## 4. Claude Code 스킬 INSERT SQL

```sql
INSERT INTO skills (id, title, description, markdown_content, category_id, author_id, status)
VALUES (
  gen_random_uuid(),
  '생성된 제목',
  '생성된 설명',
  '# 마크다운 전체 내용...',
  'category-uuid',
  'admin-user-uuid',
  'active'
)
RETURNING id, title, description;
```
