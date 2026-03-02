import React, { Suspense } from "react";
import { Sidebar } from "@/shared/ui/Sidebar";
import { Header } from "@/shared/ui/Header";

interface DashboardLayoutUser {
  email?: string;
  avatarUrl?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: DashboardLayoutUser;
  categories: CategoryItem[];
}

export function DashboardLayout({ children, user, categories }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={null}>
        <Sidebar categories={categories} />
      </Suspense>
      <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <Header user={user} />
        {children}
      </main>
    </div>
  );
}
