'use client';

import { useState } from 'react';
import { deleteSkillAction } from './actions';
import { Button } from '@/shared/ui/components/button';

interface SkillRow {
  id: string;
  title: string;
  category: string;
  authorId: string;
  createdAt: string;
}

interface SkillTableProps {
  skills: SkillRow[];
}

export default function SkillTable({ skills }: SkillTableProps) {
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (skillId: string) => {
    setLoading(skillId);
    setMessage(null);

    const result = await deleteSkillAction(skillId);

    setLoading(null);

    if (result.status === 'success') {
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div>
      {message && (
        <div
          role="alert"
          className={`mb-4 rounded p-3 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span>{message.text}</span>
        </div>
      )}
      {skills.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          등록된 스킬이 없습니다.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                제목
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                작성자
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                생성일
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id} className="border-b">
                <td className="px-4 py-3 text-sm">{skill.title}</td>
                <td className="px-4 py-3 text-sm">{skill.category}</td>
                <td className="px-4 py-3 text-sm">{skill.authorId}</td>
                <td className="px-4 py-3 text-sm">
                  {new Date(skill.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={loading === skill.id}
                    onClick={() => handleDelete(skill.id)}
                  >
                    {loading === skill.id ? '삭제 중...' : '삭제'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
