# Server Action Contract: deleteSkill

**Feature Branch**: `014-skill-delete`
**Date**: 2026-03-04

## deleteSkill

**Location**: `src/app/admin/skills/actions.ts`
**Type**: Next.js Server Action

### Signature

```typescript
export async function deleteSkill(skillId: string): Promise<DeleteSkillResult>
```

### Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| skillId | `string` | Yes | 삭제 대상 스킬의 UUID |

### Output

```typescript
// 성공
{ success: true }

// 실패
{ success: false; error: string }
```

### Error Cases

| Error | Condition | Message |
|-------|-----------|---------|
| 권한 없음 | 호출자가 admin이 아닌 경우 | `"권한이 없습니다"` |
| 유효하지 않은 ID | `skillId`가 빈 문자열인 경우 | `"스킬 ID가 필요합니다"` |
| 스킬 미존재 | 해당 ID의 스킬이 없는 경우 | `"스킬을 찾을 수 없습니다"` |
| 삭제 실패 | DB 또는 Storage 오류 | `"스킬 삭제 중 오류가 발생했습니다"` |

### Authorization

- Server-side admin 권한 검증 (`verifyAdmin()`)
- RLS 정책에 의한 추가 보호

### Side Effects

1. `skill_feedback_logs` 레코드 삭제 (해당 skill_id)
2. `skill_templates` 레코드 삭제 (해당 skill_id)
3. Supabase Storage 파일 삭제 (`skill-descriptions`, `skill-templates` 버킷)
4. `skills` 레코드 삭제
5. `revalidatePath('/admin/skills')` 호출로 목록 캐시 무효화

## AdminRepository Interface Addition

### deleteSkill

```typescript
interface AdminRepository {
  // ... existing methods
  deleteSkill(skillId: string): Promise<DeleteSkillResult>;
}
```

### Implementation Notes

- 자식 레코드 먼저 삭제 후 부모 레코드 삭제 (FK 제약 조건 준수)
- Storage 파일 삭제 실패 시에도 DB 삭제는 계속 진행 (고아 파일 발생 가능하나 데이터 무결성 우선)
- 존재하지 않는 스킬 삭제 시도 시 에러 반환
