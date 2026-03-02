import { createClient } from "@/shared/infrastructure/supabase/server";
import { LandingPage } from "@/features/root-page/LandingPage";
import { DashboardPage } from "@/features/root-page/DashboardPage";
import { DashboardLayout } from "@/shared/ui/DashboardLayout";
import { FeedbackFab } from "@/shared/ui/FeedbackFab";
import { SupabaseCategoryRepository } from "@/category/infrastructure/SupabaseCategoryRepository";
import { GetCategoriesUseCase } from "@/category/application/GetCategoriesUseCase";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const categoryRepository = new SupabaseCategoryRepository(supabase);
  const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
  const categories = await getCategoriesUseCase.execute();

  const { category: categorySlug } = await searchParams;
  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;
  const categoryName = activeCategory?.name;

  const categoryItems = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    sortOrder: c.sortOrder,
  }));

  return (
    <DashboardLayout
      user={{
        email: user.email,
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
      }}
      categories={categoryItems}
    >
      <DashboardPage categoryName={categoryName} userId={user.id} />
      <FeedbackFab />
    </DashboardLayout>
  );
}
