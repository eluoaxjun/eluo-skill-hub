---
description: 마크다운 파일을 분석해 스킬 메타데이터를 자동 생성하고 DB에 등록한다
argument-hint: "<category_slug> <path/to/skill.md>"
---

## 스킬 등록 프로세스

$ARGUMENTS에서 첫 번째 인수를 category_slug, 두 번째 인수를 file_path로 파싱한다.
인수가 부족하면 다음 사용법을 안내하고 중단한다:
  사용법: /add-skill <category_slug> <path/to/skill.md>
  예시: /add-skill planning ./my-skill.md

### 1. 파일 검증
- file_path의 파일을 읽는다.
- 파일이 없으면 "파일을 찾을 수 없습니다: <path>" 안내 후 중단.
- .md 확장자가 아니면 ".md 파일만 등록할 수 있습니다." 안내 후 중단.

### 2. 메타데이터 생성
마크다운 내용을 분석하여 생성한다:
- title: 스킬의 목적을 한눈에 알 수 있는 제목, 30자 이내, 한국어
- description: 스킬의 기능과 용도를 설명하는 텍스트, 150자 이내, 한국어

### 3. 카테고리 조회
Supabase MCP로 카테고리 ID를 조회한다:
```sql
SELECT id, name FROM categories WHERE slug = '<category_slug>';
```
결과가 없으면 사용 가능한 카테고리 목록을 출력하고 중단한다:
```sql
SELECT slug, name FROM categories ORDER BY sort_order;
```

### 4. Admin 사용자 조회
Supabase MCP로 admin 역할의 사용자 ID를 조회한다:
```sql
SELECT p.id FROM profiles p
JOIN roles r ON p.role_id = r.id
WHERE r.name = 'admin'
LIMIT 1;
```

### 5. 스킬 등록
Supabase MCP로 skills 테이블에 삽입한다:
```sql
INSERT INTO skills (id, title, description, markdown_content, category_id, author_id, status)
VALUES (
  gen_random_uuid(),
  '<generated_title>',
  '<generated_description>',
  '<full_markdown_content>',
  '<category_uuid>',
  '<admin_user_uuid>',
  'active'
)
RETURNING id, title, description;
```

### 6. 결과 출력
등록 완료 메시지를 출력한다:
```
✅ 스킬 등록 완료
- ID: <uuid>
- 제목: <title>
- 설명: <description>
- 카테고리: <category_name>
```
