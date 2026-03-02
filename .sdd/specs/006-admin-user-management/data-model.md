# Data Model: 006-admin-user-management

## 1. 사용 DB 테이블 (기존, 변경 없음)

### `profiles`
```sql
id         uuid  PK, FK → auth.users(id)
email      text
created_at timestamptz  DEFAULT now()
role_id    uuid  FK → roles(id)  DEFAULT 'a0000000-0000-0000-0000-000000000002' (user)
```

### `roles`
```sql
id          uuid  PK  DEFAULT gen_random_uuid()
name        text  UNIQUE  -- 'admin' | 'user'
description text  NULLABLE
```

---

## 2. 조회 쿼리

### 회원 전체 목록 조회
```sql
SELECT
  p.id,
  p.email,
  p.created_at,
  r.id   AS role_id,
  r.name AS role_name
FROM profiles p
JOIN roles r ON p.role_id = r.id
ORDER BY p.created_at DESC;
```

- 이름(display name)은 `profiles` 테이블에 없으므로 UI에서 "-"로 표시
- Supabase 클라이언트 쿼리:
  ```ts
  supabase
    .from('profiles')
    .select('id, email, created_at, role_id, roles(id, name)')
    .order('created_at', { ascending: false })
  ```

---

## 3. 역할 변경 쿼리

```sql
UPDATE profiles
SET role_id = :new_role_id
WHERE id = :user_id;
```

- Supabase 클라이언트 쿼리:
  ```ts
  supabase
    .from('profiles')
    .update({ role_id: newRoleId })
    .eq('id', userId)
  ```

**보안 제약:**
- 서버 액션에서 실행 전 현재 로그인 사용자가 `admin`인지 검증
- `userId === currentUserId`인 경우 업데이트 거부 (자기 자신 보호)

---

## 4. 도메인 모델

### Entity: `MemberProfile`

```
MemberProfile
  id: string          (profiles.id)
  email: string       (profiles.email)
  roleId: string      (profiles.role_id)
  roleName: string    (roles.name)
  createdAt: Date     (profiles.created_at)
```

Aggregate Root — `MemberProfile`을 통해서만 역할 변경

**역할 변경 메서드:**
```ts
changeRole(newRole: UserRole): MemberProfile
  // 새 역할로 변경된 새 인스턴스를 반환 (immutable)
```

### Value Object: `UserRole`

```
UserRole
  value: 'admin' | 'user'
```

- 허용 값 이외 입력 시 생성 불가 (가드 포함)

### Repository Port: `MemberRepository`

```ts
interface MemberRepository {
  findAll(): Promise<MemberProfile[]>
  updateRole(memberId: string, roleId: string): Promise<void>
  findRoles(): Promise<Array<{ id: string; name: string }>>
}
```

---

## 5. DTO (UI ↔ Server Action)

### `MemberRow` (UI 테이블 행 타입)
```ts
interface MemberRow {
  id: string
  email: string
  displayName: string       // "-" 고정
  roleId: string
  roleName: string
  createdAt: string         // ISO string (서버→클라이언트 직렬화)
}
```

### `RoleOption` (드롭다운 선택 항목)
```ts
interface RoleOption {
  id: string
  name: string
}
```
