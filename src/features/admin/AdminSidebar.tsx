"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AutoAwesomeIcon } from "@/shared/ui/icons";

interface AdminNavItem {
  label: string;
  href: string;
}

const ADMIN_MENU: AdminNavItem[] = [
  { label: "회원관리", href: "/admin/members" },
  { label: "스킬관리", href: "/admin/skills" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shrink-0">
      {/* Logo area */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <AutoAwesomeIcon size={24} />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">AI 스킬 허브</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">
              어드민
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          관리
        </div>
        {ADMIN_MENU.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
                  : "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              }
            >
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
