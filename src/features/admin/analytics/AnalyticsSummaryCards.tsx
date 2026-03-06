'use client';

import { Users, Zap, Download } from 'lucide-react';
import type { AnalyticsOverview } from '@/event-log/domain/types';

interface AnalyticsSummaryCardsProps {
  overview: AnalyticsOverview;
}

const METRICS = [
  { key: 'activeUsers', changeKey: 'activeUsersChange', label: '활성 사용자', icon: Users },
  { key: 'skillViews', changeKey: 'skillViewsChange', label: '스킬 조회', icon: Zap },
  { key: 'templateDownloads', changeKey: 'templateDownloadsChange', label: '템플릿 다운로드', icon: Download },
] as const;

function formatChange(value: number): { text: string; color: string } {
  if (value === 0) return { text: '0%', color: 'text-[#000080]/40' };
  if (value > 0) return { text: `+${value}%`, color: 'text-emerald-600' };
  return { text: `${value}%`, color: 'text-red-500' };
}

export default function AnalyticsSummaryCards({ overview }: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {METRICS.map(({ key, changeKey, label, icon: Icon }) => {
        const value = overview[key];
        const change = formatChange(overview[changeKey]);

        return (
          <div
            key={key}
            className="p-6 rounded-2xl flex flex-col gap-2"
            style={{
              background: 'rgba(0,0,128,0.05)',
              border: '1px solid rgba(0,0,128,0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#000080]/60 font-medium">{label}</span>
              <Icon strokeWidth={2.5} className="size-5 text-[#000080]/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#000080] tracking-tight">
                {value.toLocaleString()}
              </span>
              <span className={`text-sm font-bold ${change.color}`}>{change.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
