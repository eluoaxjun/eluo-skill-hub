# Requirements Document

## Introduction

Eluo Skill Hub의 **Skill Catalog** 바운디드 컨텍스트를 단순화된 구조로 재설계한다. 기존의 7개 테이블(skills, categories, tags, skill_versions, skill_categories, skill_tags, skill_stats) 기반 복잡한 스키마를 폐기하고, 관리자가 마크다운 파일을 업로드하여 스킬을 등록하고 대시보드에서 해당 마크다운 콘텐츠를 열람하는 단순한 구조로 전환한다. Supabase(PostgreSQL + Storage)를 활용하며, DDD 아키텍처 원칙에 따라 도메인 모델을 구성한다.

## Requirements

### Requirement 1: 스킬 등록 (마크다운 파일 업로드)

**Objective:** As a 플랫폼 관리자, I want 마크다운 파일을 업로드하여 스킬을 등록할 수 있기를, so that 별도의 복잡한 입력 폼 없이 마크다운 문서 하나로 스킬 정보를 간편하게 관리할 수 있다.

#### Acceptance Criteria

1. The Skill Catalog shall 관리자에게 스킬 제목, 카테고리, 마크다운 파일을 입력받는 등록 폼을 제공한다.
2. When 관리자가 스킬 등록 폼을 제출할 때, the Skill Catalog shall 마크다운 파일을 Supabase Storage에 업로드하고, 스킬 메타데이터(제목, 카테고리, 파일 경로, 작성자 ID)를 skills 테이블에 저장한다.
3. The Skill Catalog shall 업로드 가능한 파일 형식을 마크다운(.md) 파일로 제한한다.
4. If 마크다운 파일이 아닌 파일이 업로드되면, the Skill Catalog shall 업로드를 거부하고 오류 메시지를 표시한다.
5. The Skill Catalog shall 스킬 카테고리를 기획, 디자인, 퍼블리싱, 개발, QA 중 하나로 선택하도록 제한한다.
6. When 스킬이 등록될 때, the Skill Catalog shall 생성일시(created_at)를 자동으로 현재 시각으로 설정한다.

### Requirement 2: 스킬 데이터 모델

**Objective:** As a 개발자, I want 스킬 정보를 저장하는 단순한 데이터 모델이 정의되기를, so that 불필요한 복잡성 없이 마크다운 기반 스킬 관리에 필요한 최소한의 데이터를 체계적으로 관리할 수 있다.

#### Acceptance Criteria

1. The Skill Catalog shall skills 테이블에 id(UUID, PK), title(text), category(text), markdown_file_path(text), author_id(UUID), created_at(timestamptz) 컬럼을 포함한다.
2. The Skill Catalog shall 모든 skills 레코드에 UUID 기반 기본 키를 사용한다.
3. The Skill Catalog shall category 컬럼의 값을 기획, 디자인, 퍼블리싱, 개발, QA로 제한하는 CHECK 제약 조건을 적용한다.
4. The Skill Catalog shall title 컬럼에 NOT NULL 제약 조건을 적용한다.
5. The Skill Catalog shall markdown_file_path 컬럼에 NOT NULL 제약 조건을 적용한다.
6. The Skill Catalog shall author_id 컬럼이 auth.users 테이블을 참조하도록 외래 키 제약 조건을 설정한다.

### Requirement 3: 마크다운 파일 저장소

**Objective:** As a 플랫폼 관리자, I want 업로드한 마크다운 파일이 안전하게 저장되기를, so that 스킬 콘텐츠가 유실 없이 보관되고 필요할 때 조회할 수 있다.

#### Acceptance Criteria

1. The Skill Catalog shall Supabase Storage에 스킬 마크다운 파일 전용 버킷(skill-markdowns)을 생성한다.
2. The Skill Catalog shall 업로드된 마크다운 파일의 저장 경로를 skills 테이블의 markdown_file_path 컬럼에 기록한다.
3. While 사용자가 인증된 상태에서, the Skill Catalog shall 저장된 마크다운 파일의 읽기 접근을 허용한다.
4. While 사용자가 관리자 역할인 상태에서, the Skill Catalog shall 마크다운 파일의 업로드 및 삭제 접근을 허용한다.
5. If 마크다운 파일 업로드가 실패하면, the Skill Catalog shall 스킬 레코드를 생성하지 않고 오류 메시지를 반환한다.

### Requirement 4: 스킬 대시보드 조회

**Objective:** As a 스킬 소비자, I want 대시보드에서 등록된 스킬 목록을 조회하고 마크다운 콘텐츠를 열람할 수 있기를, so that 각 직군에 맞는 스킬 정보를 확인할 수 있다.

#### Acceptance Criteria

1. The Skill Catalog shall 대시보드에서 skills 테이블에 저장된 스킬 목록(제목, 카테고리, 작성자, 생성일)을 표시한다.
2. When 사용자가 스킬 카드를 클릭할 때, the Skill Catalog shall 해당 스킬의 마크다운 파일을 Supabase Storage에서 가져와 렌더링하여 표시한다.
3. The Skill Catalog shall 마크다운 콘텐츠를 HTML로 변환하여 서식(제목, 목록, 코드 블록, 링크 등)이 올바르게 표시되도록 한다.
4. The Skill Catalog shall 카테고리별 필터링 기능을 제공하여 기획, 디자인, 퍼블리싱, 개발, QA 카테고리로 스킬 목록을 필터링할 수 있도록 한다.
5. The Skill Catalog shall 기존 대시보드의 목업(mockSkills) 데이터를 실제 데이터베이스 조회 결과로 대체한다.

### Requirement 5: 접근 제어 (RLS)

**Objective:** As a 플랫폼 관리자, I want 스킬 데이터에 대한 접근 권한이 역할에 따라 제어되기를, so that 관리자만 스킬을 등록/삭제할 수 있고 일반 사용자는 조회만 가능하다.

#### Acceptance Criteria

1. The Skill Catalog shall skills 테이블에 RLS(Row Level Security)를 활성화한다.
2. While 사용자가 인증된 상태에서, the Skill Catalog shall skills 테이블의 모든 레코드에 대해 읽기(SELECT) 접근을 허용한다.
3. While 사용자가 관리자 역할인 상태에서, the Skill Catalog shall skills 테이블에 대해 삽입(INSERT), 수정(UPDATE), 삭제(DELETE) 접근을 허용한다.
4. If 관리자가 아닌 사용자가 스킬 등록/수정/삭제를 시도하면, the Skill Catalog shall 해당 요청을 거부한다.
5. When 스킬이 삭제될 때, the Skill Catalog shall 해당 스킬의 마크다운 파일을 Supabase Storage에서도 함께 삭제한다.

### Requirement 6: DDD 도메인 모델

**Objective:** As a 개발자, I want 단순화된 스킬 데이터 모델이 DDD 원칙에 따라 구현되기를, so that 도메인 계층의 엔티티와 리포지토리가 일관된 구조로 유지된다.

#### Acceptance Criteria

1. The Skill Catalog shall Skill 엔티티를 Aggregate Root로 설계하여 스킬 데이터의 생성과 삭제가 Skill 엔티티를 통해서만 이루어지도록 한다.
2. The Skill Catalog shall domain 계층에 SkillRepository 인터페이스를 정의하고, infrastructure 계층에 Supabase 기반 구현체(SupabaseSkillRepository)를 제공한다.
3. The Skill Catalog shall domain 계층에서 외부 라이브러리(Supabase, Next.js 등)에 대한 직접 의존을 금지한다.
4. The Skill Catalog shall 테이블 및 컬럼 명명을 snake_case로, 도메인 엔티티 및 값 객체를 PascalCase로 작성한다.
5. The Skill Catalog shall 카테고리를 값 객체(SkillCategory)로 정의하여 허용된 값(기획, 디자인, 퍼블리싱, 개발, QA)만 사용 가능하도록 한다.
