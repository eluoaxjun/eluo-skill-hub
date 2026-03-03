export function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-8 animate-pulse">
        {/* Logo / title area */}
        <div className="mb-8 text-center space-y-2">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
        </div>

        {/* Field 1 */}
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-11 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>

          {/* Field 2 */}
          <div className="space-y-1">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-11 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>

          {/* Button */}
          <div className="h-12 w-full bg-primary/30 rounded-lg" />

          {/* Link */}
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
