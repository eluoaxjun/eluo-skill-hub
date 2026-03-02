import React from 'react';
import { AdminSkillsPage } from '@/features/admin/AdminSkillsPage';
import { getAdminSkills, getSkillMarkdown } from './actions';
import type { ManagedSkillRow } from '@/features/admin/SkillTable';

export default async function AdminSkillsPageRoute() {
  const { skills } = await getAdminSkills();

  const initialSkills: ManagedSkillRow[] = skills.map((s) => ({
    id: s.id,
    title: s.title,
    categoryId: s.categoryId,
    categoryName: s.categoryName,
    markdownFilePath: s.markdownFilePath,
    status: s.status,
    createdAt: s.createdAt,
  }));

  return (
    <AdminSkillsPage
      initialSkills={initialSkills}
      getMarkdown={getSkillMarkdown}
    />
  );
}
