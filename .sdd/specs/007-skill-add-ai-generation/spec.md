# Feature Spec: 스킬 추가 - AI 제목/설명 자동 생성 (Claude Code CLI)

- **Feature ID**: 007
- **Feature Name**: skill-add-ai-generation
- **Status**: Draft
- **Created**: 2026-03-02
- **Updated**: 2026-03-02 (CLI 방식으로 변경)
- **Author**: Jaerin
- **References**: 005-admin-skill-management

---

## 1. 기능 개요 및 목적

Claude Code CLI 스킬을 통해 마크다운 파일을 분석하여 제목(title)과 설명(description)을 자동 생성하고 `skills` DB에 등록한다.
Claude Code가 AI이므로 별도 API 키 없이 파일 내용을 분석해 메타데이터를 생성한다.

어드민 웹 페이지에서는 스킬 파일 업로드 기능을 제거하고, 목록 조회 및 미리보기 기능만 유지한다.

---

## 2. 유저 스토리

### 어드민 사용자

- **As a** 어드민 사용자로서,
  **I want** 터미널에서 `/add-skill <category> <file.md>` 명령을 실행하기를,
  **So that** 마크다운 파일의 내용을 AI가 분석하여 제목/설명과 함께 자동으로 스킬을 등록할 수 있다.

- **As a** 어드민 사용자로서,
  **I want** 등록된 스킬의 제목, 설명, 마크다운 본문을 웹 어드민 페이지에서 확인하기를,
  **So that** 등록된 내용을 검토할 수 있다.

---

## 3. 기능 요구사항

### 3.1 Claude Code 스킬 (`/add-skill`)

1. 인수로 카테고리 슬러그와 마크다운 파일 경로를 받는다.
   - 사용법: `/add-skill <category_slug> <path/to/skill.md>`
2. 지정된 파일이 없거나 `.md` 확장자가 아니면 오류를 안내하고 중단한다.
3. 마크다운 내용을 분석하여 다음을 생성한다:
   - **title**: 스킬의 목적을 한눈에 알 수 있는 제목 (30자 이내, 한국어)
   - **description**: 스킬의 기능과 용도를 설명하는 텍스트 (150자 이내, 한국어)
4. Supabase MCP로 `categories` 테이블에서 카테고리 ID를 조회한다.
   - 해당 슬러그의 카테고리가 없으면 사용 가능한 목록을 보여주고 중단한다.
5. Supabase MCP `execute_sql`로 `skills` 테이블에 삽입한다:
   - `title`, `description`, `markdown_content`, `category_id`, `author_id`, `status`
6. 등록 완료 후 스킬 ID, 제목, 설명, 카테고리명을 출력한다.

### 3.2 어드민 웹 페이지 변경

7. `/admin/skills` 페이지에서 '스킬 추가하기' 버튼을 제거한다.
8. `AddSkillModal` 컴포넌트를 삭제한다.
9. 스킬 목록 테이블과 상세 미리보기 모달은 그대로 유지한다.
10. 마크다운 미리보기는 DB의 `markdown_content` 컬럼에서 직접 읽어 렌더링한다.

### 3.3 DB 스키마 변경

11. `skills` 테이블에 `description text` 컬럼(nullable)을 추가한다.
12. `skills` 테이블에 `markdown_content text` 컬럼(nullable)을 추가한다.
    - 기존 `markdown_file_path`는 하위 호환성을 위해 유지한다.

---

## 4. 비기능 요구사항

- **보안**: `execute_sql`로 직접 삽입하므로 RLS 정책에 따라 admin 사용자 권한이 필요하다.
- **무결성**: 카테고리 슬러그가 유효하지 않으면 삽입을 시도하지 않는다.

---

## 5. 가정 사항

- Claude Code가 실행 중인 환경에서 Supabase MCP가 설정되어 있다.
- 스킬 등록자는 Supabase에 admin 역할을 가진 사용자이다.
- `author_id`는 Supabase에서 admin 역할을 가진 첫 번째 사용자의 ID를 자동 조회한다.

---

## 6. 제약 조건

- API 키, 외부 AI SDK 의존성 추가 없음 (Claude Code 자체가 AI).
- `any` 타입 사용 금지 (constitution 원칙).
- 스킬 데이터 읽기는 기존 `GetAllManagedSkillsUseCase`를 통해 처리한다.

---

## 7. 수용 기준 체크리스트

- [ ] `/add-skill planning my-skill.md` 실행 시 title/description이 자동 생성되어 DB에 저장된다.
- [ ] 존재하지 않는 카테고리 슬러그 입력 시 오류 안내와 사용 가능한 목록이 출력된다.
- [ ] `.md` 이외 파일 지정 시 오류 메시지와 함께 중단된다.
- [ ] 등록 완료 후 스킬 ID, 제목, 설명이 출력된다.
- [ ] `/admin/skills` 페이지에 '스킬 추가하기' 버튼이 없다.
- [ ] `AddSkillModal` 컴포넌트가 삭제되어 있다.
- [ ] 스킬 행 클릭 시 마크다운 미리보기 모달이 정상적으로 열린다.
- [ ] `skills` 테이블에 `description`, `markdown_content` 컬럼이 존재한다.
