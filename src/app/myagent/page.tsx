import { createClient } from "@/shared/infrastructure/supabase/server";
import { DashboardLayout } from "@/shared/ui/DashboardLayout";
import { MyAgentPage } from "@/features/myagent/MyAgentPage";
import { SupabaseCategoryRepository } from "@/category/infrastructure/SupabaseCategoryRepository";
import { GetCategoriesUseCase } from "@/category/application/GetCategoriesUseCase";
import { SupabaseBookmarkRepository } from "@/bookmark/infrastructure/SupabaseBookmarkRepository";
import { GetBookmarkedSkillsUseCase } from "@/bookmark/application/GetBookmarkedSkillsUseCase";
import { SupabaseSkillRepository } from "@/skill-marketplace/infrastructure/SupabaseSkillRepository";
import { GetRecommendedSkillsUseCase } from "@/skill-marketplace/application/GetRecommendedSkillsUseCase";
import type { SkillViewModel } from "@/features/root-page/types";

export default async function MyAgentRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categoryRepository = new SupabaseCategoryRepository(supabase);
  const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
  const categories = await getCategoriesUseCase.execute();

  const categoryItems = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    sortOrder: c.sortOrder,
  }));

  let skills: SkillViewModel[] = [];
  let bookmarkedIds: string[] = [];

  if (user) {
    const bookmarkRepository = new SupabaseBookmarkRepository(supabase);
    const bookmarkUseCase = new GetBookmarkedSkillsUseCase(bookmarkRepository);
    const bookmarkedSkillIds = await bookmarkUseCase.execute(user.id);

    const skillRepository = new SupabaseSkillRepository(supabase);
    const skillUseCase = new GetRecommendedSkillsUseCase(skillRepository);
    const allSkills = await skillUseCase.execute();

    skills = allSkills
      .filter((skill) => bookmarkedSkillIds.includes(skill.id))
      .map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        icon: skill.icon,
        categoryName: skill.categories[0]?.name ?? '',
        markdownContent: skill.markdownContent,
        createdAt: skill.createdAt.toISOString(),
      }));

    bookmarkedIds = bookmarkedSkillIds;
  }

  return (
    <DashboardLayout
      user={{
        email: user?.email,
        avatarUrl: user?.user_metadata?.avatar_url as string | undefined,
      }}
      categories={categoryItems}
    >
      <MyAgentPage skills={skills} bookmarkedIds={bookmarkedIds} />
    </DashboardLayout>
  );
}
