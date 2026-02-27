# Implementation Plan

- [ ] 1. 공유 도메인 기반 타입 확인 및 Skill Catalog 모듈 초기화
- [x] 1.1 공유 계층의 Entity, ValueObject 베이스 클래스가 Skill Catalog에서 사용할 수 있는 상태인지 확인하고, 부족한 부분이 있으면 보완한다
  - Entity 베이스 클래스에 도메인 이벤트 수집/발행 기능이 포함되어 있는지 확인한다
  - ValueObject 베이스 클래스에 동등성 비교(equals) 메서드가 포함되어 있는지 확인한다
  - DomainEvent 인터페이스가 정의되어 있는지 확인하고, 없으면 생성한다
  - _Requirements: 9.1, 9.2_

- [x] 1.2 Skill Catalog 바운디드 컨텍스트의 디렉토리 구조를 생성한다
  - domain, application, infrastructure 3계층 디렉토리를 생성한다
  - domain 하위에 entities, value-objects, repositories, events 디렉토리를 구성한다
  - infrastructure 하위에 repositories 디렉토리를 구성한다
  - _Requirements: 9.1, 9.3_

- [ ] 2. 값 객체(Value Objects) 구현
- [ ] 2.1 (P) SkillId 값 객체를 구현한다
  - UUID v4 형식 검증 로직을 포함한다
  - 새로운 ID를 생성하는 팩토리 메서드와 기존 문자열로부터 생성하는 메서드를 제공한다
  - 유효하지 않은 UUID 형식에 대해 에러를 반환한다
  - _Requirements: 7.5, 9.2_

- [ ] 2.2 (P) SemanticVersion 값 객체를 구현한다
  - major.minor.patch 형식의 문자열을 파싱하여 각 숫자 컴포넌트로 분리한다
  - 음수 값이나 형식에 맞지 않는 문자열에 대해 에러를 반환한다
  - 문자열 변환 메서드를 제공한다
  - _Requirements: 3.2, 9.2_

- [ ] 2.3 (P) SkillSlug 값 객체를 구현한다
  - 소문자 영숫자와 하이픈만 허용하는 정규식 검증을 수행한다
  - 유효하지 않은 슬러그 형식에 대해 에러를 반환한다
  - _Requirements: 1.3, 9.2_

- [ ] 2.4 (P) SkillStatus 값 객체를 구현한다
  - draft, published, archived 세 가지 상태를 정의한다
  - 허용된 상태 전이 규칙(draft->published, published->archived, archived->published)을 검증하는 메서드를 제공한다
  - 허용되지 않는 상태 전이 시도 시 에러를 반환한다
  - _Requirements: 1.6, 9.2_

- [ ] 2.5 (P) 도메인 에러 타입과 Result 타입을 정의한다
  - Skill Catalog 컨텍스트에서 발생할 수 있는 비즈니스 에러 타입을 discriminated union으로 정의한다
  - 성공/실패를 표현하는 Result 타입을 정의한다
  - 이름 길이 위반, 버전 형식 위반, 슬러그 형식 위반, 상태 전이 위반, 중복 슬러그, 중복 버전, 중복 태그 등의 에러를 포함한다
  - _Requirements: 1.2, 3.2, 1.3, 1.6_

- [ ] 2.6 값 객체 단위 테스트를 작성한다
  - SkillId: 유효한 UUID 생성, 무효한 형식 거부 테스트
  - SemanticVersion: 유효한 버전 파싱, 무효한 형식 거부, 음수 거부 테스트
  - SkillSlug: 유효한 슬러그 검증, 대문자/특수문자 거부 테스트
  - SkillStatus: 허용/거부 상태 전이 테스트
  - 2.1~2.4 태스크의 완료 결과물에 의존한다
  - _Requirements: 9.2_

- [ ] 3. 도메인 엔티티 구현
- [ ] 3.1 Skill 엔티티(Aggregate Root)를 구현한다
  - 스킬의 이름, 슬러그, 요약, 상세 설명, 작성자 ID, 상태, 생성/수정일시를 캡슐화한다
  - 팩토리 메서드에서 이름 길이(1-100자) 불변식을 검증한다
  - 메타데이터 수정 시에도 이름 길이 불변식을 강제하고 수정일시를 갱신한다
  - 상태 전이 메서드(publish, archive, republish)에서 SkillStatus의 전이 규칙을 활용한다
  - 도메인 이벤트(SkillCreated, SkillPublished, SkillArchived)를 수집한다
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.1_

- [ ] 3.2 (P) SkillVersion 엔티티를 구현한다
  - 스킬 ID, 시맨틱 버전, 변경 로그, 다운로드 URL, 활성 버전 플래그, 생성일시를 캡슐화한다
  - 팩토리 메서드에서 SemanticVersion 값 객체를 활용하여 버전 형식을 검증한다
  - 활성 버전 플래그를 설정/해제하는 메서드를 제공한다
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [ ] 3.3 (P) Category 엔티티를 구현한다
  - 이름, 슬러그, 설명, 표시 순서를 캡슐화한다
  - 슬러그의 고유성은 리포지토리 수준에서 보장하되, 엔티티 내부에서 기본 유효성을 검증한다
  - 정보 수정 메서드를 제공한다
  - _Requirements: 2.1, 2.5_

- [ ] 3.4 (P) Tag 엔티티를 구현한다
  - 이름(최대 50자)을 캡슐화하고 길이 제한 불변식을 검증한다
  - 태그 이름의 고유성은 리포지토리 수준에서 보장한다
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 3.5 (P) 도메인 이벤트(SkillCreated, SkillPublished, SkillArchived)를 정의한다
  - 각 이벤트에 스킬 ID, 발생 시각 등 필요한 속성을 포함한다
  - DomainEvent 인터페이스를 구현한다
  - _Requirements: 9.1_

- [ ] 3.6 도메인 엔티티 단위 테스트를 작성한다
  - Skill: 생성 시 기본 상태(draft) 확인, 이름 길이 위반 거부, 상태 전이 성공/실패, 메타데이터 수정 시 수정일시 갱신, 도메인 이벤트 수집 확인
  - SkillVersion: 유효한 버전 생성, 활성 버전 플래그 전환
  - Category: 생성 및 수정
  - Tag: 이름 길이 제한 검증
  - 3.1~3.5 태스크의 완료 결과물에 의존한다
  - _Requirements: 1.1, 1.2, 1.4, 1.6, 3.1, 3.2, 3.4, 4.4, 9.1_

- [ ] 4. 리포지토리 인터페이스 정의
- [ ] 4.1 (P) SkillRepository 인터페이스를 정의한다
  - 스킬 CRUD, 버전 관리, 카테고리/태그 매핑 관리, 통계 조회/증가 메서드를 선언한다
  - 상태별, 카테고리별, 태그별, 검색어 기반 필터링과 정렬을 지원하는 조회 메서드를 포함한다
  - 페이지네이션(offset, limit)을 지원한다
  - _Requirements: 9.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [ ] 4.2 (P) CategoryRepository 인터페이스를 정의한다
  - 카테고리 CRUD 및 정렬 조회 메서드를 선언한다
  - ID 또는 슬러그로 단건 조회하는 메서드를 포함한다
  - _Requirements: 9.3_

- [ ] 4.3 (P) TagRepository 인터페이스를 정의한다
  - 태그 CRUD, 이름 검색, 페이지네이션 조회 메서드를 선언한다
  - 이름으로 단건 조회하는 메서드를 포함한다
  - _Requirements: 9.3_

- [ ] 5. SQL 마이그레이션: 기본 테이블 및 함수 생성
- [ ] 5.1 pg_trgm 확장 활성화와 유틸리티 함수를 생성하는 마이그레이션을 작성한다
  - pg_trgm 확장을 활성화한다
  - tsvector용 immutable 래핑 함수를 생성한다
  - updated_at 자동 갱신 트리거 함수를 생성한다
  - 마이그레이션은 멱등성을 갖춘다(CREATE IF NOT EXISTS 패턴)
  - _Requirements: 5.1, 1.5, 9.5_

- [ ] 5.2 skills 테이블을 생성하는 마이그레이션을 작성한다
  - UUID 기본 키, 이름(1-100자 CHECK), 슬러그(UNIQUE), 요약, 상세 설명, 작성자 ID(FK), 상태(CHECK), 생성/수정일시, 전문 검색용 Generated Column을 포함한다
  - updated_at 자동 갱신 트리거를 적용한다
  - 슬러그, 상태, 작성자 ID, 생성일시, 수정일시, FTS GIN, trigram GiST 인덱스를 생성한다
  - 모든 컬럼과 테이블 이름을 snake_case로 작성한다
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.3, 5.4, 7.5, 9.4, 9.5_

- [ ] 5.3 (P) categories 테이블을 생성하는 마이그레이션을 작성한다
  - UUID 기본 키, 이름, 슬러그(UNIQUE), 설명, 표시 순서를 포함한다
  - _Requirements: 2.1, 2.5, 7.5, 9.4, 9.5_

- [ ] 5.4 (P) tags 테이블을 생성하는 마이그레이션을 작성한다
  - UUID 기본 키, 이름(UNIQUE, 1-50자 CHECK)을 포함한다
  - _Requirements: 4.1, 4.3, 4.4, 7.5, 9.4, 9.5_

- [ ] 5.5 skill_versions 테이블을 생성하는 마이그레이션을 작성한다
  - UUID 기본 키, 스킬 FK(CASCADE), 시맨틱 버전(CHECK), 변경 로그, 다운로드 URL, 활성 버전 플래그, 생성일시를 포함한다
  - 동일 스킬 내 버전 고유 제약(UNIQUE)을 적용한다
  - 활성 버전 조회를 위한 부분 인덱스(partial index)를 생성한다
  - skills 테이블 마이그레이션(5.2)에 의존한다
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.5, 7.6, 9.4, 9.5_

- [ ] 5.6 (P) skill_categories 매핑 테이블을 생성하는 마이그레이션을 작성한다
  - 스킬 FK(CASCADE)와 카테고리 FK(CASCADE)로 구성된 복합 기본 키를 정의한다
  - 카테고리별 역방향 조회를 위한 인덱스를 생성한다
  - skills(5.2)와 categories(5.3) 마이그레이션에 의존한다
  - _Requirements: 2.2, 2.4, 5.2, 7.2, 7.5, 9.4, 9.5_

- [ ] 5.7 (P) skill_tags 매핑 테이블을 생성하는 마이그레이션을 작성한다
  - 스킬 FK(CASCADE)와 태그 FK(CASCADE)로 구성된 복합 기본 키를 정의한다
  - 태그별 역방향 조회를 위한 인덱스를 생성한다
  - skills(5.2)와 tags(5.4) 마이그레이션에 의존한다
  - _Requirements: 4.2, 4.5, 5.5, 7.3, 7.5, 9.4, 9.5_

- [ ] 5.8 skill_stats 테이블을 생성하는 마이그레이션을 작성한다
  - UUID 기본 키, 스킬 FK(CASCADE, UNIQUE), 설치 수(기본값 0, 음수 불가 CHECK), 조회 수(기본값 0, 음수 불가 CHECK)를 포함한다
  - 설치 수 및 조회 수 기준 정렬을 위한 내림차순 인덱스를 생성한다
  - skills 테이블 마이그레이션(5.2)에 의존한다
  - _Requirements: 6.1, 6.4, 7.5, 9.4, 9.5_

- [ ] 6. SQL 마이그레이션: RLS 정책 설정
- [ ] 6.1 모든 테이블에 RLS를 활성화하고 skills 테이블의 접근 제어 정책을 생성하는 마이그레이션을 작성한다
  - 7개 모든 테이블에 RLS를 활성화한다
  - 미인증 사용자는 published 상태 스킬만 읽기 허용하는 정책을 설정한다
  - 인증된 사용자는 본인 스킬에 대해 CRUD를 허용하는 정책을 설정한다
  - 관리자(app_metadata.user_role = 'admin')는 모든 스킬에 대해 전체 접근을 허용하는 정책을 설정한다
  - INSERT 시 author_id가 auth.uid()와 일치하는지 검증하는 정책을 포함한다
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 6.2 categories, tags 테이블의 접근 제어 정책을 생성하는 마이그레이션을 작성한다
  - 모든 역할에 대해 SELECT을 허용한다
  - INSERT, UPDATE, DELETE는 관리자 역할만 허용하는 정책을 설정한다
  - _Requirements: 8.1, 8.5_

- [ ] 6.3 skill_versions, skill_categories, skill_tags, skill_stats 테이블의 접근 제어 정책을 생성하는 마이그레이션을 작성한다
  - 부모 skills 테이블의 소유자 또는 관리자만 변경할 수 있도록 정책을 설정한다
  - 공개 스킬의 관련 데이터에 대해서는 SELECT을 허용한다
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 7. SQL 마이그레이션: 시드 데이터 및 CASCADE 삭제 검증
- [ ] 7.1 기본 카테고리 시드 데이터를 삽입하는 마이그레이션을 작성한다
  - 기획, 디자인, 퍼블리싱, 개발, QA 5개 카테고리를 삽입한다
  - 이미 존재하는 경우 중복 삽입을 방지한다(ON CONFLICT DO NOTHING)
  - _Requirements: 2.3_

- [ ] 7.2 CASCADE 삭제 동작을 검증한다
  - 스킬 삭제 시 연관된 버전, 카테고리 매핑, 태그 매핑, 통계 데이터가 함께 삭제되는지 확인한다
  - 카테고리 삭제 시 매핑만 제거되고 스킬 자체는 유지되는지 확인한다
  - 태그 삭제 시 매핑만 제거되고 스킬 자체는 유지되는지 확인한다
  - 외래 키 참조 대상이 없는 레코드 삽입이 거부되는지 확인한다
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 2.4, 4.5_

- [ ] 8. 인프라 계층 리포지토리 구현체
- [ ] 8.1 SupabaseSkillRepository를 구현한다
  - Supabase 클라이언트를 생성자 주입으로 받아 테스트 시 모킹이 가능하도록 설계한다
  - 스킬 CRUD 메서드를 구현하고, 도메인 엔티티와 데이터베이스 레코드 간 매핑(hydration/dehydration)을 수행한다
  - 전문 검색 시 tsvector 쿼리와 pg_trgm ILIKE 쿼리를 병행하여 검색한다
  - 상태별, 카테고리별, 태그별 필터링과 생성일시/수정일시/설치수/조회수 기준 정렬을 지원한다
  - 버전 관리, 카테고리/태그 매핑, 통계 증가 메서드를 구현한다
  - 통계 증가는 원자적 UPDATE(SET count = count + 1)로 구현한다
  - _Requirements: 9.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [ ] 8.2 (P) SupabaseCategoryRepository를 구현한다
  - 카테고리 CRUD 및 정렬 조회를 구현한다
  - 도메인 엔티티와 데이터베이스 레코드 간 매핑을 수행한다
  - _Requirements: 9.3_

- [ ] 8.3 (P) SupabaseTagRepository를 구현한다
  - 태그 CRUD, 이름 검색, 페이지네이션 조회를 구현한다
  - 도메인 엔티티와 데이터베이스 레코드 간 매핑을 수행한다
  - _Requirements: 9.3_

- [ ] 9. 통합 테스트
- [ ] 9.1 리포지토리 구현체의 CRUD 통합 테스트를 작성한다
  - SupabaseSkillRepository: 스킬 생성, 조회, 수정, 삭제 및 엔티티-레코드 매핑 정합성을 검증한다
  - SupabaseCategoryRepository: 카테고리 CRUD를 검증한다
  - SupabaseTagRepository: 태그 CRUD를 검증한다
  - _Requirements: 9.3_

- [ ] 9.2 전문 검색 및 필터링 통합 테스트를 작성한다
  - tsvector 기반 전문 검색과 pg_trgm 기반 부분 문자열 검색 결과를 검증한다
  - 카테고리별, 태그별, 상태별 필터링을 검증한다
  - 정렬(생성일시, 수정일시, 설치수, 조회수) 결과를 검증한다
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9.3 통계 및 CASCADE 통합 테스트를 작성한다
  - 설치 수, 조회 수 증가의 원자성을 검증한다
  - 스킬 삭제 시 연관 데이터 CASCADE 삭제를 검증한다
  - _Requirements: 6.1, 6.2, 6.3, 7.4_

- [ ]* 9.4 RLS 정책 통합 테스트를 작성한다
  - 미인증 사용자: published 스킬만 읽기 가능한지 검증한다
  - 인증된 사용자: 본인 스킬만 수정/삭제 가능한지 검증한다
  - 관리자: 모든 스킬에 전체 접근 가능한지 검증한다
  - 카테고리/태그 테이블에 대해 관리자만 수정 가능한지 검증한다
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
