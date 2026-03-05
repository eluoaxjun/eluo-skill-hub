'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToggleBookmark } from '@/bookmark/hooks/use-bookmark-mutations';
import { useBookmarkedSkillIds } from '@/bookmark/hooks/use-bookmark-queries';

interface BookmarkButtonProps {
  skillId: string;
  isBookmarked: boolean;
  userId?: string;
}

export default function BookmarkButton({
  skillId,
  isBookmarked: initialIsBookmarked,
  userId,
}: BookmarkButtonProps) {
  const { data: bookmarkedIds } = useBookmarkedSkillIds(userId);
  const { mutate: toggle, isPending } = useToggleBookmark(userId ?? '');

  const isBookmarked = bookmarkedIds ? bookmarkedIds.includes(skillId) : initialIsBookmarked;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    toggle(skillId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || !userId}
      className="absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-colors hover:bg-slate-100"
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      {isBookmarked ? (
        <BookmarkCheck size={18} className="text-[#00007F]" />
      ) : (
        <Bookmark size={18} className="text-slate-400 hover:text-slate-600" />
      )}
    </button>
  );
}
