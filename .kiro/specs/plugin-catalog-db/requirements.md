# Requirements Document

## Introduction

Eluo Skill Hub의 핵심 바운디드 컨텍스트인 **Skill Catalog**의 데이터베이스 스키마를 설계하고 구현한다. 관리자가 플러그인/스킬 정보를 업로드하고 관리할 수 있도록, 웹 에이전시의 기획-디자인-퍼블리싱-개발-QA 워크플로우를 자동화하는 플러그인 마켓플레이스에 필요한 플러그인 카탈로그 데이터 모델을 정의한다. Supabase(PostgreSQL) 기반으로 DDD 아키텍처 원칙에 따라 도메인 엔티티, 값 객체, 리포지토리 인터페이스를 포함한 스키마를 구성한다.

## Requirements

### Requirement 1: 스킬 메타데이터 관리

**Objective:** As a 플랫폼 관리자, I want 스킬의 기본 메타데이터(이름, 설명, 작성자, 버전 등)를 저장하고 관리할 수 있기를, so that 마켓플레이스에 등록된 스킬을 체계적으로 관리하고 사용자에게 정확한 정보를 제공할 수 있다.

#### Acceptance Criteria

1. The Plugin Catalog shall 각 스킬에 대해 고유 식별자(ID), 이름, 슬러그, 요약 설명, 상세 설명, 작성자 ID, 생성일시, 수정일시를 저장한다.
2. The Plugin Catalog shall 스킬 이름을 최소 1자 이상, 최대 100자 이하로 제한한다.
3. The Plugin Catalog shall 스킬 슬러그를 고유(unique) 값으로 유지한다.
4. When 새로운 스킬이 등록될 때, the Plugin Catalog shall 생성일시와 수정일시를 자동으로 현재 시각으로 설정한다.
5. When 스킬 정보가 변경될 때, the Plugin Catalog shall 수정일시를 자동으로 현재 시각으로 갱신한다.
6. The Plugin Catalog shall 스킬의 공개 상태(published, draft, archived)를 관리한다.

### Requirement 2: 스킬 카테고리 분류

**Objective:** As a 스킬 소비자, I want 스킬을 직군별 카테고리(기획, 디자인, 퍼블리싱, 개발, QA)로 분류하여 탐색할 수 있기를, so that 내 직군에 맞는 스킬을 빠르게 찾을 수 있다.

#### Acceptance Criteria

1. The Plugin Catalog shall 카테고리 정보를 별도의 테이블로 관리하며, 각 카테고리에 고유 식별자, 이름, 슬러그, 설명, 표시 순서를 저장한다.
2. The Plugin Catalog shall 하나의 스킬이 여러 카테고리에 속할 수 있도록 다대다(N:M) 관계를 지원한다.
3. The Plugin Catalog shall 기획, 디자인, 퍼블리싱, 개발, QA의 기본 카테고리를 시드 데이터로 제공한다.
4. When 카테고리가 삭제될 때, the Plugin Catalog shall 해당 카테고리와 연결된 스킬의 카테고리 매핑만 제거하고 스킬 자체는 유지한다.
5. The Plugin Catalog shall 카테고리 슬러그를 고유(unique) 값으로 유지한다.

### Requirement 3: 스킬 버전 관리

**Objective:** As a 스킬 제작자, I want 스킬의 여러 버전을 등록하고 관리할 수 있기를, so that 스킬을 점진적으로 개선하면서 이전 버전과의 호환성을 유지할 수 있다.

#### Acceptance Criteria

1. The Plugin Catalog shall 스킬 버전 정보를 별도의 테이블로 관리하며, 각 버전에 고유 식별자, 스킬 ID, 시맨틱 버전 문자열, 변경 로그, 다운로드 URL, 생성일시를 저장한다.
2. The Plugin Catalog shall 시맨틱 버전 형식(major.minor.patch)을 저장한다.
3. The Plugin Catalog shall 동일 스킬 내에서 버전 문자열이 중복되지 않도록 고유 제약 조건을 적용한다.
4. The Plugin Catalog shall 각 스킬에 대해 현재 활성 버전(latest)을 식별할 수 있는 플래그를 제공한다.
5. When 새로운 버전이 등록될 때, the Plugin Catalog shall 해당 버전의 생성일시를 자동으로 현재 시각으로 설정한다.

### Requirement 4: 스킬 태그 시스템

**Objective:** As a 스킬 소비자, I want 스킬에 태그를 부여하여 키워드 기반으로 검색할 수 있기를, so that 카테고리 외에도 세분화된 키워드로 원하는 스킬을 찾을 수 있다.

#### Acceptance Criteria

1. The Plugin Catalog shall 태그 정보를 별도의 테이블로 관리하며, 각 태그에 고유 식별자와 이름을 저장한다.
2. The Plugin Catalog shall 하나의 스킬에 여러 태그를 부여할 수 있도록 다대다(N:M) 관계를 지원한다.
3. The Plugin Catalog shall 태그 이름을 고유(unique) 값으로 유지한다.
4. The Plugin Catalog shall 태그 이름을 최대 50자 이하로 제한한다.
5. When 태그가 삭제될 때, the Plugin Catalog shall 해당 태그와 연결된 스킬의 태그 매핑만 제거하고 스킬 자체는 유지한다.

### Requirement 5: 스킬 검색 및 필터링 지원

**Objective:** As a 스킬 소비자, I want 스킬 이름, 설명, 태그, 카테고리 등 다양한 조건으로 스킬을 검색하고 필터링할 수 있기를, so that 필요한 스킬을 효율적으로 탐색할 수 있다.

#### Acceptance Criteria

1. The Plugin Catalog shall 스킬 이름과 설명에 대해 전문 검색(full-text search)을 지원하는 인덱스를 제공한다.
2. The Plugin Catalog shall 카테고리별 필터링을 위한 인덱스를 제공한다.
3. The Plugin Catalog shall 공개 상태(status)별 필터링을 위한 인덱스를 제공한다.
4. The Plugin Catalog shall 생성일시 및 수정일시 기준 정렬을 위한 인덱스를 제공한다.
5. The Plugin Catalog shall 태그 기반 필터링을 위한 조인 쿼리를 지원하는 구조를 제공한다.

### Requirement 6: 스킬 통계 데이터

**Objective:** As a 플랫폼 관리자, I want 스킬별 설치 수, 조회 수 등의 통계 데이터를 저장하고 관리할 수 있기를, so that 인기 스킬 순위 제공 및 마켓플레이스 운영 의사결정에 활용할 수 있다.

#### Acceptance Criteria

1. The Plugin Catalog shall 각 스킬에 대해 총 설치 수, 총 조회 수를 저장한다.
2. When 스킬이 설치될 때, the Plugin Catalog shall 해당 스킬의 설치 수를 1 증가시킨다.
3. When 스킬 상세 페이지가 조회될 때, the Plugin Catalog shall 해당 스킬의 조회 수를 1 증가시킨다.
4. The Plugin Catalog shall 설치 수 및 조회 수 기준 정렬을 위한 인덱스를 제공한다.

### Requirement 7: 데이터 무결성 및 참조 관계

**Objective:** As a 플랫폼 관리자, I want 데이터베이스의 참조 무결성이 보장되기를, so that 고아 레코드나 일관성 없는 데이터가 발생하지 않는다.

#### Acceptance Criteria

1. The Plugin Catalog shall 스킬 버전 테이블에서 스킬 테이블로의 외래 키 제약 조건을 설정한다.
2. The Plugin Catalog shall 스킬-카테고리 매핑 테이블에서 스킬 테이블과 카테고리 테이블로의 외래 키 제약 조건을 설정한다.
3. The Plugin Catalog shall 스킬-태그 매핑 테이블에서 스킬 테이블과 태그 테이블로의 외래 키 제약 조건을 설정한다.
4. When 스킬이 삭제될 때, the Plugin Catalog shall 해당 스킬과 연관된 버전, 카테고리 매핑, 태그 매핑, 통계 데이터를 함께 삭제한다(CASCADE).
5. The Plugin Catalog shall 모든 테이블에 UUID 기반 기본 키를 사용한다.
6. If 외래 키 참조 대상이 존재하지 않는 레코드를 삽입하려 하면, the Plugin Catalog shall 해당 삽입을 거부한다.

### Requirement 8: Row Level Security 및 접근 제어

**Objective:** As a 플랫폼 관리자, I want Supabase RLS(Row Level Security)를 통해 데이터 접근을 제어할 수 있기를, so that 권한이 없는 사용자가 데이터를 무단으로 변경하거나 접근할 수 없다.

#### Acceptance Criteria

1. The Plugin Catalog shall 모든 테이블에 RLS(Row Level Security)를 활성화한다.
2. While 사용자가 인증되지 않은 상태에서, the Plugin Catalog shall 공개 상태(published)인 스킬 정보에 대해서만 읽기 접근을 허용한다.
3. While 사용자가 인증된 상태에서, the Plugin Catalog shall 본인이 작성한 스킬에 대해서만 수정 및 삭제 접근을 허용한다.
4. While 사용자가 관리자 역할인 상태에서, the Plugin Catalog shall 모든 스킬에 대해 읽기, 수정, 삭제 접근을 허용한다.
5. The Plugin Catalog shall 카테고리 및 태그 테이블에 대해 인증된 관리자만 수정할 수 있도록 제한한다.

### Requirement 9: DDD 도메인 모델 정합성

**Objective:** As a 개발자, I want DB 스키마가 DDD 도메인 모델과 정합성을 유지하기를, so that 도메인 계층의 엔티티와 값 객체가 데이터베이스 구조와 일관되게 매핑된다.

#### Acceptance Criteria

1. The Plugin Catalog shall Skill 엔티티를 Aggregate Root로 설계하여 관련 데이터(버전, 태그, 카테고리 매핑, 통계)의 변경이 Skill을 통해서만 이루어지도록 한다.
2. The Plugin Catalog shall 값 객체(SkillId, SemanticVersion, SkillSlug 등)에 해당하는 컬럼에 적절한 타입 제약 조건을 적용한다.
3. The Plugin Catalog shall 도메인 계층의 리포지토리 인터페이스(SkillRepository)에 대응하는 테이블 구조를 제공한다.
4. The Plugin Catalog shall 테이블 및 컬럼 명명을 snake_case로 통일하여 PostgreSQL 관례를 따른다.
5. The Plugin Catalog shall 각 테이블에 대해 SQL 마이그레이션 파일을 제공한다.
