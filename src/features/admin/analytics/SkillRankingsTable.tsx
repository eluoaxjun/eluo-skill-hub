'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import type { SkillRankingItem } from '@/event-log/domain/types';

interface SkillRankingsTableProps {
  data: readonly SkillRankingItem[];
}

export default function SkillRankingsTable({ data }: SkillRankingsTableProps) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 flex items-center justify-center min-h-[200px]"
        style={{ background: 'rgba(0,0,128,0.05)', border: '1px solid rgba(0,0,128,0.1)' }}
      >
        <p className="text-[#000080]/40 font-medium">선택한 기간에 스킬 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'rgba(0,0,128,0.05)', border: '1px solid rgba(0,0,128,0.1)' }}
    >
      <h3 className="text-lg font-bold text-[#000080] mb-4">스킬 인기도 순위</h3>
      <div className="rounded-xl overflow-hidden border border-[#000080]/10">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#000080]/5 hover:bg-[#000080]/5">
              <TableHead className="text-[#000080]/60 font-semibold w-16 text-center">#</TableHead>
              <TableHead className="text-[#000080]/60 font-semibold">스킬명</TableHead>
              <TableHead className="text-[#000080]/60 font-semibold text-right">조회수</TableHead>
              <TableHead className="text-[#000080]/60 font-semibold text-right">다운로드</TableHead>
              <TableHead className="text-[#000080]/60 font-semibold text-right">북마크</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.skillId} className="hover:bg-[#000080]/3">
                <TableCell className="text-center font-bold text-[#000080]/60">{index + 1}</TableCell>
                <TableCell className="font-medium text-[#000080]">{item.skillTitle}</TableCell>
                <TableCell className="text-right text-[#000080]/80">{item.viewCount.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#000080]/80">{item.downloadCount.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#000080]/80">{item.bookmarkCount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
