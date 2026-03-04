'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SkillSearchProps {
  defaultValue?: string;
}

export default function SkillSearch({ defaultValue = '' }: SkillSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setValue(next);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (next) {
          params.set('q', next);
        } else {
          params.delete('q');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
      }, 300);
    },
    [router, searchParams],
  );

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="search"
        placeholder="스킬명 또는 설명으로 검색"
        value={value}
        onChange={handleChange}
        aria-label="스킬 검색"
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#000080] focus:border-[#000080] outline-none transition-all"
      />
    </div>
  );
}
