import { getSkillById, getCategories } from '@/app/admin/skills/actions';
import SkillEditModal from '@/features/admin/SkillEditModal';
import Link from 'next/link';

interface EditSkillModalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillModalPage({ params }: EditSkillModalPageProps) {
  const { id } = await params;
  const [skillResult, categoriesResult] = await Promise.all([
    getSkillById(id),
    getCategories(),
  ]);

  if (!skillResult.success) {
    return (
      <div className="fixed inset-0 z-50 bg-[rgba(0,0,127,0.1)] backdrop-blur-[12px] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
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
    <SkillEditModal
      skillId={id}
      initialData={skillResult.skill}
      categories={categories}
    />
  );
}
