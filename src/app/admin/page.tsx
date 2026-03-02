import React from "react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          어드민 대시보드
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Eluo Skill Hub 관리 페이지입니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/admin/members"
            className="block p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:shadow-md transition-all group"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary mb-2">
              회원관리
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              가입된 사용자 목록을 조회하고 관리합니다.
            </p>
          </Link>

          <Link
            href="/admin/skills"
            className="block p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:shadow-md transition-all group"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary mb-2">
              스킬관리
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              등록된 스킬 목록을 조회하고 관리합니다.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
