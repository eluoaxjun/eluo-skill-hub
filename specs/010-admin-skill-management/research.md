# Research: 어드민 스킬관리 페이지 디자인

**Feature Branch**: `010-admin-skill-management`
**Date**: 2026-03-04

## R-001: 스킬 상태 매핑 (DB ↔ UI)

**Decision**: DB의 `active`/`inactive` 상태를 UI에서 `Published`/`Draft`로 매핑한다.

**Rationale**: HTML 레퍼런스에서는 Published/Draft 라벨을 사용하지만, 기존 DB 스키마의 `skills.status` check constraint는 `('active', 'inactive')`이다. DB 스키마 변경 없이 UI 레이블만 매핑하는 것이 가장 안전하다.

**Alternatives considered**:
- DB 스키마를 `published`/`draft`로 변경 → 기존 데이터 마이그레이션 필요, 다른 기능에 영향
- 새 컬럼 추가 → 불필요한 복잡도 증가

**Mapping**:
| DB status | UI label | Filter tab |
|-----------|----------|------------|
| `active` | Published | 배포됨 |
| `inactive` | Draft | 초안 |

## R-002: 검색 구현 패턴

**Decision**: 기존 `MemberSearch` 컴포넌트 패턴을 재사용한다. URL 검색 파라미터(`q`)와 300ms 디바운스 방식.

**Rationale**: 동일 프로젝트 내 검증된 패턴이며, 서버 컴포넌트에서 데이터를 가져오는 기존 아키텍처와 일치한다. URL 기반이므로 검색 상태가 공유/북마크 가능하다.

**Alternatives considered**:
- 클라이언트 사이드 필터링 → 데이터가 많아지면 성능 저하, 페이지네이션과 비호환
- React Query/SWR 등 클라이언트 캐싱 → 기존 패턴과 불일치, 불필요한 의존성 추가

**구현 방식**:
- `SkillSearch` 클라이언트 컴포넌트 생성 (MemberSearch 패턴 기반)
- URL params: `q` (검색어), `status` (필터), `page` (페이지)
- Server component에서 searchParams 읽어 use case에 전달

## R-003: 카드 아이콘 소스

**Decision**: `categories.icon` 필드를 활용하여 카테고리별 아이콘을 표시한다.

**Rationale**: DB의 `categories` 테이블에 이미 `icon` 필드가 존재한다. HTML 레퍼런스에서 사용하는 Material Symbols Outlined 아이콘과 매핑 가능하다. 프로젝트에서는 `lucide-react`를 사용하므로, `categories.icon` 값을 lucide 아이콘명으로 저장하거나 매핑 테이블을 사용한다.

**Alternatives considered**:
- 하드코딩된 카테고리-아이콘 매핑 → DB 데이터와 동기화 문제
- 아이콘 없이 카테고리 이니셜 표시 → HTML 레퍼런스와 불일치

## R-004: 필터 탭 구현 방식

**Decision**: URL 검색 파라미터(`status`)를 사용한 서버 사이드 필터링.

**Rationale**: 검색과 동일하게 URL 기반으로 구현하면 필터+검색 조합이 자연스럽게 동작하며, 서버 컴포넌트에서 Supabase 쿼리에 where 조건을 추가하는 것이 효율적이다.

**URL params 설계**:
- `?status=all` (또는 파라미터 없음) → 전체
- `?status=active` → 배포됨 (Published)
- `?status=inactive` → 초안 (Draft)

## R-005: glass-card 스타일링

**Decision**: Tailwind CSS 유틸리티 클래스로 glass-card 효과를 구현한다.

**Rationale**: HTML 레퍼런스의 glass-card 스타일을 Tailwind v4 유틸리티로 직접 구현할 수 있다. 별도 CSS 파일이나 플러그인 불필요.

**스타일 매핑**:
```
HTML 레퍼런스                         → Tailwind 유틸리티
background: rgba(255,255,255,0.7)    → bg-white/70
backdrop-filter: blur(10px)          → backdrop-blur-sm
border: 1px solid rgba(255,255,255,0.3) → border border-white/30
box-shadow: 0 8px 32px rgba(0,0,128,0.05) → shadow-lg shadow-[#000080]/5
```

## R-006: Repository 인터페이스 확장

**Decision**: `AdminRepository.getSkills()` 메서드에 `search`와 `status` 선택 파라미터를 추가한다.

**Rationale**: 기존 `getMembers()`가 `search` 파라미터를 받는 패턴과 동일하게 확장한다. Clean Architecture 원칙에 따라 도메인 인터페이스 → 인프라 구현 순으로 변경한다.

**변경 범위**:
1. `AdminRepository` 인터페이스: `getSkills(page, pageSize, search?, status?)` 시그니처 변경
2. `SupabaseAdminRepository`: Supabase 쿼리에 `.ilike()` (검색) 및 `.eq()` (상태 필터) 조건 추가
3. `GetSkillsUseCase`: search, status 파라미터 전달
4. `SkillsPage`: searchParams에서 q, status 읽어 use case에 전달

## R-007: SkillRow 타입 확장

**Decision**: `SkillRow`에 `categoryIcon` 필드를 추가한다.

**Rationale**: 카드 UI에 카테고리별 아이콘이 필요하며, `categories.icon` 필드에서 가져올 수 있다. 기존 `SkillRow` 인터페이스를 확장하여 아이콘 정보를 포함시킨다.

**변경**: `SkillRow`에 `readonly categoryIcon: string;` 추가
