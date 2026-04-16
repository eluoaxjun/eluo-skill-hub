'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import SkillDetailModal from '@/features/skill-detail/SkillDetailModal';

interface SkillModalPageProps {
  params: Promise<{ id: string }>;
}

export default function SkillModalPage({ params }: SkillModalPageProps) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <SkillDetailModal
      skillId={id}
      onClose={() => router.back()}
    />
  );
}
