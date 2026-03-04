import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PaginatedResult, SkillRow, SkillStatusFilter } from '@/admin/domain/types';
import SkillCard from './SkillCard';
import SkillStatusFilterTabs from './SkillStatusFilter';

interface SkillsCardGridProps {
  result: PaginatedResult<SkillRow>;
  currentStatus: SkillStatusFilter;
  searchQuery?: string;
  searchInput: ReactNode;
}

function buildPageUrl(pageNum: number, searchQuery?: string, currentStatus?: SkillStatusFilter): string {
  const params = new URLSearchParams();
  params.set('page', String(pageNum));
  if (searchQuery) params.set('q', searchQuery);
  if (currentStatus && currentStatus !== 'all') params.set('status', currentStatus);
  return `?${params.toString()}`;
}

export default function SkillsCardGrid({ result, currentStatus, searchQuery, searchInput }: SkillsCardGridProps) {
  const { data, page, totalPages, totalCount } = result;

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">스킬 관리</h2>
          <p className="text-slate-500 mt-1">기업 내 등록된 모든 AI 스킬 및 에이전트 현황입니다.</p>
        </div>
        <SkillStatusFilterTabs currentStatus={currentStatus} />
      </div>

      {/* Search input */}
      <div className="mb-6">{searchInput}</div>

      {/* Card grid */}
      {data.length === 0 ? (
        <div className="space-y-4">
          <div className=" border border-white/30  rounded-2xl p-12 text-center">
            {searchQuery ? (
              <p className="text-slate-500 font-medium">검색 결과가 없습니다</p>
            ) : (
              <p className="text-slate-400 font-medium">등록된 스킬이 없습니다</p>
            )}
          </div>
          <Link
            href="/admin/skills/new"
            className="block border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-[#000080] hover:border-[#000080] hover:bg-[#000080]/5 transition-all group min-h-[160px]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-[#000080]/10 flex items-center justify-center mb-4 transition-colors">
              <span className="text-4xl font-thin leading-none">+</span>
            </div>
            <p className="font-bold">새 스킬 추가하기</p>
            <p className="text-xs mt-1">새로운 AI 어시스턴트를 등록하세요</p>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
          {/* Add new skill placeholder card */}
          <Link
            href="/admin/skills/new"
            className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-[#000080] hover:border-[#000080] hover:bg-[#000080]/5 transition-all group min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-[#000080]/10 flex items-center justify-center mb-4 transition-colors">
              <span className="text-4xl font-thin leading-none">+</span>
            </div>
            <p className="font-bold">새 스킬 추가하기</p>
            <p className="text-xs mt-1">새로운 AI 어시스턴트를 등록하세요</p>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-[#000080]/40">
            전체 {totalCount.toLocaleString()}개 · {page} / {totalPages} 페이지
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1, searchQuery, currentStatus)}
                className="px-3 py-1.5 text-xs font-semibold text-[#000080] border border-[#000080]/20 rounded-lg hover:bg-[#000080]/5 transition-colors"
              >
                이전
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Link
                  key={pageNum}
                  href={buildPageUrl(pageNum, searchQuery, currentStatus)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${pageNum === page
                    ? 'bg-[#000080] text-white'
                    : 'text-[#000080] border border-[#000080]/20 hover:bg-[#000080]/5'
                    }`}
                >
                  {pageNum}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1, searchQuery, currentStatus)}
                className="px-3 py-1.5 text-xs font-semibold text-[#000080] border border-[#000080]/20 rounded-lg hover:bg-[#000080]/5 transition-colors"
              >
                다음
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
