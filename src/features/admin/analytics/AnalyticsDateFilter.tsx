'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import type { DateRange } from 'react-day-picker';
import type { AnalyticsDateRange } from '@/event-log/domain/types';

const PRESETS = [
  { label: '오늘', value: 'today' },
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
] as const;

type PresetValue = (typeof PRESETS)[number]['value'];

function getPresetRange(preset: PresetValue): AnalyticsDateRange {
  const now = new Date();
  const end = endOfDay(now);
  switch (preset) {
    case 'today':
      return { startDate: startOfDay(now).toISOString(), endDate: end.toISOString() };
    case '7d':
      return { startDate: startOfDay(subDays(now, 6)).toISOString(), endDate: end.toISOString() };
    case '30d':
      return { startDate: startOfDay(subDays(now, 29)).toISOString(), endDate: end.toISOString() };
  }
}

export function parseSearchParamsToRange(searchParams: URLSearchParams): AnalyticsDateRange {
  const preset = searchParams.get('preset') as PresetValue | null;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (startDate && endDate) {
    return { startDate, endDate };
  }

  return getPresetRange(preset ?? '7d');
}

interface AnalyticsDateFilterProps {
  range: AnalyticsDateRange;
}

export default function AnalyticsDateFilter({ range }: AnalyticsDateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPreset = searchParams.get('preset') ?? '7d';

  const updateParams = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => newParams.set(key, val));
      router.push(`/admin/analytics?${newParams.toString()}`);
    },
    [router],
  );

  const handlePreset = useCallback(
    (preset: PresetValue) => {
      updateParams({ preset });
    },
    [updateParams],
  );

  const handleDateRangeChange = useCallback(
    (dateRange: DateRange | undefined) => {
      if (dateRange?.from && dateRange?.to) {
        updateParams({
          startDate: startOfDay(dateRange.from).toISOString(),
          endDate: endOfDay(dateRange.to).toISOString(),
        });
      }
    },
    [updateParams],
  );

  const isCustom = searchParams.has('startDate');
  const fromDate = new Date(range.startDate);
  const toDate = new Date(range.endDate);

  return (
    <div className="flex items-center gap-2">
      {PRESETS.map(({ label, value }) => (
        <Button
          key={value}
          variant={!isCustom && currentPreset === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset(value)}
          className={
            !isCustom && currentPreset === value
              ? 'bg-[#000080] text-white hover:bg-[#000080]/90'
              : 'text-[#000080]/70 border-[#000080]/20 hover:bg-[#000080]/5'
          }
        >
          {label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? 'default' : 'outline'}
            size="sm"
            className={
              isCustom
                ? 'bg-[#000080] text-white hover:bg-[#000080]/90'
                : 'text-[#000080]/70 border-[#000080]/20 hover:bg-[#000080]/5'
            }
          >
            <CalendarIcon className="size-4" />
            {isCustom
              ? `${format(fromDate, 'MM.dd', { locale: ko })} - ${format(toDate, 'MM.dd', { locale: ko })}`
              : '기간 선택'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: fromDate, to: toDate }}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
