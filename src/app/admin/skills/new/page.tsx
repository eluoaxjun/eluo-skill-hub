import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getCategories } from '@/app/admin/skills/actions';
import SkillAddForm from '@/features/admin/SkillAddForm';

export default async function NewSkillPage() {
  const result = await getCategories();
  const categories = result.success ? result.categories : [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/skills"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#000080] transition-colors"
        >
          <ChevronLeft size={16} />
          스킬 관리로 돌아가기
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-black text-slate-900 mb-6">새 스킬 추가하기</h1>
        <SkillAddForm categories={categories} />
      </div>
    </div>
  );
}
