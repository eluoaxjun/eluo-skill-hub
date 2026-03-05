import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { GetSkillByIdUseCase } from '@/admin/application/get-skill-by-id-use-case';
import type { CategoryOption, GetSkillResult } from '@/admin/domain/types';
import SkillEditModal from '@/features/admin/SkillEditModal';
import Link from 'next/link';

interface EditSkillModalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillModalPage({ params }: EditSkillModalPageProps) {
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

  return (
    <SkillEditModal
      skillId={id}
      initialData={skillResult.skill}
      categories={categories}
    />
  );
}
