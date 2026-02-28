import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRepository, DashboardStats } from '@/user-account/domain/UserRepository';
import { UserProfile } from '@/user-account/domain/UserProfile';
import { UserRole } from '@/user-account/domain/UserRole';

interface ProfileRow {
  id: string;
  email: string;
  role_id: string;
  created_at: string;
  roles: { id: string; name: string };
}

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabaseClient
      .from('profiles')
      .select('*, roles(id, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as ProfileRow;
    return UserProfile.reconstruct(row.id, {
      email: row.email,
      role: UserRole.create(row.roles.id, row.roles.name),
      createdAt: new Date(row.created_at),
    });
  }

  async update(profile: UserProfile): Promise<void> {
    const { error } = await this.supabaseClient
      .from('profiles')
      .update({
        email: profile.email,
        role_id: profile.role.id,
      })
      .eq('id', profile.id);

    if (error) {
      throw new Error(`프로필 수정에 실패했습니다: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabaseClient
      .from('profiles')
      .select('*, roles(id, name)')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as ProfileRow;
    return UserProfile.reconstruct(row.id, {
      email: row.email,
      role: UserRole.create(row.roles.id, row.roles.name),
      createdAt: new Date(row.created_at),
    });
  }

  async findAll(): Promise<ReadonlyArray<UserProfile>> {
    const { data, error } = await this.supabaseClient
      .from('profiles')
      .select('*, roles(id, name)');

    if (error) {
      throw new Error(`사용자 목록 조회에 실패했습니다: ${error.message}`);
    }

    const rows = (data || []) as ProfileRow[];
    return rows.map((row) =>
      UserProfile.reconstruct(row.id, {
        email: row.email,
        role: UserRole.create(row.roles.id, row.roles.name),
        createdAt: new Date(row.created_at),
      })
    );
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data, error } = await this.supabaseClient
      .from('profiles')
      .select('roles(name)');

    if (error) {
      throw new Error(`대시보드 통계 조회에 실패했습니다: ${error.message}`);
    }

    const rows = (data || []) as Array<{ roles: { name: string } }>;
    const adminCount = rows.filter((r) => r.roles.name === 'admin').length;

    return {
      totalUsers: rows.length,
      adminCount,
      userCount: rows.length - adminCount,
    };
  }

  async findAllRoles(): Promise<ReadonlyArray<UserRole>> {
    const { data, error } = await this.supabaseClient
      .from('roles')
      .select('id, name');

    if (error) {
      throw new Error(`역할 목록 조회에 실패했습니다: ${error.message}`);
    }

    const rows = (data || []) as Array<{ id: string; name: string }>;
    return rows.map((row) => UserRole.create(row.id, row.name));
  }
}
