# Implementation Plan

- [x] 1. 기존 Skill Catalog 도메인 코드 정리 및 단순화된 도메인 모델 구축
- [x] 1.1 기존 7-테이블 기반의 Skill Catalog 도메인 코드를 제거하고 단순화된 구조로 교체한다
  - 기존 값 객체(SkillId, SemanticVersion, SkillSlug, SkillStatus), 엔티티(Skill, SkillVersion, Category, Tag), 이벤트(SkillCreated, SkillPublished, SkillArchived)를 제거한다
  - 기존 리포지토리 인터페이스(SkillRepository, CategoryRepository, TagRepository) 및 Supabase 구현체를 제거한다
  - 기존 도메인 에러 타입과 Result 타입을 제거한다
  - _Requirements: 6.1, 6.3_

- [x] 1.2 스킬 카테고리를 5개 허용 값으로 제한하는 값 객체를 구현한다
  - 기획, 디자인, 퍼블리싱, 개발, QA 중 하나만 생성 가능하도록 검증한다
  - 유효하지 않은 값으로 생성 시도 시 에러를 반환한다
  - 불변 속성을 보장하고 동등성 비교를 지원한다
  - 공유 계층의 ValueObject 베이스 클래스를 상속한다
  - _Requirements: 1.5, 2.3, 6.5_

- [x] 1.3 Skill 엔티티를 Aggregate Root로 구현한다
  - 제목, 카테고리, 마크다운 파일 경로, 작성자 ID, 생성일시를 캡슐화한다
  - 팩토리 메서드에서 제목 NOT NULL 및 카테고리 유효성을 검증하고, 생성일시를 현재 시각으로 자동 설정한다
  - DB 레코드로부터 엔티티를 복원하는 정적 메서드를 제공한다
  - 공유 계층의 Entity 베이스 클래스를 상속하며, 도메인 계층에서 외부 라이브러리에 대한 직접 의존을 금지한다
  - _Requirements: 1.6, 2.4, 2.5, 6.1, 6.3_

- [x] 1.4 스킬 리포지토리 인터페이스와 Storage 어댑터 인터페이스를 정의한다
  - 스킬 리포지토리는 단건 조회(ID), 목록 조회(카테고리 필터링), 저장, 삭제 메서드를 선언한다
  - Storage 어댑터는 마크다운 파일의 업로드, 다운로드(텍스트 문자열 반환), 삭제 메서드를 선언한다
  - 두 인터페이스 모두 도메인 계층에 위치하며 외부 의존성을 갖지 않는다
  - _Requirements: 3.1, 3.2, 6.2_

- [x] 1.5 도메인 모델 단위 테스트를 작성한다
  - SkillCategory 값 객체: 유효한 5개 카테고리 생성 성공, 잘못된 값 생성 실패 검증
  - Skill 엔티티: 유효한 입력으로 생성 성공, 빈 제목으로 생성 실패, 잘못된 카테고리로 생성 실패, reconstruct 복원 검증, 생성일시 자동 설정 확인
  - 1.2~1.3 태스크의 완료 결과물에 의존한다
  - _Requirements: 1.5, 1.6, 2.3, 2.4, 2.5, 6.1, 6.3, 6.5_

- [x] 2. SQL 마이그레이션: skills 테이블 및 Storage 버킷 생성
- [x] 2.1 skills 테이블을 생성하는 마이그레이션을 작성한다
  - id(UUID, PK, gen_random_uuid), title(text, NOT NULL), category(text, NOT NULL, CHECK 제약으로 5개 값 제한), markdown_file_path(text, NOT NULL), author_id(UUID, NOT NULL, auth.users FK), created_at(timestamptz, NOT NULL, DEFAULT now()) 컬럼을 포함한다
  - category, author_id, created_at DESC 인덱스를 생성한다
  - 테이블 및 컬럼 이름을 snake_case로 작성한다
  - _Requirements: 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.4_

- [x] 2.2 (P) skill-markdowns Storage 버킷을 생성하는 마이그레이션을 작성한다
  - 프라이빗 버킷으로 생성하여 RLS 기반 접근 제어를 적용한다
  - 마크다운(.md) 파일만 저장하며, 파일 경로는 UUID.md 형식을 사용한다
  - _Requirements: 3.1_

- [x] 3. SQL 마이그레이션: RLS 정책 설정
- [x] 3.1 skills 테이블의 RLS 정책을 생성하는 마이그레이션을 작성한다
  - skills 테이블에 RLS를 활성화한다
  - 인증된 사용자에게 모든 레코드에 대해 SELECT 접근을 허용하는 정책을 설정한다
  - 관리자(is_admin 함수 활용)에게만 INSERT, UPDATE, DELETE 접근을 허용하는 정책을 설정한다
  - 비관리자의 등록/수정/삭제 요청을 자동으로 거부한다
  - 2.1 태스크에 의존한다
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3.2 (P) skill-markdowns Storage 버킷의 RLS 정책을 생성하는 마이그레이션을 작성한다
  - 인증된 사용자에게 마크다운 파일 읽기(SELECT) 접근을 허용하는 정책을 설정한다
  - 관리자(is_admin 함수 활용)에게만 마크다운 파일 업로드(INSERT) 및 삭제(DELETE) 접근을 허용하는 정책을 설정한다
  - storage.objects 테이블에 bucket_id 조건을 포함한다
  - 2.2 태스크에 의존한다
  - _Requirements: 3.3, 3.4_

- [x] 4. 인프라 계층 구현
- [x] 4.1 (P) Supabase 기반 스킬 리포지토리 구현체를 작성한다
  - Supabase 클라이언트를 생성자 주입으로 받아 테스트 시 모킹 가능하게 설계한다
  - DB 레코드(snake_case)와 도메인 엔티티(camelCase) 간 매핑을 담당한다
  - findById, findAll(카테고리 필터링), save, delete 메서드를 구현한다
  - DB 레코드에서 도메인 엔티티로 변환 시 SkillCategory 유효성을 재검증한다
  - _Requirements: 6.2, 6.4_

- [x] 4.2 (P) Supabase Storage 기반 어댑터 구현체를 작성한다
  - skill-markdowns 버킷을 대상으로 파일 업로드, 다운로드, 삭제를 수행한다
  - upload 전 파일 확장자가 .md인지 검증하고, contentType을 text/markdown으로 설정한다
  - download 시 Blob을 텍스트 문자열로 변환하여 반환한다
  - 네트워크 오류 등 실패 시 적절한 에러 메시지를 반환한다
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. 애플리케이션 계층 유스케이스 구현
- [x] 5.1 스킬 등록 유스케이스를 구현한다
  - Storage에 마크다운 파일을 먼저 업로드하고, 성공 시에만 skills 테이블에 레코드를 저장한다
  - 파일 경로를 UUID.md 형식으로 생성하여 파일명 충돌을 방지한다
  - Storage 업로드 실패 시 스킬 레코드를 생성하지 않고 오류를 반환한다
  - Storage 업로드 성공 후 DB 저장 실패 시 Storage 파일 삭제를 시도한다
  - 도메인 엔티티 생성 단계에서 제목과 카테고리 유효성을 검증한다
  - _Requirements: 1.1, 1.2, 3.2, 3.5_

- [x] 5.2 (P) 스킬 목록 조회 유스케이스를 구현한다
  - 스킬 리포지토리를 통해 전체 목록을 조회하고, 카테고리별 필터링을 지원한다
  - 성공/실패를 Result 패턴으로 반환한다
  - _Requirements: 4.1, 4.4, 4.5_

- [x] 5.3 (P) 스킬 삭제 유스케이스를 구현한다
  - 먼저 findById로 스킬을 조회하여 마크다운 파일 경로를 획득한다
  - Storage에서 마크다운 파일을 삭제한 후, DB에서 스킬 레코드를 삭제한다
  - _Requirements: 5.5_

- [x] 5.4 (P) 마크다운 콘텐츠 조회 유스케이스를 구현한다
  - Storage 어댑터를 통해 특정 스킬의 마크다운 파일 내용을 문자열로 조회하여 반환한다
  - 파일 조회 실패 시 적절한 에러 메시지를 반환한다
  - _Requirements: 4.2_

- [x] 6. 마크다운 렌더링 의존성 설치 및 설정
- [x] 6.1 react-markdown, remark-gfm, @tailwindcss/typography 패키지를 설치하고 프로젝트에 설정한다
  - react-markdown v10과 remark-gfm 패키지를 신규 의존성으로 추가한다
  - @tailwindcss/typography 플러그인을 추가하여 prose 클래스 기반 마크다운 스타일링을 활성화한다
  - _Requirements: 4.3_

- [x] 7. 관리자 스킬 관리 페이지 구현
- [x] 7.1 관리자 레이아웃에 스킬 관리 네비게이션 항목을 추가한다
  - 기존 관리자 사이드바에 /admin/skills 경로로 이동하는 "스킬 관리" 항목을 추가한다
  - _Requirements: 1.1_

- [x] 7.2 관리자 스킬 관리 페이지를 구현한다
  - /admin/skills 라우트의 서버 컴포넌트로 등록된 스킬 목록을 테이블 형태로 표시한다
  - 스킬 제목, 카테고리, 작성자, 생성일을 표시한다
  - 스킬 삭제 버튼을 제공하고, 삭제 유스케이스를 호출한다
  - _Requirements: 1.1, 5.5_

- [x] 7.3 스킬 등록 폼 컴포넌트를 구현한다
  - 스킬 제목(텍스트 입력), 카테고리(5개 드롭다운 선택), 마크다운 파일(파일 업로드) 입력을 받는다
  - 클라이언트 측에서 accept=".md" 속성으로 파일 형식을 제한하고, 서버 측에서도 확장자를 검증한다
  - 마크다운 파일이 아닌 파일 업로드 시 오류 메시지를 표시한다
  - Server Action 또는 API Route를 통해 등록 유스케이스를 호출한다
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 8. 메인 대시보드 통합
- [x] 8.1 대시보드의 목업(mockSkills) 데이터를 실제 데이터베이스 조회로 대체한다
  - 기존 SkillSummary 타입과 mockSkills 정적 데이터를 마크다운 기반 스킬 모델에 맞게 교체한다
  - useDashboardState 훅 또는 서버 컴포넌트에서 스킬 목록 조회 유스케이스를 호출하여 실제 데이터를 가져온다
  - SkillCard, SkillCardGrid 컴포넌트를 새로운 데이터 모델에 맞게 수정한다
  - 대시보드에서 스킬 목록(제목, 카테고리, 작성자, 생성일)을 표시한다
  - _Requirements: 4.1, 4.5_

- [x] 8.2 카테고리별 필터링 기능을 실제 데이터 기반으로 연결한다
  - 기획, 디자인, 퍼블리싱, 개발, QA 카테고리로 스킬 목록을 필터링할 수 있도록 한다
  - 기존 카테고리 네비게이션 컴포넌트와 연동한다
  - _Requirements: 4.4_

- [x] 8.3 스킬 상세 뷰(마크다운 렌더링) 컴포넌트를 구현한다
  - 스킬 카드 클릭 시 Dialog 형태로 마크다운 콘텐츠를 표시한다
  - 마크다운 콘텐츠 조회 유스케이스를 호출하여 Storage에서 파일 내용을 가져온다
  - react-markdown과 remark-gfm을 사용하여 마크다운을 HTML로 변환하고, prose 클래스로 스타일링한다
  - 제목, 목록, 코드 블록, 링크 등의 서식이 올바르게 표시되도록 한다
  - _Requirements: 4.2, 4.3_

- [x] 9. 인프라 계층 통합 테스트
- [x] 9.1 스킬 리포지토리 구현체의 CRUD 통합 테스트를 작성한다
  - 스킬 저장, 단건 조회(ID), 목록 조회, 카테고리 필터링, 삭제 동작을 검증한다
  - 도메인 엔티티와 DB 레코드 간 매핑 정합성을 확인한다
  - _Requirements: 6.2_

- [x] 9.2 (P) Storage 어댑터 구현체의 파일 조작 통합 테스트를 작성한다
  - 마크다운 파일 업로드, 다운로드(텍스트 반환), 삭제 동작을 검증한다
  - .md 확장자 검증 동작을 확인한다
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 9.3 RLS 정책 통합 테스트를 작성한다
  - 인증된 사용자가 skills 테이블의 모든 레코드를 읽을 수 있는지 검증한다
  - 관리자만 INSERT, UPDATE, DELETE를 수행할 수 있는지 검증한다
  - 비관리자의 등록/수정/삭제 시도가 거부되는지 검증한다
  - Storage 버킷에 대해 인증 사용자 읽기, 관리자 업로드/삭제 정책을 검증한다
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 3.3, 3.4_
