# Research & Design Decisions

## Summary
- **Feature**: `plugin-catalog-db`
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - Supabase PostgreSQL에서 `gen_random_uuid()`를 기본 키 생성 함수로 사용하는 것이 네이티브이며 확장 없이 사용 가능
  - RLS 정책에서 관리자 역할 확인은 반드시 `app_metadata`(변경 불가)를 사용해야 하며, `user_metadata`(사용자 변경 가능)는 보안 위험
  - PostgreSQL 내장 한국어 전문 검색 설정이 없으므로 `simple` 설정 + trigram(`pg_trgm`) 병행 전략 채택

## Research Log

### Supabase UUID 기본 키 전략
- **Context**: 요구사항 7.5에서 모든 테이블에 UUID 기반 기본 키 사용을 요구
- **Sources Consulted**: [Choosing a Postgres Primary Key - Supabase Blog](https://supabase.com/blog/choosing-a-postgres-primary-key), [uuid-ossp Supabase Docs](https://supabase.com/docs/guides/database/extensions/uuid-ossp)
- **Findings**:
  - `gen_random_uuid()`는 PostgreSQL 네이티브 함수로 별도 확장 불필요
  - UUIDv4 기반으로 MAC 주소 등 민감 정보를 노출하지 않음
  - 분산 시스템에서 키 충돌 없이 수평 확장 가능
- **Implications**: 모든 테이블의 `id` 컬럼에 `uuid DEFAULT gen_random_uuid() PRIMARY KEY` 적용

### PostgreSQL Full-Text Search 한국어 지원
- **Context**: 요구사항 5.1에서 스킬 이름/설명에 전문 검색 지원 요구
- **Sources Consulted**: [Full Text Search - Supabase Docs](https://supabase.com/docs/guides/database/full-text-search), [pg_cjk_parser GitHub](https://github.com/huangjimmy/pg_cjk_parser)
- **Findings**:
  - PostgreSQL 내장 텍스트 검색은 한국어 형태소 분석을 지원하지 않음
  - `simple` 설정은 공백 기준 토큰화만 수행하여 한국어 조사/어미 처리 불가
  - `pg_cjk_parser`는 CJK 2-gram 토큰화를 지원하지만 Supabase 호스팅 환경에서 커스텀 파서 설치 제약
  - Generated Column + GIN 인덱스 패턴이 Supabase 권장 방식
- **Implications**:
  - 1단계: `simple` 설정의 tsvector Generated Column + GIN 인덱스로 기본 전문 검색 구현
  - 2단계: `pg_trgm` 확장의 trigram 인덱스를 LIKE/ILIKE 검색 보조 수단으로 병행
  - 향후 한국어 형태소 분석 필요 시 외부 검색 엔진(Elasticsearch 등) 연동 검토

### Supabase RLS 정책 패턴
- **Context**: 요구사항 8에서 Row Level Security를 통한 접근 제어 요구
- **Sources Consulted**: [Row Level Security - Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security), [Custom Claims & RBAC - Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- **Findings**:
  - `anon` 역할: 인증되지 않은 요청에 매핑
  - `authenticated` 역할: 로그인한 사용자 요청에 매핑
  - `auth.uid()`: 인증된 사용자의 UUID 반환, 미인증 시 `NULL`
  - `auth.jwt() -> 'app_metadata' ->> 'user_role'`: 관리자 역할 확인의 안전한 방법
  - `raw_user_meta_data`는 사용자가 변경 가능하므로 권한 제어에 사용 금지
  - RLS 정책에 사용되는 컬럼에 인덱스 추가 시 100배 이상 성능 개선 가능
- **Implications**:
  - 모든 테이블에 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` 적용
  - 관리자 확인은 `app_metadata.user_role = 'admin'` 패턴 사용
  - `author_id` 컬럼에 인덱스 추가하여 RLS 정책 성능 최적화

### Supabase tsvector Generated Column 패턴
- **Context**: 전문 검색 인덱스 자동 갱신 메커니즘 조사
- **Sources Consulted**: [Full Text Search - Supabase Docs](https://supabase.com/docs/guides/database/full-text-search)
- **Findings**:
  - PostgreSQL Generated Column은 소스 컬럼 변경 시 자동으로 tsvector 갱신
  - `STORED` 키워드로 물리적 저장, 쿼리 시 재계산 불필요
  - GIN 인덱스와 결합하여 빠른 전문 검색 가능
  - Generated Column은 `IMMUTABLE` 함수만 사용 가능하므로 `to_tsvector`를 래핑하는 immutable 함수 필요할 수 있음
- **Implications**: `skills` 테이블에 `fts` Generated Column 추가, `name`과 `summary` 결합

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| DDD 3계층 + Supabase | domain(엔티티/VO/리포지토리 인터페이스) + infrastructure(Supabase 구현체) | 기존 프로젝트 아키텍처와 일관성, 도메인 순수성 유지 | Supabase MCP 직접 조작과 리포지토리 패턴 간 경계 모호 | 스티어링 원칙 준수, 기존 Entity/ValueObject 베이스 클래스 활용 |
| Raw SQL + Supabase MCP | SQL 마이그레이션 파일로 스키마 관리, MCP로 직접 DB 조작 | 단순성, Supabase 네이티브 워크플로우 | 도메인 로직이 인프라에 누출 가능 | tech.md에 Supabase MCP 결정 기록됨 |
| Hybrid 접근 | SQL 마이그레이션으로 스키마 정의 + TypeScript 도메인 모델로 비즈니스 로직 캡슐화 | 두 장점을 모두 취함, 테스트 용이 | 초기 구현 비용 약간 증가 | 채택 |

## Design Decisions

### Decision: Hybrid SQL Migration + TypeScript Domain Model
- **Context**: DB 스키마를 Supabase PostgreSQL에 구현하면서 DDD 원칙을 준수해야 함
- **Alternatives Considered**:
  1. SQL 마이그레이션만 사용 -- 도메인 모델 없이 직접 DB 조작
  2. ORM(Prisma 등) 기반 -- tech.md에서 명시적으로 제외됨
  3. Hybrid 접근 -- SQL 마이그레이션 + TypeScript 도메인 모델
- **Selected Approach**: Hybrid 접근. SQL 마이그레이션 파일로 물리적 스키마를 정의하고, TypeScript 도메인 계층에서 엔티티/값 객체/리포지토리 인터페이스를 정의
- **Rationale**: 기존 `Entity`, `ValueObject` 베이스 클래스가 이미 구현되어 있고, 스티어링 원칙에서 DDD 3계층 분리를 요구. Supabase MCP는 인프라 계층의 리포지토리 구현체에서 활용
- **Trade-offs**: 초기 구현 비용이 약간 증가하지만 테스트 용이성과 도메인 로직 순수성 확보
- **Follow-up**: 리포지토리 구현체에서 Supabase 클라이언트 사용 패턴 검증 필요

### Decision: simple 설정 + pg_trgm 병행 전문 검색
- **Context**: 한국어 콘텐츠 전문 검색이 필요하나 PostgreSQL 내장 한국어 지원 부재
- **Alternatives Considered**:
  1. `english` 설정 tsvector -- 한국어 토큰화 불가
  2. `simple` 설정 tsvector -- 공백 기준 토큰화, 기본적 검색 가능
  3. 외부 검색 엔진(Elasticsearch) -- 과도한 인프라 복잡성
  4. `simple` + `pg_trgm` 병행 -- 기본 전문 검색 + 부분 문자열 매칭
- **Selected Approach**: `simple` 설정 tsvector Generated Column + `pg_trgm` trigram 인덱스 병행
- **Rationale**: Supabase 호스팅에서 사용 가능한 방법 중 최선. `simple`은 공백 기준 토큰화로 한국어 단어 단위 검색 지원, `pg_trgm`은 부분 문자열 매칭으로 보완
- **Trade-offs**: 형태소 분석 기반 정밀 검색은 불가하지만, MVP 단계에서 충분한 수준
- **Follow-up**: 사용자 피드백에 따라 외부 검색 엔진 연동 검토

### Decision: app_metadata 기반 관리자 역할 확인
- **Context**: RLS 정책에서 관리자 역할을 안전하게 확인해야 함
- **Alternatives Considered**:
  1. `user_metadata.role` 확인 -- 사용자가 변경 가능하여 보안 위험
  2. `app_metadata.user_role` 확인 -- 서버 측에서만 변경 가능
  3. 별도 roles 테이블 + 조인 -- 추가 복잡성
- **Selected Approach**: `auth.jwt() -> 'app_metadata' ->> 'user_role' = 'admin'` 패턴
- **Rationale**: Supabase 공식 권장 방식, `app_metadata`는 서버 측에서만 변경 가능하여 안전
- **Trade-offs**: 역할 변경 시 JWT 갱신 필요 (세션 만료 대기 또는 강제 갱신)
- **Follow-up**: 관리자 역할 부여 프로세스는 User Account 바운디드 컨텍스트에서 처리

## Risks & Mitigations
- 한국어 전문 검색 정밀도 부족 -- `pg_trgm` trigram 인덱스로 부분 매칭 보완, 향후 외부 검색 엔진 연동 옵션 보유
- RLS 정책 성능 저하 -- 정책에서 참조하는 컬럼(`author_id`, `status`)에 인덱스 추가
- Generated Column 제약 -- `IMMUTABLE` 함수만 사용 가능, `to_tsvector` 래핑 함수 필요 시 별도 생성
- Supabase 호스팅 환경 제약 -- 커스텀 PostgreSQL 확장 설치 불가, 내장 확장(`pg_trgm`)만 활용

## References
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) -- RLS 정책 패턴 및 auth 함수
- [Supabase Full Text Search Docs](https://supabase.com/docs/guides/database/full-text-search) -- tsvector, GIN 인덱스, Generated Column 패턴
- [Supabase Custom Claims & RBAC Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) -- app_metadata 기반 역할 관리
- [Choosing a Postgres Primary Key - Supabase Blog](https://supabase.com/blog/choosing-a-postgres-primary-key) -- UUID vs 기타 PK 전략
- [pg_cjk_parser GitHub](https://github.com/huangjimmy/pg_cjk_parser) -- CJK 전문 검색 파서 (참고)
- [PostgreSQL Text Search Indexes Docs](https://www.postgresql.org/docs/current/textsearch-indexes.html) -- GIN 인덱스 공식 문서
