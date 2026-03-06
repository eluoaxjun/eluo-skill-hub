'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/shared/ui/chart';
import type { DailyTrendItem } from '@/event-log/domain/types';

interface DailyTrendChartProps {
  data: readonly DailyTrendItem[];
}

const chartConfig = {
  skillViews: {
    label: '스킬 조회',
    color: '#000080',
  },
  templateDownloads: {
    label: '템플릿 다운로드',
    color: '#10b981',
  },
} satisfies ChartConfig;

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split('-');
  return `${month}.${day}`;
}

export default function DailyTrendChart({ data }: DailyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 flex items-center justify-center min-h-[300px]"
        style={{ background: 'rgba(0,0,128,0.05)', border: '1px solid rgba(0,0,128,0.1)' }}
      >
        <p className="text-[#000080]/40 font-medium">선택한 기간에 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'rgba(0,0,128,0.05)', border: '1px solid rgba(0,0,128,0.1)' }}
    >
      <h3 className="text-lg font-bold text-[#000080] mb-4">일별 추이</h3>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <LineChart data={data as DailyTrendItem[]} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,128,0.1)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="rgba(0,0,128,0.4)"
            fontSize={12}
          />
          <YAxis stroke="rgba(0,0,128,0.4)" fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="skillViews"
            stroke="var(--color-skillViews)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="templateDownloads"
            stroke="var(--color-templateDownloads)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
