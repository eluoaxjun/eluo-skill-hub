'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart';
import type { UserBehaviorData } from '@/event-log/domain/types';

interface UserBehaviorSectionProps {
  data: UserBehaviorData;
}

const sidebarChartConfig = {
  clickCount: {
    label: '클릭 수',
    color: '#000080',
  },
} satisfies ChartConfig;

export default function UserBehaviorSection({ data }: UserBehaviorSectionProps) {
  if (data.sidebarClicks.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 flex items-center justify-center min-h-[200px]"
        style={{ background: 'rgba(0,0,128,0.05)', border: '1px solid rgba(0,0,128,0.1)' }}
      >
        <p className="text-[#000080]/40 font-medium">선택한 기간에 사용자 행동 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'rgba(0,0,128,0.05)', border: '1px solid rgba(0,0,128,0.1)' }}
    >
      <h3 className="text-lg font-bold text-[#000080] mb-4">사이드바 탭별 클릭 분포</h3>
      <ChartContainer config={sidebarChartConfig} className="h-[250px] w-full">
        <BarChart data={data.sidebarClicks as { tab: string; clickCount: number }[]} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,128,0.1)" />
          <XAxis dataKey="tab" stroke="rgba(0,0,128,0.4)" fontSize={12} />
          <YAxis stroke="rgba(0,0,128,0.4)" fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="clickCount" fill="var(--color-clickCount)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
