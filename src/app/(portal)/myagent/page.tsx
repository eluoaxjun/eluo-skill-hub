import { getCurrentUser } from '@/shared/infrastructure/supabase/auth';
import MyAgentSkillGrid from '@/features/dashboard/MyAgentSkillGrid';

export default async function MyAgentPage() {
  const { user } = await getCurrentUser();

  if (!user) return null;

  return <MyAgentSkillGrid userId={user.id} />;
}
