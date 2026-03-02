'use client';

import React from 'react';
import type { SkillStatusValue } from '@/skill-marketplace/domain/value-objects/SkillStatus';

export interface ManagedSkillRow {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  markdownFilePath: string | null;
  status: SkillStatusValue;
  createdAt: Date;
}

interface SkillTableProps {
  skills: ManagedSkillRow[];
  onRowClick: (skill: ManagedSkillRow) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function StatusBadge({ status }: { status: SkillStatusValue }) {
  if (status === 'active') {
    return (
      <span
        data-testid="status-badge"
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
      >
        활성
      </span>
    );
  }
  return (
    <span
      data-testid="status-badge"
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
    >
      비활성
    </span>
  );
}

export function SkillTable({ skills, onRowClick }: SkillTableProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        등록된 스킬이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm text-slate-700">
        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">스킬명</th>
            <th className="px-6 py-3 text-left font-semibold">카테고리</th>
            <th className="px-6 py-3 text-left font-semibold">등록일</th>
            <th className="px-6 py-3 text-left font-semibold">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {skills.map((skill) => (
            <tr
              key={skill.id}
              className="hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => onRowClick(skill)}
            >
              <td className="px-6 py-4 font-medium">{skill.title}</td>
              <td className="px-6 py-4">{skill.categoryName}</td>
              <td className="px-6 py-4">{formatDate(skill.createdAt)}</td>
              <td className="px-6 py-4">
                <StatusBadge status={skill.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
