import React from "react";
import { Toaster } from "sonner";
import { createClient } from "@/shared/infrastructure/supabase/server";
import { SupabaseAdminRepository } from "@/admin/infrastructure/SupabaseAdminRepository";
import { GetUserRoleUseCase } from "@/admin/application/GetUserRoleUseCase";
import { UnauthorizedPage } from "@/features/admin/UnauthorizedPage";
import { AdminSidebar } from "@/features/admin/AdminSidebar";
import { Header } from "@/shared/ui/Header";
import { AdminBreadcrumb } from "@/features/admin/AdminBreadcrumb";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <UnauthorizedPage />;
  }

  const adminRepository = new SupabaseAdminRepository(supabase);
  const getUserRoleUseCase = new GetUserRoleUseCase(adminRepository);
  const { isAdmin } = await getUserRoleUseCase.execute(user.id);

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster position="top-right" richColors />
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <Header
          user={{
            email: user.email,
            avatarUrl: user.user_metadata?.avatar_url as string | undefined,
          }}
          breadcrumb={<AdminBreadcrumb />}
        />
        {children}
      </main>
    </div>
  );
}
