import type { Metadata } from 'next';
import { getCurrentUser } from '@/shared/infrastructure/supabase/auth';
import MyAgentSkillGrid from '@/features/dashboard/MyAgentSkillGrid';

export const metadata: Metadata = {
  title: '내 에이전트',
};

export default async function MyAgentPage() {
  const { user } = await getCurrentUser();

  if (!user) return null;

  return <MyAgentSkillGrid userId={user.id} />;
}
