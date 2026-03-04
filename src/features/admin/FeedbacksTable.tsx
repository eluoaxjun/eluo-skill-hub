import Link from 'next/link';
import type { FeedbackRow, PaginatedResult } from '@/admin/domain/types';
import { Star } from 'lucide-react';

interface FeedbacksTableProps {
  result: PaginatedResult<FeedbackRow>;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          strokeWidth={2.5}
          className={`size-3.5 ${i < rating ? 'fill-[#FEFE01] text-[#FEFE01]' : 'text-[#000080]/20'}`}
        />
      ))}
    </div>
  );
}

export default function FeedbacksTable({ result }: FeedbacksTableProps) {
  const { data, page, totalPages } = result;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#000080]/5">
        <h3 className="text-lg font-bold text-[#000080] mb-4">피드백 목록</h3>
        <p className="text-sm text-[#000080]/40 text-center py-8">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#000080]/5 overflow-hidden">
      <div className="p-6 border-b border-[#000080]/5">
        <h3 className="text-lg font-bold text-[#000080]">피드백 목록</h3>
        <p className="text-xs text-[#000080]/40 mt-1">전체 {result.totalCount.toLocaleString()}건</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#000080]/5">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">평점</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">코멘트</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">작성자</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">대상 스킬</th>
              <th className="px-6 py-3 text-xs font-bold text-[#000080]/50 uppercase tracking-wider">작성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#000080]/5">
            {data.map((feedback) => (
              <tr key={feedback.id} className="hover:bg-[#000080]/3 transition-colors">
                <td className="px-6 py-4">
                  <RatingStars rating={feedback.rating} />
                </td>
                <td className="px-6 py-4 text-sm text-[#000080]/70 max-w-xs">
                  {feedback.comment ? (
                    <p className="truncate">{feedback.comment}</p>
                  ) : (
                    <span className="text-[#000080]/30 italic">없음</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[#000080]/70">{feedback.userName}</td>
                <td className="px-6 py-4 text-sm text-[#000080]/70">{feedback.skillTitle}</td>
                <td className="px-6 py-4 text-sm text-[#000080]/60">
                  {new Date(feedback.createdAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#000080]/5 flex items-center justify-between">
        <p className="text-xs text-[#000080]/40">
          {page} / {totalPages} 페이지
        </p>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
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
                href={`?page=${pageNum}`}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  pageNum === page
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
              href={`?page=${page + 1}`}
              className="px-3 py-1.5 text-xs font-semibold text-[#000080] border border-[#000080]/20 rounded-lg hover:bg-[#000080]/5 transition-colors"
            >
              다음
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
