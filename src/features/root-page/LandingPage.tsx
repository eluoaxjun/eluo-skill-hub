import Link from "next/link";
import { AutoAwesomeIcon } from "@/shared/ui/icons";
import { UnicornBackground } from "./components/UnicornBackground";

export function LandingPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <UnicornBackground />

      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div className="backdrop-blur-xs bg-white/5 dark:bg-slate-900/40 p-12 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-primary/20 backdrop-blur-md rounded-2xl ring-1 ring-primary/30">
              <AutoAwesomeIcon className="text-primary animate-pulse" size={48} />
            </div>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white mb-6 drop-shadow-sm">
            AI 스킬 허브
          </h1>

          <p className="text-xl text-slate-100 dark:text-slate-200 leading-relaxed mb-6 font-medium">
            웹 에이전시의 기획-디자인-퍼블리싱-개발-QA 워크플로우를 자동화하는 AI
            스킬 마켓플레이스
          </p>

          <p className="text-lg text-slate-200/80 dark:text-slate-400 leading-relaxed mb-12">
            각 직군별 반복 업무를 자동화하는 스킬을 검색하고, 설치하고, 바로
            실행하세요.
          </p>

          <div className="flex items-center justify-center gap-6">
            <Link
              href="/login"
              className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-base font-bold text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-10 py-4 bg-primary text-white rounded-2xl text-base font-bold hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/40 transform hover:scale-105"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
