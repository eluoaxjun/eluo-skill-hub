import Link from 'next/link';
import { createSupabaseServerClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseSkillRepository } from '@/skill-catalog/infrastructure/SupabaseSkillRepository';
import { GetSkillsUseCase } from '@/skill-catalog/application/GetSkillsUseCase';
import { Button } from '@/shared/ui/components/button';
import SkillTable from './SkillTable';
import SkillRegisterForm from './SkillRegisterForm';

export default async function SkillsPage() {
  const supabase = await createSupabaseServerClient();
  const skillRepository = new SupabaseSkillRepository(supabase);
  const getSkillsUseCase = new GetSkillsUseCase(skillRepository);

  const result = await getSkillsUseCase.execute();

  if (result.status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          스킬 목록을 불러오는 데 실패했습니다.
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin/skills">다시 시도</Link>
        </Button>
      </div>
    );
  }

  const skills = result.skills.map((skill) => ({
    id: skill.id,
    title: skill.title,
    category: skill.category.value,
    authorId: skill.authorId,
    createdAt: skill.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">스킬 관리</h1>
      <SkillRegisterForm />
      <div className="mt-8">
        <SkillTable skills={skills} />
      </div>
    </div>
  );
}
