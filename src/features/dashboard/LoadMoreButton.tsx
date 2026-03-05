'use client';

import { useDashboardFilter } from './DashboardLayoutClient';

export default function LoadMoreButton() {
  const { filter, setLimit } = useDashboardFilter();

  function handleLoadMore() {
    setLimit(filter.limit + 9);
  }

  return (
    <div className="mt-16 text-center">
      <button
        type="button"
        onClick={handleLoadMore}
        className="px-10 py-4 bg-white border border-slate-200 hover:border-[#00007F]/30 hover:bg-slate-50 rounded-2xl text-sm font-bold text-[#00007F] transition-all shadow-sm"
      >
        더 많은 스킬 보기
      </button>
    </div>
  );
}
