# Server Actions Contract: 어드민 회원관리

**Feature Branch**: `009-admin-member-management`
**Date**: 2026-03-04

## updateMemberRole

회원의 역할을 변경하는 Server Action.

**File**: `src/app/admin/members/actions.ts`

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| memberId | string (UUID) | YES | 변경 대상 회원의 프로필 ID |
| roleId | string (UUID) | YES | 새로 할당할 역할의 ID |

### Output

```typescript
type UpdateMemberRoleState = {
  success: boolean;
  error?: string;
}
```

### Validation Rules

1. 요청자가 인증된 사용자이고 admin 역할이어야 한다
2. `memberId`가 유효한 UUID이고 존재하는 프로필이어야 한다
3. `roleId`가 유효한 UUID이고 존재하는 역할이어야 한다
4. 요청자 자신의 역할은 변경할 수 없다 (`memberId !== currentUserId`)
5. 대상이 마지막 admin인 경우 admin이 아닌 역할로 변경 불가

### Error Responses

| Error | Condition |
|-------|-----------|
| "인증되지 않은 사용자입니다" | 세션 없음 또는 비로그인 |
| "관리자 권한이 필요합니다" | 요청자가 admin이 아님 |
| "자기 자신의 역할은 변경할 수 없습니다" | memberId === currentUserId |
| "최소 1명의 관리자가 필요합니다" | 마지막 admin의 역할 변경 시도 |
| "존재하지 않는 회원입니다" | memberId가 유효하지 않음 |
| "존재하지 않는 역할입니다" | roleId가 유효하지 않음 |
| "역할 변경에 실패했습니다" | DB 업데이트 실패 |

## Domain Types (추가/수정)

### AdminRepository Interface (추가 메서드)

```typescript
interface AdminRepository {
  // ... 기존 메서드 유지
  getAllRoles(): Promise<Role[]>;
  updateMemberRole(memberId: string, roleId: string): Promise<void>;
  getAdminCount(): Promise<number>;
  getMemberRole(memberId: string): Promise<string | null>;
}
```

### Role Type (신규)

```typescript
interface Role {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
}
```

### MemberRow (수정)

```typescript
interface MemberRow {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;        // displayName → name으로 변경
  readonly roleName: string;
  readonly roleId: string;             // 신규: 역할 변경 시 필요
  readonly createdAt: string;
  readonly status: 'active' | 'pending';
}
```

### RecentMember (수정)

```typescript
interface RecentMember {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;        // displayName → name으로 변경
  readonly roleName: string;
  readonly createdAt: string;
}
```
