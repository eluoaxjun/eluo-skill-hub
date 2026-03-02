import type { SupabaseClient } from '@supabase/supabase-js';
import type { MemberRepository } from '@/admin/application/ports/MemberRepository';
import { MemberProfile } from '@/admin/domain/entities/MemberProfile';

export class SupabaseMemberRepository implements MemberRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<MemberProfile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, email, created_at, role_id, roles(id, name)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => {
      const rolesData = row.roles as unknown;
      let roleId = row.role_id as string ?? '';
      let roleName = '';

      if (Array.isArray(rolesData)) {
        const first = rolesData[0] as { id: string; name: string } | undefined;
        if (first) {
          roleId = first.id;
          roleName = first.name;
        }
      } else if (rolesData && typeof rolesData === 'object' && 'name' in rolesData) {
        const roleObj = rolesData as { id: string; name: string };
        roleId = roleObj.id;
        roleName = roleObj.name;
      }

      return MemberProfile.create({
        id: row.id as string,
        email: row.email as string ?? '',
        roleId,
        roleName,
        createdAt: new Date(row.created_at as string),
      });
    });
  }

  async updateRole(memberId: string, newRoleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ role_id: newRoleId })
      .eq('id', memberId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async findAllRoles(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('id, name')
      .order('name');

    if (error || !data) {
      return [];
    }

    return data as Array<{ id: string; name: string }>;
  }
}
