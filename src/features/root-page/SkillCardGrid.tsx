'use client';

import { useState } from 'react';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { toggleBookmarkAction } from '@/app/actions/bookmarkActions';
import type { SkillViewModel } from './types';

interface SkillCardGridProps {
  skills: SkillViewModel[];
  initialBookmarkedIds: string[];
  title?: string;
}

export function SkillCardGrid({ skills, initialBookmarkedIds, title }: SkillCardGridProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillViewModel | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(initialBookmarkedIds);

  const handleCardClick = (skill: SkillViewModel) => {
    setSelectedSkill(skill);
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  const handleToggleBookmark = async (skillId: string) => {
    // 낙관적 업데이트
    const isCurrentlyBookmarked = bookmarkedIds.includes(skillId);
    if (isCurrentlyBookmarked) {
      setBookmarkedIds((prev) => prev.filter((id) => id !== skillId));
    } else {
      setBookmarkedIds((prev) => [...prev, skillId]);
    }

    try {
      await toggleBookmarkAction(skillId);
    } catch {
      // 실패 시 롤백
      if (isCurrentlyBookmarked) {
        setBookmarkedIds((prev) => [...prev, skillId]);
      } else {
        setBookmarkedIds((prev) => prev.filter((id) => id !== skillId));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill, index) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            index={index}
            isBookmarked={bookmarkedIds.includes(skill.id)}
            onClick={handleCardClick}
          />
        ))}
      </div>
      {skills.length > 0 && (
        <div className="mt-12 text-center">
          <button className="px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors">
            더 많은 결과 보기
          </button>
        </div>
      )}
      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          isBookmarked={bookmarkedIds.includes(selectedSkill.id)}
          onClose={handleCloseModal}
          onToggleBookmark={handleToggleBookmark}
        />
      )}
    </div>
  );
}
