import { DashboardShell } from "@/shared/ui/components/dashboard-shell";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { SupabaseSkillRepository } from "@/skill-catalog/infrastructure/SupabaseSkillRepository";
import { GetSkillsUseCase } from "@/skill-catalog/application/GetSkillsUseCase";
import type { SkillSummary } from "@/shared/ui/types/dashboard";
import type { JobCategory } from "@/shared/ui/types/dashboard";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userEmail = user?.email ?? "";

  // 실제 DB에서 스킬 목록 조회
  const skillRepository = new SupabaseSkillRepository(supabase);
  const getSkillsUseCase = new GetSkillsUseCase(skillRepository);
  const result = await getSkillsUseCase.execute();

  const skills: SkillSummary[] =
    result.status === "success"
      ? result.skills.map((skill) => ({
          id: skill.id,
          title: skill.title,
          category: skill.category.value as JobCategory,
          createdAt: skill.createdAt.toISOString(),
          markdownFilePath: skill.markdownFilePath,
        }))
      : [];

  return <DashboardShell userEmail={userEmail} skills={skills} />;
}
