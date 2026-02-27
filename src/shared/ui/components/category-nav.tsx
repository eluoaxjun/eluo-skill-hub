"use client";

import { CATEGORIES } from "../data/categories";
import type { CategorySelection } from "../types/dashboard";

interface CategoryNavProps {
  readonly selectedCategory: CategorySelection;
  readonly onCategoryChange: (category: CategorySelection) => void;
}

export function CategoryNav({
  selectedCategory,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <ul className="space-y-1">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;
        return (
          <li key={category.id}>
            <button
              onClick={() => onCategoryChange(category.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
