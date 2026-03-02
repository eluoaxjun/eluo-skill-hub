'use client';

import React, { useState } from 'react';
import { SkillTable } from './SkillTable';
import { SkillPreviewModal } from './SkillPreviewModal';
import type { ManagedSkillRow } from './SkillTable';

interface AdminSkillsPageProps {
  initialSkills: ManagedSkillRow[];
  getMarkdown: (markdownFilePath: string) => Promise<{ content: string } | { error: string }>;
}

export function AdminSkillsPage({ initialSkills, getMarkdown }: AdminSkillsPageProps) {
  const [selectedSkill, setSelectedSkill] = useState<ManagedSkillRow | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">스킬관리</h1>
        </div>

        <SkillTable
          skills={initialSkills}
          onRowClick={(skill) => setSelectedSkill(skill)}
        />

        <SkillPreviewModal
          isOpen={selectedSkill !== null}
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          getMarkdown={getMarkdown}
        />
      </div>
    </div>
  );
}
