'use client';

import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'grid' | 'table';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export type { ViewMode };

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center shrink-0">
      <button
        type="button"
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-l-lg border border-r-0 border-slate-200 transition-colors ${viewMode === 'grid'
          ? 'bg-[#000080] text-white border-[#000080]'
          : 'bg-white text-slate-400 hover:text-slate-600'
          }`}
        aria-label="그리드 뷰"
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('table')}
        className={`p-2 rounded-r-lg border border-slate-200 transition-colors ${viewMode === 'table'
          ? 'bg-[#000080] text-white border-[#000080]'
          : 'bg-white text-slate-400 hover:text-slate-600'
          }`}
        aria-label="테이블 뷰"
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
