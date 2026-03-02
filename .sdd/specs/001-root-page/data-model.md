# Data Model: 001-root-page

> **Date**: 2026-03-02

---

## 1. 개요

루트 페이지 기능에 필요한 데이터 모델을 정의한다.
현재 단계에서는 목업 데이터를 사용하되, 향후 DB 연동을 위한 도메인 모델 구조를 설계한다.

---

## 2. 바운디드 컨텍스트

이 기능은 다음 바운디드 컨텍스트에 걸쳐 있다:

| 컨텍스트 | 역할 | 이 기능에서의 사용 |
|----------|------|-------------------|
| **Auth** (외부) | 사용자 인증/인가 | Supabase Auth에서 제공, 별도 도메인 모델 불필요 |
| **Skill Marketplace** | 스킬 등록/탐색/관리 | 추천 스킬 목록 조회 |

---

## 3. Skill Marketplace 컨텍스트 도메인 모델

### 3.1 Skill (Entity — Aggregate Root)

스킬 마켓플레이스의 핵심 엔티티. 루트 페이지에서는 조회 전용으로 사용.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | `string` | 고유 식별자 |
| name | `string` | 스킬 이름 |
| description | `string` | 스킬 설명 |
| icon | `string` | 아이콘 (이모지 또는 이미지 URL) |
| categories | `SkillCategory[]` | 소속 카테고리 목록 |

### 3.2 SkillCategory (Value Object)

스킬에 부착되는 카테고리 태그.

| 필드 | 타입 | 설명 |
|------|------|------|
| name | `string` | 카테고리명 (예: "코딩 지원", "업무 자동화") |
| variant | `'default' \| 'primary'` | 표시 스타일 |

### 3.3 NavigationItem (Value Object)

사이드바 네비게이션 항목. UI 설정 데이터로, 도메인 로직보다 UI 구성에 가깝다.

| 필드 | 타입 | 설명 |
|------|------|------|
| label | `string` | 메뉴 표시명 |
| href | `string` | 이동 경로 |
| iconName | `string` | 아이콘 식별자 |

### 3.4 NavigationGroup (Value Object)

네비게이션 그룹 (메인, 카테고리 등).

| 필드 | 타입 | 설명 |
|------|------|------|
| label | `string` | 그룹 표시명 |
| items | `NavigationItem[]` | 그룹 내 메뉴 항목 |

---

## 4. 인증 사용자 정보

Supabase Auth의 `User` 객체에서 필요한 필드:

| 필드 | 타입 | 설명 |
|------|------|------|
| id | `string` | 사용자 고유 ID |
| email | `string` | 이메일 |
| user_metadata.avatar_url | `string?` | 프로필 이미지 URL |
| user_metadata.full_name | `string?` | 표시 이름 |

별도 도메인 엔티티를 만들지 않고, Supabase Auth User 타입을 직접 사용한다.
향후 사용자 프로필 기능이 추가되면 별도 컨텍스트로 분리.

---

## 5. 데이터베이스 테이블 (향후)

현재 단계에서는 목업 데이터를 사용하지만, 향후 필요한 테이블 구조를 미리 정의한다.

### skills 테이블

```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### skill_categories 테이블

```sql
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);
```

### skill_category_relations 테이블 (다대다)

```sql
CREATE TABLE skill_category_relations (
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  category_id UUID REFERENCES skill_categories(id) ON DELETE CASCADE,
  variant TEXT NOT NULL DEFAULT 'default' CHECK (variant IN ('default', 'primary')),
  PRIMARY KEY (skill_id, category_id)
);
```

> **참고**: 이 테이블들은 이번 구현에서는 생성하지 않는다. 목업 데이터로 먼저 구현하고, 스킬 등록/관리 기능 구현 시 마이그레이션한다.

---

## 6. 목업 데이터 구조

초기 구현에서 사용할 하드코딩 목업 데이터:

```typescript
// 추천 스킬 목업 (6개, reference.html 기준)
const MOCK_RECOMMENDED_SKILLS: Skill[] = [
  { id: "1", name: "코드 오디터 프로", description: "JS 및 파이썬 코드베이스를 위한...", icon: "🤖", categories: [...] },
  { id: "2", name: "보고서 초안 생성기", ... },
  { id: "3", name: "데이터 시각화 도우미", ... },
  { id: "4", name: "메일함 자동 분류기", ... },
  { id: "5", name: "비주얼 어시스턴트", ... },
  { id: "6", name: "회의록 요약 봇", ... },
];

// 인기 검색어 목업
const MOCK_POPULAR_SEARCHES: string[] = [
  "파이썬 스크립트",
  "PDF 요약기",
  "회의록 정리",
];
```
