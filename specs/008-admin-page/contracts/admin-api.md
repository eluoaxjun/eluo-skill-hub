# Admin API Contracts

**Feature Branch**: `008-admin-page`
**Date**: 2026-03-04

> 이 피처는 Server Component에서 직접 Supabase 쿼리를 실행하므로 별도 REST API 엔드포인트를 생성하지 않는다.
> 아래는 도메인 계층의 인터페이스 계약(TypeScript interface)을 정의한다.

## Domain Types (`src/admin/domain/types.ts`)

### AdminRepository Interface

```typescript
interface AdminRepository {
  getDashboardStats(): Promise<DashboardStats>;
  getRecentSkills(limit: number): Promise<RecentSkill[]>;
  getRecentMembers(limit: number): Promise<RecentMember[]>;
  getMembers(page: number, pageSize: number): Promise<PaginatedResult<MemberRow>>;
  getSkills(page: number, pageSize: number): Promise<PaginatedResult<SkillRow>>;
  getFeedbacks(page: number, pageSize: number): Promise<PaginatedResult<FeedbackRow>>;
}
```

### Value Objects

```typescript
interface DashboardStats {
  readonly totalMembers: number;
  readonly totalSkills: number;
  readonly totalFeedbacks: number;
}

interface RecentSkill {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly categoryName: string;
  readonly createdAt: string;
}

interface RecentMember {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly roleName: string;
  readonly createdAt: string;
}

interface MemberRow {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly roleName: string;
  readonly createdAt: string;
  readonly status: 'active' | 'pending';
}

interface SkillRow {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly categoryName: string;
  readonly status: 'active' | 'inactive';
  readonly createdAt: string;
}

interface FeedbackRow {
  readonly id: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly userName: string;
  readonly skillTitle: string;
  readonly createdAt: string;
}

interface PaginatedResult<T> {
  readonly data: T[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
```

### Use Case Contracts

```typescript
// 각 Use Case는 단일 메서드 execute()를 가진다

interface GetDashboardStatsUseCase {
  execute(): Promise<DashboardStats>;
}

interface GetMembersUseCase {
  execute(page: number, pageSize: number): Promise<PaginatedResult<MemberRow>>;
}

interface GetSkillsUseCase {
  execute(page: number, pageSize: number): Promise<PaginatedResult<SkillRow>>;
}

interface GetFeedbacksUseCase {
  execute(page: number, pageSize: number): Promise<PaginatedResult<FeedbackRow>>;
}
```

## Route Structure

| Route | Method | Auth | Role | Description |
|-------|--------|------|------|-------------|
| `/admin` | GET (Page) | Required | admin | 대시보드 (요약 카드 + 최근 목록) |
| `/admin/members` | GET (Page) | Required | admin | 회원 목록 (페이지네이션) |
| `/admin/skills` | GET (Page) | Required | admin | 스킬 목록 (페이지네이션) |
| `/admin/feedbacks` | GET (Page) | Required | admin | 피드백 목록 (페이지네이션) |

## Data Flow

```
Browser Request
  → Next.js Middleware (proxy.ts): 비인증 → /signin 리다이렉트
  → Server Component (layout.tsx): role 확인
    → admin: children 렌더링
    → user: AccessDenied 컴포넌트 렌더링
  → Server Component (page.tsx): Use Case 실행 → Supabase 쿼리 (RLS 적용)
  → HTML Response
```
