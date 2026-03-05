import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetSkillByIdUseCase } from '@/admin/application/get-skill-by-id-use-case';
import type { CategoryOption, GetSkillResult } from '@/admin/domain/types';
import SkillAddForm from '@/features/admin/SkillAddForm';

interface EditSkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { id } = await params;

  // 인증은 admin layout에서 처리됨 — 바로 데이터 조회
  const repository = new SupabaseAdminRepository();
  const [skillResult, categories] = await Promise.all([
    (async (): Promise<GetSkillResult> => {
      try {
        const useCase = new GetSkillByIdUseCase(repository);
        return useCase.execute(id);
      } catch {
        return { success: false, error: '스킬 조회 중 오류가 발생했습니다.' };
      }
    })(),
    repository.getCategories().catch((): CategoryOption[] => []),
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
