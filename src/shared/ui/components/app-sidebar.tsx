"use client";

import { CategoryNav } from "./category-nav";
import { SearchInput } from "./search-input";
import type { CategorySelection } from "../types/dashboard";

interface AppSidebarProps {
  readonly selectedCategory: CategorySelection;
  readonly onCategoryChange: (category: CategorySelection) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly isMobileMenuOpen: boolean;
}

export function AppSidebar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  isMobileMenuOpen,
}: AppSidebarProps) {
  return (
    <nav
      aria-label="메인 내비게이션"
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <h1 className="text-lg font-bold">Eluo Skill Hub</h1>
      </div>
      <div className="p-4">
        <SearchInput value={searchQuery} onChange={onSearchChange} />
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <CategoryNav
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>
    </nav>
  );
}
