'use client';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoading?: boolean;
}

export default function LoadMoreButton({ onLoadMore, isLoading }: LoadMoreButtonProps) {
  return (
    <div className="mt-16 text-center">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="px-10 py-4 bg-white border border-slate-200 hover:border-[#00007F]/30 hover:bg-slate-50 rounded-2xl text-sm font-bold text-[#00007F] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '불러오는 중...' : '더 많은 스킬 보기'}
      </button>
    </div>
  );
}
