'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { SkillStatusFilter } from '@/admin/domain/types';

interface SkillStatusFilterProps {
  currentStatus: SkillStatusFilter;
}

const TABS: { label: string; value: SkillStatusFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '배포됨', value: 'published' },
  { label: '초안', value: 'drafted' },
];

export default function SkillStatusFilterTabs({ currentStatus }: SkillStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = useCallback(
    (value: SkillStatusFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all') {
        params.delete('status');
      } else {
        params.set('status', value);
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => handleClick(tab.value)}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            currentStatus === tab.value
              ? 'bg-[#000080] text-white'
              : 'text-slate-500 hover:text-[#000080]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
