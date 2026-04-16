'use client';

import { use } from 'react';
import SkillDetailModal from '@/features/skill-detail/SkillDetailModal';
import { useRouter } from 'next/navigation';

interface SkillDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <SkillDetailModal
      skillId={id}
      onClose={() => router.push('/dashboard')}
    />
  );
}
