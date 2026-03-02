# Implementation Plan: 스킬 추가 - AI 제목/설명 자동 생성 (Claude Code CLI)

- **Feature ID**: 007
- **Plan Version**: 2.0
- **Created**: 2026-03-02
- **Updated**: 2026-03-02 (v1.0 API Route → v2.0 Claude Code CLI로 변경)

---

## 1. 변경 범위 요약

| 항목 | v1.0 (폐기) | v2.0 (채택) |
|------|------------|------------|
| AI 생성 방식 | Anthropic API Key + API Route | Claude Code CLI (Claude 자체가 AI) |
| 스킬 등록 주체 | 웹 UI (어드민 페이지) | Claude Code 스킬 (`/add-skill`) |
| 마크다운 저장 | Supabase Storage | DB `markdown_content` 컬럼 |
| 외부 의존성 추가 | `@anthropic-ai/sdk` | 없음 |

---

## 2. 아키텍처 결정

### Claude Code 스킬 방식의 장점
- API 키 불필요 — Claude Code 자체가 AI이므로 분석을 직접 수행
- Supabase MCP로 DB 직접 삽입 — 별도 서버 엔드포인트 불필요
- 단순: 스킬 정의 파일 1개로 전체 흐름 구현

### 마크다운 저장 위치 변경
기존 `markdown_file_path`(Supabase Storage) → `markdown_content`(DB 텍스트 컬럼)
- CLI에서 Supabase MCP는 `execute_sql`만 가능 (Storage upload MCP 없음)
- DB 컬럼 저장이 CLI 방식에 적합
- 기존 `markdown_file_path` 컬럼은 하위 호환성을 위해 유지

### 폼 제출 흐름 (신규)
```
[터미널] /add-skill planning my-skill.md
  → Claude가 파일 읽기
  → 제목/설명 자동 생성 (Claude 자체 분석)
  → Supabase MCP: categories에서 category_id 조회
  → Supabase MCP: skills 테이블에 INSERT
  → 결과 출력
```

---

## 3. 변경 파일 목록

### 신규 생성
| 파일 | 설명 |
|------|------|
| `.claude/commands/add-skill.md` | Claude Code 스킬 정의 |

### 수정
| 파일 | 변경 내용 |
|------|-----------|
| `src/skill-marketplace/domain/entities/ManagedSkill.ts` | `description` 필드 추가 |
| `src/skill-marketplace/domain/repositories/ManagedSkillRepository.ts` | `ManagedSkillWithCategory`에 `description` 추가 |
| `src/skill-marketplace/infrastructure/SupabaseManagedSkillRepository.ts` | `findAll()`에 `description` 추가 |
| `src/features/admin/AdminSkillsPage.tsx` | '스킬 추가하기' 버튼·모달 제거 |
| `src/app/admin/skills/page.tsx` | `categories` fetch, `createSkill` import 제거 |
| `src/app/admin/skills/actions.ts` | `createSkill`, `getCategories` 제거. `getSkillMarkdown`을 DB 우선으로 변경 |

### 삭제
| 파일 | 이유 |
|------|------|
| `src/features/admin/AddSkillModal.tsx` | 웹 UI 업로드 기능 제거 |
| `src/features/admin/__tests__/AddSkillModal.test.tsx` | 위와 동일 |

### DB Migration
```sql
ALTER TABLE skills
  ADD COLUMN description text,
  ADD COLUMN markdown_content text;
```

---

## 4. 단계별 구현 계획

### Step 1. DB 마이그레이션
`skills` 테이블에 `description text`, `markdown_content text` 컬럼 추가.

### Step 2. Claude Code 스킬 정의 (`.claude/commands/add-skill.md`)
```markdown
---
description: 마크다운 파일을 분석해 스킬 메타데이터를 자동 생성하고 DB에 등록한다
argument-hint: "<category_slug> <path/to/skill.md>"
---

## 스킬 등록 프로세스

1. $ARGUMENTS에서 category_slug, file_path 파싱
2. 파일 읽기 — .md 아니면 오류 안내 후 중단
3. 마크다운 내용 분석:
   - title: 30자 이내 한국어 제목
   - description: 150자 이내 한국어 설명
4. Supabase MCP로 category_id 조회:
   SELECT id, name FROM categories WHERE slug = '<slug>';
5. Supabase MCP로 admin user_id 조회:
   SELECT id FROM profiles p JOIN roles r ON p.role_id = r.id WHERE r.name = 'admin' LIMIT 1;
6. Supabase MCP로 INSERT:
   INSERT INTO skills (id, title, description, markdown_content, category_id, author_id, status)
   VALUES (gen_random_uuid(), ..., 'active');
7. 등록 결과 출력
```

### Step 3. 도메인 계층 — `ManagedSkill`에 `description` 추가
- `ManagedSkillProps`에 `description: string | null` 추가
- getter 추가

### Step 4. 리포지토리 포트 — `ManagedSkillWithCategory`에 `description` 추가
- `findAll()` 반환 타입에 `description: string | null` 추가

### Step 5. 인프라 계층 — `SupabaseManagedSkillRepository.findAll()` 업데이트
- SELECT에 `description` 포함
- 결과 매핑에 `description` 포함

### Step 6. 어드민 페이지 UI 정리
- `AdminSkillsPage.tsx`: 업로드 버튼·모달·관련 state/handler 제거
- `AdminSkillsPage.test.tsx`: 업로드 관련 테스트 제거, 나머지 유지
- `page.tsx`: `categories` 조회, `createSkill` import 제거
- `actions.ts`: `createSkill`, `getCategories` 제거. `getSkillMarkdown`을 `markdown_content` 우선으로 수정

### Step 7. AddSkillModal 삭제
- `AddSkillModal.tsx` 파일 삭제
- `AddSkillModal.test.tsx` 파일 삭제

---

## 5. `getSkillMarkdown` 변경 방향

기존: Supabase Storage에서 다운로드
변경: DB의 `markdown_content` 컬럼을 먼저 조회, 없으면 기존 Storage 다운로드로 폴백

```typescript
// 변경 후 흐름
const { data } = await supabase
  .from('skills')
  .select('markdown_content')
  .eq('markdown_file_path', markdownFilePath)
  .single();

if (data?.markdown_content) {
  return { content: data.markdown_content };
}
// fallback: Storage download (기존 코드)
```

---

## 6. 테스트 계획

| 테스트 대상 | 방식 | 내용 |
|------------|------|------|
| `ManagedSkill` 엔티티 | Unit (Jest) | `description` getter 테스트 |
| `AdminSkillsPage` | Component (RTL) | 업로드 버튼 없음 확인, 목록/미리보기 유지 확인 |
