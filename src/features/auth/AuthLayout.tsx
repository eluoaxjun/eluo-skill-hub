import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-8">
        {/* Logo section */}
        <div className="mb-8 text-center">
          <h1 className="font-display font-bold text-xl text-foreground">
            AI 스킬 허브
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
