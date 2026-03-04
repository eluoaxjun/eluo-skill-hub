'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/shared/ui/input';

interface MemberSearchProps {
  defaultValue?: string;
}

export default function MemberSearch({ defaultValue = '' }: MemberSearchProps) {
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
    <Input
      type="search"
      placeholder="이름 또는 이메일로 검색"
      value={value}
      onChange={handleChange}
      className="max-w-xs"
      aria-label="회원 검색"
    />
  );
}
