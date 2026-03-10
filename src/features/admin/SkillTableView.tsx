'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { SkillRow } from '@/admin/domain/types';
import { useDeleteSkill } from '@/admin/hooks/use-admin-mutations';
import SkillDeleteConfirmDialog from '@/features/admin/SkillDeleteConfirmDialog';
import CategoryIcon from '@/features/admin/CategoryIcon';

interface SkillTableViewProps {
  skills: SkillRow[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function SkillTableView({ skills }: SkillTableViewProps) {
  const [deleteTarget, setDeleteTarget] = useState<SkillRow | null>(null);
  const { mutate: deleteSkillMutation, isPending: isDeleting } = useDeleteSkill();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSkillMutation(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success('스킬이 삭제되었습니다');
          setDeleteTarget(null);
        } else {
          toast.error(result.error);
        }
      },
      onError: () => {
        toast.error('스킬 삭제 중 오류가 발생했습니다');
      },
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="pb-3 pr-4">제목</th>
            <th className="pb-3 pr-4">카테고리</th>
            <th className="pb-3 pr-4">버전</th>
            <th className="pb-3 pr-4">상태</th>
            <th className="pb-3 pr-4">태그</th>
            <th className="pb-3 pr-4">생성일</th>
            <th className="pb-3 pr-4">수정일</th>
            <th className="pb-3 text-right">액션</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr
              key={skill.id}
              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
            >
              <td className="py-4 pr-4 font-bold text-slate-900">{skill.title}</td>
              <td className="py-4 pr-4">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <CategoryIcon icon={skill.categoryIcon} size={14} />
                  {skill.categoryName}
                </span>
              </td>
              <td className="py-4 pr-4">
                <span className="px-2 py-0.5 bg-[#00007F]/10 text-[#00007F] text-[10px] font-semibold rounded-full">
                  v{skill.version}
                </span>
              </td>
              <td className="py-4 pr-4">
                {skill.status === 'published' ? (
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Published
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
                    Draft
                  </span>
                )}
              </td>
              <td className="py-4 pr-4">
                <div className="flex flex-wrap gap-1">
                  {skill.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 text-[10px] font-medium rounded-full text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                  {skill.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] text-slate-400">
                      +{skill.tags.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 pr-4 text-slate-400 text-xs">{formatDate(skill.createdAt)}</td>
              <td className="py-4 pr-4 text-slate-400 text-xs">{formatDate(skill.updatedAt)}</td>
              <td className="py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/skills/edit/${skill.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(skill)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deleteTarget && (
        <SkillDeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          skillTitle={deleteTarget.title}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
