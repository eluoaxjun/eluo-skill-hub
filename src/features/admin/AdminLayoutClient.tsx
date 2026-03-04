'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Menu, X } from 'lucide-react';

interface AdminLayoutClientProps {
  userName: string;
  userRole: string;
  children: React.ReactNode;
}

export default function AdminLayoutClient({ userName, userRole, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F0F0]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <AdminSidebar userName={userName} userRole={userRole} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">

        {/* Mobile header with hamburger */}
        <div className="flex items-center lg:hidden h-14 px-4 bg-white/50 border-b border-[#000080]/5 backdrop-blur-md sticky top-0 z-10">
          <button
            className="mr-3 size-9 rounded-xl flex items-center justify-center text-[#000080] hover:bg-[#000080]/5 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="메뉴 열기"
            type="button"
          >
            <Menu strokeWidth={2.5} className="size-5" />
          </button>
          <h2 className="text-base font-bold text-[#000080]">Admin</h2>
          {sidebarOpen && (
            <button
              className="ml-auto size-9 rounded-xl flex items-center justify-center text-[#000080] hover:bg-[#000080]/5 transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="메뉴 닫기"
              type="button"
            >
              <X strokeWidth={2.5} className="size-5" />
            </button>
          )}
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <AdminHeader />
        </div>

        {children}
      </main>
    </div>
  );
}
