import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  change?: string;
}

export default function SummaryCard({ title, value, icon: Icon, change }: SummaryCardProps) {
  return (
    <div
      className="p-6 rounded-2xl flex flex-col gap-2"
      style={{
        background: 'rgba(0,0,128,0.05)',
        border: '1px solid rgba(0,0,128,0.1)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[#000080]/60 font-medium">{title}</span>
        <Icon strokeWidth={2.5} className="size-5 text-[#000080]/40" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black text-[#000080] tracking-tight">
          {value.toLocaleString()}
        </span>
        {change && (
          <span className="text-sm font-bold text-[#000080]/40">{change}</span>
        )}
      </div>
    </div>
  );
}
