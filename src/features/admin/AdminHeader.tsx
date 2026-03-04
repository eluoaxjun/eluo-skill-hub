import { Bell, Settings, Search } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title = 'Dashboard Overview' }: AdminHeaderProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-8 sticky top-0 z-10"
      style={{
        background: 'rgba(255,255,255,0.5)',
        borderBottom: '1px solid rgba(0,0,128,0.05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h2 className="text-xl font-bold text-[#000080] font-eluo">{title}</h2>
      <div className="flex items-center gap-6">
        {/* Search (UI only) */}
        <div className="relative">
          <Search strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#000080]/40" />
          <input
            className="pl-9 pr-4 py-1.5 rounded-full border-none bg-[#000080]/5 focus:outline-none focus:ring-2 focus:ring-[#000080]/20 w-56 text-sm text-[#000080] placeholder:text-[#000080]/40"
            placeholder="통합 검색..."
            type="text"
            readOnly
          />
        </div>
        {/* Action buttons (UI only) */}
        <div className="flex items-center gap-3">
          <button
            className="size-9 rounded-full flex items-center justify-center bg-white border border-[#000080]/10 text-[#000080] relative"
            type="button"
            aria-label="알림"
          >
            <Bell strokeWidth={2.5} className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-[#FEFE01] rounded-full border border-white" />
          </button>
          <button
            className="size-9 rounded-full flex items-center justify-center bg-white border border-[#000080]/10 text-[#000080]"
            type="button"
            aria-label="설정"
          >
            <Settings strokeWidth={2.5} className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
