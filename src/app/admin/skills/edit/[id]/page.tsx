import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getSkillById, getCategories } from '@/app/admin/skills/actions';
import SkillAddForm from '@/features/admin/SkillAddForm';

interface EditSkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { id } = await params;
  const [skillResult, categoriesResult] = await Promise.all([
    getSkillById(id),
    getCategories(),
  ]);

  if (!skillResult.success) {
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <p className="text-lg font-bold text-slate-900 mb-2">스킬을 찾을 수 없습니다.</p>
          <p className="text-sm text-slate-500 mb-4">{skillResult.error}</p>
          <Link
            href="/admin/skills"
            className="inline-block px-6 py-2 bg-[#00007F] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const categories = categoriesResult.success ? categoriesResult.categories : [];

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
        <h1 className="text-2xl font-black text-slate-900 mb-6">스킬 수정하기</h1>
        <SkillAddForm
          categories={categories}
          mode="edit"
          skillId={id}
          initialData={skillResult.skill}
        />
      </div>
    </div>
  );
}
