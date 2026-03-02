import type { MemberProfile } from '@/admin/domain/entities/MemberProfile';

export interface MemberRepository {
  findAll(): Promise<MemberProfile[]>;
  updateRole(memberId: string, newRoleId: string): Promise<void>;
  findAllRoles(): Promise<Array<{ id: string; name: string }>>;
}
