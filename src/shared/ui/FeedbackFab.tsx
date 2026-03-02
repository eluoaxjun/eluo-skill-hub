import React from "react";
import { ContactSupportIcon } from "@/shared/ui/icons";

export function FeedbackFab() {
  return (
    <div className="fab-container fixed bottom-8 right-8 flex items-center group z-50">
      <div className="fab-label bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold py-1.5 px-3 rounded-md mr-3 shadow-lg whitespace-nowrap">
        플랫폼 개선 제안하기
      </div>
      <button className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all hover:scale-110 active:scale-95">
        <ContactSupportIcon size={20} />
      </button>
    </div>
  );
}
