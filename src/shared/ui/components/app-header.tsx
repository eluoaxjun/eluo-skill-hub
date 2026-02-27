"use client";

import { Menu, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SearchInput } from "./search-input";

interface AppHeaderProps {
  readonly pageTitle: string;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly isMobile: boolean;
  readonly onToggleMobileMenu: () => void;
}

export function AppHeader({
  pageTitle,
  searchQuery,
  onSearchChange,
  isMobile,
  onToggleMobileMenu,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="메뉴 열기"
            className="rounded-md p-2 hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h2 className="text-lg font-semibold">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-3">
        {!isMobile && (
          <div className="w-64">
            <SearchInput value={searchQuery} onChange={onSearchChange} />
          </div>
        )}
        <ThemeToggle />
        <div
          data-testid="user-profile"
          className="flex items-center justify-center rounded-full bg-muted h-8 w-8"
        >
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
