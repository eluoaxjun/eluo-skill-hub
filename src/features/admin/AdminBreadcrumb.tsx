'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from '@/shared/ui/icons/index';

const ADMIN_BREADCRUMB_MAP: Record<string, string> = {
  '/admin/members': '회원관리',
  '/admin/skills': '스킬관리',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const tabLabel = ADMIN_BREADCRUMB_MAP[pathname] ?? '어드민';

  return (
    <div className="flex items-center gap-2 text-slate-500">
      <span className="text-sm font-medium">어드민</span>
      <ChevronRightIcon size={16} />
      <span className="text-sm font-semibold text-slate-900 dark:text-white">
        {tabLabel}
      </span>
    </div>
  );
}
