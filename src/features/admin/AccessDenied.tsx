import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F0]">
      <div
        className="rounded-2xl p-10 text-center max-w-sm w-full"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,128,0.1)',
        }}
      >
        <div className="mb-4 flex items-center justify-center">
          <div className="size-16 rounded-full flex items-center justify-center bg-[rgba(0,0,128,0.05)] border border-[rgba(0,0,128,0.1)]">
            <svg
              className="size-8 text-[#000080]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#000080] mb-2">접근 권한 없음</h2>
        <p className="text-sm text-[#000080]/60 mb-6">관리자 전용 페이지입니다</p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#000080] text-white text-sm font-semibold hover:bg-[#000080]/90 transition-colors"
        >
          대시보드로 이동
        </Link>
      </div>
    </div>
  );
}
