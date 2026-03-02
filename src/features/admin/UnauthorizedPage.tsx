import React from "react";
import Link from "next/link";

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center space-y-4 p-8">
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width={64}
            height={64}
            className="text-red-500"
            aria-hidden
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          접근 권한이 없습니다
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          어드민 권한이 필요한 페이지입니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
