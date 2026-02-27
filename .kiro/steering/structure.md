# Project Structure

## Organization Philosophy

DDD(Domain-Driven Design) 기반 **바운디드 컨텍스트별 모듈 분리** 구조를 따른다.
각 모듈은 domain → application → infrastructure 3계층으로 구성되며,
의존성은 항상 바깥(infrastructure)에서 안쪽(domain)으로만 향한다.

## Directory Patterns

### Bounded Context Module
**Location**: `src/{context-name}/`
**Purpose**: 바운디드 컨텍스트별 비즈니스 로직과 인프라 코드
**Example**:
```
src/skill-catalog/
  domain/       # 엔티티, 값 객체, 리포지토리 인터페이스, 도메인 이벤트
  application/  # 유스케이스, DTO, 커맨드/쿼리
  infrastructure/  # 리포지토리 구현체, 외부 서비스 어댑터
```

### Shared Module
**Location**: `src/shared/`
**Purpose**: 바운디드 컨텍스트 간 공유되는 기반 코드
**Example**:
```
src/shared/
  domain/
    types/     # Entity, ValueObject 베이스 클래스
    events/    # DomainEvent 인터페이스
  infrastructure/
    supabase/  # Supabase 클라이언트 싱글톤
```

### Next.js App Layer
**Location**: `src/app/`
**Purpose**: 라우팅, 레이아웃, 페이지 컴포넌트 (UI 진입점)
**Example**:
```
src/app/
  page.tsx       # 메인 페이지
  layout.tsx     # 루트 레이아웃
  globals.css    # 전역 스타일
  {route}/       # 페이지별 라우트
```

## Naming Conventions

- **Files (Domain)**: PascalCase — `Skill.ts`, `SkillRepository.ts`, `CreateSkillUseCase.ts`
- **Files (UI)**: kebab-case — `skill-card.tsx`, `skill-list.tsx`
- **Directories**: kebab-case — `skill-catalog/`, `user-account/`
- **Entities**: PascalCase — `Skill`, `SkillVersion`
- **Value Objects**: PascalCase — `SkillId`, `SemanticVersion`
- **Use Cases**: PascalCase + UseCase 접미사 — `SearchSkillsUseCase`
- **Repositories**: PascalCase + Repository 접미사 — `SkillRepository`

## Import Organization

```typescript
// 1. 외부 라이브러리
import { createClient } from '@supabase/supabase-js';

// 2. shared 모듈 (절대 경로)
import { Entity } from '@/shared/domain/types/Entity';
import type { DomainEvent } from '@/shared/domain/events/DomainEvent';

// 3. 같은 컨텍스트 내 모듈 (상대 경로)
import { Skill } from '../domain/Skill';
```

**Path Aliases**:
- `@/`: `./src/` 매핑 (tsconfig.json paths 설정)

## Code Organization Principles

1. **도메인 순수성**: `domain/` 계층은 외부 라이브러리 import 금지 (순수 TypeScript만)
2. **Aggregate Root**: 데이터 변경은 반드시 Aggregate Root를 통해서만 수행
3. **의존성 역전**: 리포지토리 인터페이스는 `domain/`에, 구현체는 `infrastructure/`에 위치
4. **컨텍스트 격리**: 바운디드 컨텍스트 간 직접 import 금지, 도메인 이벤트로 통신

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
