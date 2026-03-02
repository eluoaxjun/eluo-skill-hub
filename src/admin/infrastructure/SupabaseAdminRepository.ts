import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRepository } from "@/admin/application/ports/AdminRepository";

export class SupabaseAdminRepository implements AdminRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("role_id, roles(name)")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    const rolesData = data.roles as unknown;
    if (Array.isArray(rolesData)) {
      const first = rolesData[0] as { name: string } | undefined;
      return first?.name ?? null;
    }
    if (rolesData && typeof rolesData === "object" && "name" in rolesData) {
      return (rolesData as { name: string }).name;
    }
    return null;
  }
}
