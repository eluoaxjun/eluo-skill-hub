# Data Model: 스킬 관리 페이지 테이블뷰 추가

## 변경 사항

**DB 스키마 변경 없음** — 본 기능은 순수 프론트엔드 UI 변경으로, 기존 데이터 모델을 그대로 사용한다.

## 기존 엔티티 (참조용)

### SkillRow (admin/domain/types.ts)

테이블뷰에서 표시할 데이터 소스. 기존 `SkillRow` 인터페이스의 모든 필드를 활용한다.

| Field | Type | 테이블 컬럼 매핑 |
|-------|------|------------------|
| id | string | (행 식별자, 수정/삭제 링크에 사용) |
| title | string | 제목 |
| categoryName | string | 카테고리 |
| categoryIcon | string | 카테고리 아이콘 |
| version | string | 버전 |
| status | 'published' \| 'drafted' | 상태 |
| tags | readonly string[] | 태그 (최대 3개 표시 + 축약) |
| createdAt | string | 생성일 |
| updatedAt | string | 수정일 |

## 신규 클라이언트 상태

### ViewMode

뷰 모드 전환을 위한 클라이언트 전용 상태.

| 값 | 설명 |
|----|------|
| `'grid'` | 카드 그리드 뷰 (기본값) |
| `'table'` | 테이블 뷰 |

- 서버 상태/URL에 반영하지 않음
- 페이지 새로고침 시 `'grid'`로 초기화
