import React from "react";
import {
  ChevronRightIcon,
  NotificationsIcon,
} from "@/shared/ui/icons";
import { ProfileDropdown } from "@/shared/ui/ProfileDropdown";

interface HeaderUser {
  email?: string;
  avatarUrl?: string;
}

interface HeaderProps {
  user?: HeaderUser;
  breadcrumb?: React.ReactNode;
}

export function Header({ user, breadcrumb }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
      {/* Breadcrumb */}
      {breadcrumb ?? (
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-sm font-medium">마켓플레이스</span>
          <ChevronRightIcon size={16} />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            추천 스킬
          </span>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <a
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#"
          >
            탐색하기
          </a>
          <a
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#"
          >
            인기 스킬
          </a>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6">
          <button
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
            aria-label="notifications"
          >
            <NotificationsIcon size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>
          <ProfileDropdown
            email={user?.email || ""}
            avatarUrl={user?.avatarUrl}
          />
        </div>
      </div>
    </header>
  );
}
